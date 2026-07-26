import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSignInForm } from "./AdminSignInForm";
import { isAdminSignedIn, normalizeAdminNextPath } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Admin sign-in | Famous Land",
  description: "Sign in to the Famous Land owner and admin workspaces.",
  robots: { index: false, follow: false }
};

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = (await searchParams) ?? {};
  const requestedNext = Array.isArray(params.next) ? params.next.at(-1) : params.next;
  const nextPath = normalizeAdminNextPath(requestedNext);

  if (await isAdminSignedIn()) redirect(nextPath);

  return <AdminSignInForm nextPath={nextPath} />;
}
