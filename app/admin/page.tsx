import type { Metadata } from "next";
import { AdminReports } from "@/components/AdminReports";
import type { ScanReportFilterInput } from "@/lib/db";

export const metadata: Metadata = {
  title: "Famous Land Admin",
  description: "Dashboard for Famous Land game scans, testing, and map building."
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  const filters: ScanReportFilterInput = {
    start_date: firstParam(params.start_date),
    end_date: firstParam(params.end_date),
    unit: firstParam(params.unit),
    zone: params.zone,
    player_id: params.player_id,
    include_tests: includeTestsParam(params.include_tests),
    log_page: firstParam(params.log_page)
  };

  return (
    <div className="stack admin-page">
      <AdminReports filters={filters} />
    </div>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[value.length - 1] : value;
}

function includeTestsParam(value: string | string[] | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];
  return values.includes("1");
}
