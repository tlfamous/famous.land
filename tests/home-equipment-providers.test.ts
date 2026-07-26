import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  normalizeEcoNetReading,
  normalizeMopekaReading,
  ProviderRequestError
} from "../lib/property-ops/equipment-providers";

test("normalizes a Mopeka cloud reading without retaining the raw response", () => {
  const reading = normalizeMopekaReading(
    {
      Value: { N: "0.392" },
      Timestamp: { N: "1785070800000" },
      Temp: { N: "25" },
      BatteryLevel: { N: "3.34" },
      Quality: { N: "100" },
      Source: { S: "bridge-1" }
    },
    {
      address: "sensor-1",
      name: "Main propane tank",
      tankHeight: 0.54,
      tankType: "250gal",
      vertical: false
    },
    "2026-07-26T13:01:00.000Z"
  );

  assert.equal(reading.externalDeviceId, "sensor-1");
  assert.equal(reading.sourceUpdatedAt, "2026-07-26T13:00:00.000Z");
  assert.equal(reading.metrics.batteryVoltage, 3.34);
  assert.equal(reading.metrics.signalQuality, 100);
  assert.equal(reading.metrics.bridgeId, "bridge-1");
  assert.equal(typeof reading.metrics.fillPercent, "number");
  assert.equal(typeof reading.metrics.estimatedGallons, "number");
  assert.equal("raw" in reading.metrics, false);
});

test("normalizes the read-only EcoNet water-heater fields", () => {
  const reading = normalizeEcoNetReading(
    {
      serial_number: "heater-1",
      device_type: "WH",
      "@NAME": { value: "Basement water heater" },
      "@CONNECTED": true,
      "@MODE": {
        value: 3,
        status: "High Demand",
        constraints: { enumText: ["Off", "Energy Saver", "Heat Pump", "High Demand"] }
      },
      "@SETPOINT": { value: 120 },
      "@RUNNING": "Compressor Running",
      "@HOTWATER": "ic_tank_hundread_percent_v2.png",
      "@TANK": { value: 100 },
      "@COMBUSTION": { value: 100 },
      "@VALVESTATUS": { title: "Shut-OFF Valve - Open" },
      "@ALERTCOUNT": 0,
      "@ENABLED": { value: 1 }
    },
    {
      location_id: "location-1",
      "@LOCATION_NAME": "63 Pine Eden"
    },
    "2026-07-26T13:01:00.000Z"
  );

  assert.equal(reading.externalDeviceId, "heater-1");
  assert.equal(reading.externalLocationName, "63 Pine Eden");
  assert.equal(reading.online, true);
  assert.equal(reading.metrics.mode, "High Demand");
  assert.equal(reading.metrics.setPointF, 120);
  assert.equal(reading.metrics.hotWaterPercent, 100);
  assert.equal(reading.metrics.shutoffValveOpen, true);
  assert.equal(reading.metrics.alertCount, 0);
});

test("rejects malformed provider payloads instead of guessing device identity", () => {
  assert.throws(
    () => normalizeEcoNetReading({ "@CONNECTED": true }, {}),
    ProviderRequestError
  );
  assert.throws(
    () => normalizeMopekaReading({}, {}),
    ProviderRequestError
  );
});

test("the EcoNet adapter contains no equipment-control request path", async () => {
  const source = await readFile(
    new URL("../lib/property-ops/equipment-providers.ts", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(source, /dynamicAction/i);
  assert.doesNotMatch(source, /mqtt/i);
  assert.doesNotMatch(source, /device\/desired/i);
  assert.doesNotMatch(source, /method:\s*["'](?:PUT|PATCH|DELETE)["']/);
});
