import type { Metadata } from "next";
import { RecoverLinkClient } from "@/components/RecoverLinkClient";

export const metadata: Metadata = {
  title: "Recover Progress | Famous Land"
};

type RecoverCodePageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function RecoverCodePage({ params }: RecoverCodePageProps) {
  const { code } = await params;
  return <RecoverLinkClient recoveryCode={code} />;
}
