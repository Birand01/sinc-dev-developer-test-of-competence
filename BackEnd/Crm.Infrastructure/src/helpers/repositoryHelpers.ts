/**
 * Shared repository helpers for Supabase query results.
 * Keeps repetitive error/null/list mapping logic in one place.
 */

/** Throws a contextual Error when Supabase returns an error object. */
export function throwIfSupabaseError(
  error: { message: string } | null,
  context: string,
): void {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

/** Maps rows to domain entities, returning [] when no rows are present. */
export function mapRowsOrEmpty<TRow, TEntity>(
  rows: TRow[] | null,
  mapper: (row: TRow) => TEntity,
): TEntity[] {
  if (!rows?.length) {
    return [];
  }
  return rows.map(mapper);
}

/** Maps a maybe-single row to an entity, returning null when row is absent. */
export function mapMaybeSingle<TRow, TEntity>(
  row: TRow | null,
  mapper: (row: TRow) => TEntity,
): TEntity | null {
  if (!row) {
    return null;
  }
  return mapper(row);
}
