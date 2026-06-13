import type { CSSProperties, ReactNode } from "react";
import { getScanReport } from "@/lib/db";
import { ReportFilters } from "@/components/ReportFilters";
import type { ScanReportFilterInput, ScanReportFilters, ScanTimelineUnit } from "@/lib/db";

const easternDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit"
});

export async function AdminReports({ filters }: { filters?: ScanReportFilterInput }) {
  const report = await getScanReport(filters);
  const maxTimelineCount = Math.max(1, ...report.timeline.map((bucket) => bucket.count));
  const chartMax = niceChartMax(maxTimelineCount);
  const chartTicks = [chartMax, Math.round(chartMax / 2), 0];
  const filterSummary = formatFilterSummary(report.filters);

  return (
    <div className="analytics-dashboard">
      <section className="dashboard-page-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1>Dashboard</h1>
        </div>
      </section>

      <ReportFilters
        zoneOptions={report.zone_options}
        filters={report.filters}
        playerOptions={report.player_options}
        summary={filterSummary}
      />

      <section className="report-stat-grid" aria-label="Game scan rollups">
        <ReportStat label="Total scans" value={report.total_scans} detail="All scan events logged" />
        <ReportStat label="Unique players" value={report.unique_phones} detail="Unique players seen" />
        <ReportStat
          label="Identified players"
          value={report.identified_players}
          detail="Players with email or phone"
        />
        <ReportStat
          compact
          label="Latest scan"
          value={report.latest_scan_at ? formatEasternDateTime(report.latest_scan_at) : "None yet"}
          detail="Eastern time"
        />
      </section>

      <section className="card report-timeline-card">
        <div className="split report-section-head">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>{timelineUnitLabel(report.filters.unit)} scan volume</h2>
          </div>
          <span>{report.timeline_label}</span>
        </div>
        <div className="scan-chart">
          <div className="scan-chart-axis" aria-hidden="true">
            {chartTicks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
          <div className="scan-chart-plot">
            <div className="scan-chart-grid" aria-hidden="true">
              {chartTicks.map((tick) => (
                <span key={tick} />
              ))}
            </div>
            <div className="scan-timeline" aria-label={`Weekly scan timeline, ${report.timeline_label}`}>
              {report.timeline.map((bucket) => {
                const height =
                  bucket.count === 0 ? 2 : Math.max(8, (bucket.count / chartMax) * 100);

                return (
                  <div
                    className="scan-timeline-bucket"
                    key={bucket.start_date}
                    title={`${bucket.start_date} to ${bucket.end_date}: ${bucket.count} scans`}
                  >
                    <span className="scan-timeline-value">{bucket.count || ""}</span>
                    <span
                      aria-label={`${bucket.label}: ${bucket.count} scans`}
                      className="scan-timeline-bar"
                      style={{ "--bar-height": `${height}%` } as CSSProperties}
                    />
                    <small>{bucket.label}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="card report-log-card">
        <div className="split report-section-head">
          <div>
            <p className="eyebrow">Log</p>
            <h2>Scan log</h2>
          </div>
          <span>{report.log.length ? "Latest 200 scans" : "No scans yet"}</span>
        </div>
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Date/time (ET)</th>
                <th>Email ID</th>
                <th>Phone ID</th>
                <th>Location</th>
                <th>Zone</th>
                <th>Scan Type</th>
              </tr>
            </thead>
            <tbody>
              {report.log.length ? (
                report.log.map((scan) => (
                  <tr key={scan.id}>
                    <td>{formatEasternDateTime(scan.scanned_at)}</td>
                    <td>
                      {scan.email_id ? <code title={scan.email_id}>{scan.email_id}</code> : "UNKNOWN"}
                    </td>
                    <td>
                      <code title={scan.player_id}>{shortPhoneId(scan.player_id)}</code>
                    </td>
                    <td>
                      <strong>{scan.location}</strong>
                      <small>{scan.short_code}</small>
                    </td>
                    <td>{scan.zone}</td>
                    <td>
                      <span className={scan.is_test ? "scan-type test" : "scan-type real"}>
                        {scan.is_test ? "Test" : "Real"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No scan log entries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ReportStat({
  label,
  value,
  detail,
  compact = false
}: {
  label: string;
  value: ReactNode;
  detail: string;
  compact?: boolean;
}) {
  return (
    <article className={compact ? "report-stat-card compact-stat" : "report-stat-card"}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function formatEasternDateTime(isoDate: string) {
  return easternDateTimeFormatter.format(new Date(isoDate));
}

function formatFilterSummary(filters: ScanReportFilters) {
  return [
    `${formatDateInput(filters.start_date)} to ${formatDateInput(filters.end_date)}`,
    timelineUnitLabel(filters.unit),
    filters.zone || "All zones",
    filters.player_id ? shortPhoneId(filters.player_id) : "All players",
    filters.include_tests ? "Test scans included" : "Test scans hidden"
  ].join(" · ");
}

function formatDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function timelineUnitLabel(unit: ScanTimelineUnit) {
  if (unit === "day") {
    return "Daily";
  }

  if (unit === "month") {
    return "Monthly";
  }

  return "Weekly";
}

function niceChartMax(value: number) {
  if (value <= 10) {
    return 10;
  }

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const rounded =
    normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;

  return rounded * magnitude;
}

function shortPhoneId(phoneId: string) {
  return phoneId.length > 12 ? `${phoneId.slice(0, 8)}...` : phoneId;
}
