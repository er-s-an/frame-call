import { runCall } from "../lib/agent";
import { CONTRAST_BRIEF, DEMO_BRIEF } from "../lib/parse";
import { Studio } from "./studio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Page() {
  const initial = await runCall(DEMO_BRIEF);
  return <Studio initial={initial} demoBrief={DEMO_BRIEF} contrastBrief={CONTRAST_BRIEF} />;
}
