"use client";

import { useState, type ChangeEvent } from "react";
import type { ScanReportFilters, ScanReportPlayerOption, ScanTimelineUnit } from "@/lib/db";

type ReportFiltersProps = {
  zoneOptions: string[];
  filters: ScanReportFilters;
  playerOptions: ScanReportPlayerOption[];
  summary: string;
};

export function ReportFilters({
  zoneOptions,
  filters,
  playerOptions,
  summary
}: ReportFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const summaryItems = [
    { label: "Date range", value: `${formatDateInput(filters.start_date)} to ${formatDateInput(filters.end_date)}` },
    { label: "Grouping", value: timelineUnitLabel(filters.unit) },
    { label: "Zone", value: selectedSummary(filters.zones, "All zones", "zones") },
    { label: "Player", value: selectedSummary(filters.player_emails.map(playerEmailLabel), "All players", "players") },
    { label: "Scan type", value: filters.include_tests ? "Test scans included" : "Test scans hidden" }
  ];
  const selectedZones = new Set(filters.zones);
  const selectedPlayers = new Set(filters.player_emails);

  function handleTimelineUnitChange(event: ChangeEvent<HTMLSelectElement>) {
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <section className="report-filter-card" aria-label="Dashboard filters">
      <div className="report-filter-summary">
        <div>
          <span>Filters</span>
          <strong className="sr-only">{summary}</strong>
          <div className="report-filter-chip-row" aria-hidden="true">
            {summaryItems.map((item) => (
              <span className="report-filter-chip" key={item.label}>
                <b>{item.label}</b>
                {item.value}
              </span>
            ))}
          </div>
        </div>
        <button
          aria-controls="dashboard-filter-form"
          aria-expanded={expanded}
          className="filter-toggle-button"
          type="button"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Hide filters" : "Edit filters"}
        </button>
      </div>

      {expanded ? (
        <form className="report-filter-form" action="/admin" id="dashboard-filter-form" method="get">
          <label>
            <span>Start date</span>
            <input name="start_date" type="date" defaultValue={filters.start_date} />
          </label>
          <label>
            <span>End date</span>
            <input name="end_date" type="date" defaultValue={filters.end_date} />
          </label>
          <label>
            <span>Timeline unit</span>
            <select name="unit" defaultValue={filters.unit} onChange={handleTimelineUnitChange}>
              {(["day", "week", "month"] satisfies ScanTimelineUnit[]).map((unit) => (
                <option key={unit} value={unit}>
                  {unit[0].toUpperCase() + unit.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <MultiSelectFilter
            emptyLabel="All zones"
            label="Zone"
            name="zone"
            options={zoneOptions.map((zone) => ({ label: zone, value: zone }))}
            selectedValues={selectedZones}
          />
          <MultiSelectFilter
            emptyLabel="All players"
            label="Player"
            name="player_email"
            options={playerOptions}
            selectedValues={selectedPlayers}
          />
          <label className="report-filter-checkbox">
            <input name="include_tests" type="hidden" value="0" />
            <input
              name="include_tests"
              type="checkbox"
              value="1"
              defaultChecked={filters.include_tests}
            />
            <span>Include test scans</span>
          </label>
          <div className="report-filter-actions">
            <button className="button primary compact-button" type="submit">
              Apply filters
            </button>
            <a className="button secondary compact-button" href="/admin">
              Reset
            </a>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function MultiSelectFilter({
  emptyLabel,
  label,
  name,
  options,
  selectedValues
}: {
  emptyLabel: string;
  label: string;
  name: string;
  options: { label: string; title?: string; value: string }[];
  selectedValues: Set<string>;
}) {
  const selectedCount = selectedValues.size;
  const summary = selectedCount === 0 ? emptyLabel : `${selectedCount} selected`;

  return (
    <fieldset className="report-filter-multiselect">
      <legend>{label}</legend>
      <details>
        <summary>
          <span>{summary}</span>
        </summary>
        <div className="report-filter-option-panel">
          <p>{selectedCount === 0 ? emptyLabel : `${selectedCount} selected. Uncheck any item to remove it.`}</p>
          <div className="report-filter-option-list">
            {options.map((option) => (
              <label key={option.value} title={option.title}>
                <input
                  defaultChecked={selectedValues.has(option.value)}
                  name={name}
                  type="checkbox"
                  value={option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </details>
    </fieldset>
  );
}

function selectedSummary(values: string[], emptyLabel: string, pluralLabel: string) {
  if (values.length === 0) {
    return emptyLabel;
  }

  if (values.length === 1) {
    return values[0];
  }

  return `${values.length} ${pluralLabel}`;
}

function playerEmailLabel(value: string) {
  return value === "unknown" ? "Unknown" : value;
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
