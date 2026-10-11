import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(root, "docs");
const browserReceipt = path.join(root, "lib/receipt.browser.ts");

function receiptPlugin() {
  return {
    name: "receipt-browser",
    setup(build) {
      build.onResolve({ filter: /(^|\/)receipt$/ }, () => ({ path: browserReceipt }));
    },
  };
}

const shell = (title, script, fallback) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="Music and camera for a brand film, committed only when the Qloo taste graph names them." />
  <link rel="stylesheet" href="globals.css" />
</head>
<body>
  <div id="root">${fallback}</div>
  <noscript><p class="banner fixture">FIXTURE. This demo runs in the browser. Enable JavaScript to read the brief.</p></noscript>
  <script src="${script}"></script>
</body>
</html>
`;

mkdirSync(docs, { recursive: true });

await esbuild.build({
  absWorkingDir: root,
  entryPoints: {
    client: "pages-src/client.tsx",
    verify: "pages-src/verify.tsx",
  },
  outdir: docs,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  jsx: "automatic",
  minify: true,
  legalComments: "none",
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [receiptPlugin()],
});

copyFileSync(path.join(root, "app/globals.css"), path.join(docs, "globals.css"));
writeFileSync(path.join(docs, ".nojekyll"), "");
writeFileSync(
  path.join(docs, "index.html"),
  shell(
    "Frame Call",
    "client.js",
    `<main class="page"><p class="banner fixture" role="status">FIXTURE. QLOO_API_KEY is not set. IDs starting with fixture: and the scores under them were written for this demo. They are not a Qloo response.</p></main>`,
  ),
);
writeFileSync(
  path.join(docs, "verify.html"),
  shell(
    "Signed summary · Frame Call",
    "verify.js",
    `<main class="page verify"><p class="banner fixture" role="status">FIXTURE. Checking the signed summary in this browser.</p></main>`,
  ),
);

const privateMarkers = ["BEGIN PRIVATE KEY", "BEGIN RSA PRIVATE KEY", "QLOO_API_KEY="];
for (const name of ["client.js", "verify.js", "index.html", "verify.html", "globals.css"]) {
  const text = readFileSync(path.join(docs, name), "utf8");
  for (const marker of privateMarkers) {
    if (text.includes(marker)) {
      throw new Error(`${name} contains ${marker}`);
    }
  }
}

console.log("Wrote docs/ for GitHub Pages. Fixture mode. No API key.");
