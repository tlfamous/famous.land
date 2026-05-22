"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { resetLocalPlayerData } from "@/lib/localPlayer";
import type { Zone } from "@/lib/types";

type TestMarker = {
  marker_id: string;
  marker_number: number;
  marker_name: string;
  order: number;
  url: string;
  zone: Zone;
  path: string;
};

type MarkerQrCode = {
  markerId: string;
  dataUrl: string;
};

function testPhoneSrc(path: string) {
  return `${path}${path.includes("?") ? "&" : "?"}scan_source=tester`;
}

function markerButtonClass(markerId: string, activeMarkerId: string, clickedMarkerIds: Set<string>) {
  return [
    "test-marker-button",
    clickedMarkerIds.has(markerId) ? "clicked" : "",
    activeMarkerId === markerId ? "active" : ""
  ]
    .filter(Boolean)
    .join(" ");
}

export function TestPhone({ markers }: { markers: TestMarker[] }) {
  const [activePath, setActivePath] = useState<string | null>(null);
  const [phoneIsOn, setPhoneIsOn] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [qrCode, setQrCode] = useState<MarkerQrCode | null>(null);
  const [clickedMarkerIds, setClickedMarkerIds] = useState<Set<string>>(() => new Set());

  const activeMarker = useMemo(
    () => (phoneIsOn && activePath ? markers.find((marker) => marker.path === activePath) : undefined),
    [activePath, markers, phoneIsOn]
  );
  const activeMarkerId = activeMarker?.marker_id ?? "";
  const activeQrDataUrl =
    activeMarker && qrCode?.markerId === activeMarker.marker_id ? qrCode.dataUrl : "";

  const loadMarker = useCallback(
    (marker: TestMarker) => {
      setClickedMarkerIds((current) => {
        const next = new Set(current);
        next.add(marker.marker_id);
        return next;
      });
      setActivePath(marker.path);
      setPhoneIsOn(true);
      setFrameKey((current) => current + 1);
    },
    []
  );

  const resetPhone = useCallback(() => {
    resetLocalPlayerData();
    setClickedMarkerIds(new Set());
    setActivePath(null);
    setPhoneIsOn(false);
    setFrameKey((current) => current + 1);
  }, []);

  useEffect(() => {
    setActivePath(null);
    setPhoneIsOn(false);
    setClickedMarkerIds(new Set());
    setFrameKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!activeMarker) {
      setQrCode(null);
      return () => {
        cancelled = true;
      };
    }

    setQrCode(null);
    QRCode.toDataURL(activeMarker.url, {
      color: {
        dark: "#11140f",
        light: "#fffaf0"
      },
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrCode({
            dataUrl,
            markerId: activeMarker.marker_id
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrCode(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeMarker]);

  return (
    <div className="test-lab">
      <aside className="card test-sidebar">
        <div className="split test-sidebar-head">
          <div>
            <h2>click one of the locations below to test</h2>
          </div>
          <button className="button secondary" type="button" onClick={resetPhone}>
            Reset Simulated Phone
          </button>
        </div>

        <div className="test-marker-buttons" aria-label="Marker QR codes">
          {markers.map((marker) => (
            <button
              aria-pressed={clickedMarkerIds.has(marker.marker_id)}
              className={markerButtonClass(marker.marker_id, activeMarkerId, clickedMarkerIds)}
              key={marker.marker_id}
              type="button"
              onClick={() => loadMarker(marker)}
            >
              <span>{String(marker.marker_number).padStart(2, "0")}</span>
              <strong>{marker.marker_name}</strong>
              <small>{marker.zone}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="test-phone-panel" aria-label="iPhone browser">
        <div className="test-phone-display">
          <p className="test-phone-label">Simulated Phone</p>
          <div className="test-phone-shell">
            <div className="test-phone-camera" aria-hidden="true" />
            {phoneIsOn && activePath ? (
              <iframe
                className="test-phone-screen"
                key={`${frameKey}-${activePath}`}
                src={testPhoneSrc(activePath)}
                title={`Famous Land test phone ${activePath}`}
              />
            ) : (
              <div
                aria-label="Simulated phone is off"
                className="test-phone-screen test-phone-screen-off"
                key={`off-${frameKey}`}
                role="img"
              />
            )}
          </div>
        </div>
      </section>

      <aside className="card test-qr-panel" aria-label="Active marker QR code">
        {activeMarker ? (
          <>
            <div className="test-qr-compact">
              <div
                className="test-tag-scene"
                data-animation-key={`${activeMarker.marker_id}-${frameKey}`}
                key={`${activeMarker.marker_id}-${frameKey}`}
              >
                {activeQrDataUrl ? (
                  <>
                    <figure className="test-printed-tag">
                      <img
                        alt={`Printed Famous Land marker tag for ${activeMarker.marker_name}`}
                        className="test-tag-artwork"
                        src="/assets/famous-marker-tag.png"
                      />
                      <span className="test-tag-qr-frame" aria-hidden="true">
                        <img className="test-tag-qr" src={activeQrDataUrl} alt="" />
                      </span>
                      <span className="sr-only">QR code for {activeMarker.marker_name}</span>
                    </figure>
                    <div className="test-tag-callout" aria-hidden="true">
                      <span>Scan QR Code to play with your phone</span>
                    </div>
                  </>
                ) : (
                  <div className="test-qr-placeholder">Generating QR</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="test-qr-empty">
            <h2>QR preview</h2>
            <p>Click a marker location to show its scannable QR code here.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
