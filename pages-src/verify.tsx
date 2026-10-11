import { createRoot } from "react-dom/client";
import { VerifyView } from "../app/verify-view";
import { verifyPayload } from "../lib/receipt";

const root = document.getElementById("root");
if (root) {
  const params = new URLSearchParams(window.location.search);
  const payload = params.get("p") ?? "";
  const signature = params.get("s") ?? "";
  const checked = payload && signature ? verifyPayload(payload, signature) : null;
  createRoot(root).render(<VerifyView checked={checked} backHref="index.html" />);
}
