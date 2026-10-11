import { createRoot } from "react-dom/client";
import { Studio } from "../app/studio";
import { runCall } from "../lib/agent";
import { CONTRAST_BRIEF, DEMO_BRIEF } from "../lib/parse";

async function main() {
  const root = document.getElementById("root");
  if (!root) return;
  try {
    const initial = await runCall(DEMO_BRIEF, { apiKey: null });
    createRoot(root).render(
      <Studio
        initial={initial}
        demoBrief={DEMO_BRIEF}
        contrastBrief={CONTRAST_BRIEF}
        readBrief={(brief) => runCall(brief, { apiKey: null })}
        receiptPath="verify.html"
      />,
    );
  } catch (cause) {
    const banner = document.createElement("p");
    banner.className = "banner fixture";
    banner.textContent = cause instanceof Error ? cause.message : "The fixture failed to start.";
    root.replaceChildren(banner);
  }
}

void main();
