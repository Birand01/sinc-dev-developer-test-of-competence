# POST `/api/conversations` — RLS debug notu

`POST /api/conversations` endpoint’i implement edildikten sonra test sırasında yaşanan **500 Internal Server Error** ve çözümün özeti.

## Ne test ediliyordu?

- **Endpoint:** `POST /api/conversations`
- **Kullanıcı:** `sales@studentcrm.test` (JWT ile authenticated)
- **Akış:** Yeni `conversation_threads` satırı + ilk `conversation_messages` satırı (`CreateConversationService`)

Beklenen: **201 Created** + thread JSON.

## Belirti

- PowerShell: `{"code":"INTERNAL_SERVER_ERROR","error":"Internal Server Error"}`
- Wrangler log:

```text
Failed to create conversation thread: new row violates row-level security policy
for table "conversation_threads"
```

Hata `ConversationThreadRepository.create()` içinde, message insert’e gelinmeden önce oluşuyordu.

## Yanıltıcı izlenimler (denenenler)

| Deneme | Sonuç | Not |
|--------|--------|-----|
| Eski / expired JWT | 401 veya RLS | `JWT expired` ayrı sorun; fresh token şart |
| `threads_insert_staff` policy güncelleme (`EXISTS` → `is_sales() OR is_manager()`) | Policy doğru görünüyor | `is_sales` RPC aynı token ile `True` |
| SQL Editor’da `INSERT` (`role postgres`) | Başarılı | Postgres rolü **RLS bypass** eder; API testi değildir |
| `GRANT INSERT` on `conversation_threads` | Zaten vardı | Sorun grant değildi |
| `GET /api/me`, `GET /api/conversations` | 200 | Auth + SELECT policy çalışıyordu |
| Message insert’i comment etme önerisi | Gerek kalmadı | Log zaten **thread** adımında patlıyordu |

## Kırılma noktası (asıl teşhis)

Aynı **fresh token** ile PostgREST testleri:

1. **`Prefer: return=representation`** ile insert → `42501` RLS hatası
2. **Return olmadan** insert → hata yok
3. SQL’de `subject = 'direct-postgrest-fresh-token'` → **satır var**

Sonuç: **INSERT başarılı**, ancak insert sonrası satırı geri okuma (RETURNING / `.select('*').single()`) SELECT policy yüzünden başarısız oluyor. Client tarafı bunu genelde insert hatası gibi görüyor.

Repository’deki problematik pattern:

```ts
.insert({ ... })
.select('*')
.single();
```

## Çözüm

`ConversationThreadRepository.create()` ve `ConversationMessageRepository.create()` güncellendi:

1. `crypto.randomUUID()` ile `id` üret
2. Sadece `insert` (`.select()` yok)
3. Ayrı sorgu: `getById(id)` ile oku ve domain entity’ye map et

Böylece insert ile read ayrıldı; PostgREST “insert + immediate return” SELECT policy tuzağından kaçınıldı.

**Dokunulmayanlar:** RLS migration’ları, `CreateConversationService`, `conversations.ts` route handler.

## Doğrulama

- `POST /api/conversations` → thread JSON (ör. `id: 0deaee6b-...`, `status: open`)
- SQL: `conversation_messages` içinde aynı `thread_id` ile mesaj (`sender_type: team`, body eşleşiyor)

## Kısa ders

- `is_sales() = true` ve policy doğru olsa bile **insert().select()** ayrı bir başarısızlık üretebilir.
- SQL Editor (postgres rolü) ile API (authenticated + RLS) testleri **karıştırılmamalı**.
- Supabase/PostgREST hatalarında mümkünse **doğrudan REST insert** (return’li / return’süz) ile DB vs API ayrıştırılmalı.

## İlgili dosyalar

- `BackEnd/Crm.Infrastructure/src/repositories/ConversationThreadRepository.ts`
- `BackEnd/Crm.Infrastructure/src/repositories/ConversationMessageRepository.ts`
- `BackEnd/Crm.Application/src/services/conversations/CreateConversationService.ts`
- `BackEnd/Crm.Api/src/routes/conversations.ts`
- `supabase/migrations/002_rls_policies.sql` (`threads_insert_staff`, `threads_select`, `messages_insert`)
