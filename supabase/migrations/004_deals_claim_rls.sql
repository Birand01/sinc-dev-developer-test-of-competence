-- Sales claim: allow updating unassigned deals (owner_id IS NULL) so owner_id can become auth.uid().
-- Mirrors conversation_threads threads_update (assigned_to null → self).
-- Application: UpdateDealOwnerService + canClaimDeal; PATCH /api/deals/:dealId/owner.

drop policy if exists deals_update on public.deals;

create policy deals_update on public.deals
  for update to authenticated
  using (
    public.is_manager()
    or (public.is_sales() and (owner_id = auth.uid() or owner_id is null))
  )
  with check (
    public.is_manager()
    or (public.is_sales() and owner_id = auth.uid())
  );
