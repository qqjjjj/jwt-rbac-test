/**
 * Filters an object to only include columns the user has permission to see
 * Used by controllers to filter response data based on role permissions
 *
 * @param data - The object to filter
 * @param allowedColumns - Set of column names the user can see
 * @returns Filtered object with only allowed columns
 */
export function filterColumns<T extends Record<string, any>>(
  data: T,
  allowedColumns: Set<string>
): Partial<T> {
  const filtered: any = {};

  for (const key in data) {
    if (allowedColumns.has(key)) {
      filtered[key] = data[key];
    }
  }

  return filtered;
}
