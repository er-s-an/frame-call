import { verifyPayload } from "../../lib/receipt";
import { VerifyView } from "../verify-view";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; s?: string }>;
}) {
  const params = await searchParams;
  const payload = params.p ?? "";
  const signature = params.s ?? "";
  const checked = payload && signature ? verifyPayload(payload, signature) : null;
  return <VerifyView checked={checked} />;
}
