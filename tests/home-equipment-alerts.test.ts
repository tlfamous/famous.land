import assert from "node:assert/strict";
import test from "node:test";
import {
  isLowPropaneAlertActive,
  isMopekaSourceStale,
  shouldOpenUnavailableAlert
} from "../lib/property-ops/equipment-monitoring";

test("low propane opens below 30 percent and resolves at 35 percent", () => {
  assert.equal(isLowPropaneAlertActive(29.9, false), true);
  assert.equal(isLowPropaneAlertActive(30, false), false);
  assert.equal(isLowPropaneAlertActive(34.9, true), true);
  assert.equal(isLowPropaneAlertActive(35, true), false);
});

test("Mopeka source freshness uses a six-hour boundary", () => {
  const observedAt = "2026-07-26T13:00:00.000Z";
  assert.equal(
    isMopekaSourceStale(observedAt, "2026-07-26T07:00:00.000Z"),
    false
  );
  assert.equal(
    isMopekaSourceStale(observedAt, "2026-07-26T06:59:59.000Z"),
    true
  );
  assert.equal(isMopekaSourceStale(observedAt, undefined), true);
});

test("connection alerts require two failures unless authentication fails", () => {
  assert.equal(shouldOpenUnavailableAlert(1, false), false);
  assert.equal(shouldOpenUnavailableAlert(2, false), true);
  assert.equal(shouldOpenUnavailableAlert(3, true), false);
});
