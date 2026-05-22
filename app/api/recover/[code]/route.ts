import { NextResponse } from "next/server";
import { recoverProgressByCode } from "@/lib/db";

export const runtime = "nodejs";

type RecoverCodeRouteContext = {
  params: Promise<{
    code: string;
  }>;
};

export async function POST(_request: Request, { params }: RecoverCodeRouteContext) {
  const { code } = await params;
  const result = await recoverProgressByCode(code);

  if (result.mode === "not_found") {
    return NextResponse.json(
      {
        ok: false,
        ...result
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    ...result
  });
}
