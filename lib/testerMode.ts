export const TESTER_SCAN_SOURCE = "tester";

export function isTesterScanSource(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.includes(TESTER_SCAN_SOURCE);
  }

  return value === TESTER_SCAN_SOURCE;
}
