import { NextResponse } from "next/server";
import { runCall } from "../../../lib/agent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const live = Boolean(process.env.QLOO_API_KEY?.trim());
  return NextResponse.json({ mode: live ? "live" : "fixture", keyConfigured: live });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { brief?: unknown } | null;
  const brief = body && typeof body.brief === "string" ? body.brief : "";
  const result = await runCall(brief);
  const key = process.env.QLOO_API_KEY?.trim();
  if (key && JSON.stringify(result).includes(key)) {
    return NextResponse.json(
      {
        ok: false,
        mode: "live",
        status: "upstream-error",
        message: "The response was withheld because it contained the API key.",
      },
      { status: 500 },
    );
  }
  return NextResponse.json(result);
}
