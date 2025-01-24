export function isEmptyStringOrNil(value: string | null | undefined): boolean {
  return value == null || value === "";
}
