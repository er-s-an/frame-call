# Frame Call submission

Taste-grounded music and shot decisions for a brand film. Remove Qloo and there is nothing to call.

This file is the English packet. The runnable app is `app/` in the competition workspace and the root of the public repository. Paste `DEVPOST.md` (workspace path `app/DEVPOST.md`) into Devpost. Walk `DEMO.md` for the two-minute demo. License is MIT at `LICENSE`.

Public fixture demo: https://er-s-an.github.io/frame-call/

Repository: https://github.com/er-s-an/frame-call

That host is GitHub Pages. There is no server and no `QLOO_API_KEY`. The fixture runs in the browser. The banner says FIXTURE. IDs start with `fixture:`. The signed summary is checked in the browser with the demo receipt key that already ships in the repository. It is not the Qloo key. The anonymous Vercel URL expired at 2026-10-10 21:20 UTC. This file is not a Devpost entry and not a live Qloo call. Do not click Submit.

## Devpost

**Title:** Frame Call

**Tagline:** Taste-grounded music and shot decisions for a brand film. Remove Qloo and there is nothing to call.

**Description:**

Frame Call is a one-screen desk for a 15-second brand opening film. A producer pastes one brief. The left column is a generic answer with no entity IDs: Lo-fi, a slow push-in, warm bokeh. The right column is a Qloo slip. It commits a music call and a camera call only when the taste graph returns entities and an explainability path.

The demo brief is a Hong Kong independent coffee brand. The agent resolves Hong Kong (destination) and The Coffee Academics (brand) with GET /search, a coffee tag with GET /v2/tags, then calls GET /v2/insights twice with feature.explainability=true: once for urn:entity:artist and once for urn:entity:movie. A commit requires a contributor score of at least 0.10 from an input entity. The slip shows the entity IDs, the affinity, and those scores. A signed summary on /verify repeats the IDs. The signature uses a demo key that ships in the repository. It is not the Qloo key, and it does not prove the film will work.

There is a second brief, and only one. It is a Tokyo record shop, 15 seconds. It is the contrast, not a second city. The right column withdraws: Nothing to call. The coffee entities are not reused. Nothing is signed.

What collapses without Qloo:

- /search never resolves a destination or a brand, so there is no signal.
- /v2/tags never attaches.
- /v2/insights never returns an artist or a movie, and explainability never returns contributor scores.
- The 0.10 rule has nothing to measure, so both calls stay withdrawn.
- There is nothing to sign.

The left column can still print adjectives. That is the point. Adjectives are not a call.

How to try it, no login:

1. Open the site. Read the banner. FIXTURE means QLOO_API_KEY is not set and the IDs start with fixture:. LIVE means this request hit hackathon.api.qloo.com. The public Pages demo has no server, so it stays on FIXTURE.
2. The demo brief is already filled in. The left column has no IDs. The right column names the entities and the scores.
3. Open the request trace.
4. Click Contrast brief. The right side says Nothing to call.
5. Click Demo scene to restore the slip.
6. Open the signed summary. It should say HOLDS.

The Qloo key stays on the server as QLOO_API_KEY. It is not a NEXT_PUBLIC_ variable and it is not in the repository. Without a key the public demo still runs, in fixture mode, and the banner says so.

Built for the Qloo Agentic Hackathon. Experimental. Aggregate affinity is not a viewer profile, a sync license, or a prediction that the opening film will work.

License: MIT.

**Built with:** Next.js, TypeScript, Qloo Hackathon API (GET /search, GET /v2/tags, GET /v2/insights with feature.explainability=true).

## Demo script

About two minutes. No login. If the banner says FIXTURE, say the IDs were written for the demo. Do not show the API key or the `X-Api-Key` header.

1. The Hong Kong coffee brief is already loaded. Left: Lo-fi, slow push-in, warm bokeh, no ID. Right: Hong Kong and The Coffee Academics in; Tatsuro Yamashita and In the Mood for Love out, each with contributor scores. The rule on the slip is 0.10.
2. Open the request trace. Fixture rows say NOT SENT. Live rows say SENT. Read the two insights rows: artist and movie, both with feature.explainability=true.
3. Click Contrast brief. The line becomes a Tokyo record shop. The right side says Nothing to call. No signature. The coffee entities are gone. Say this line is the control, not a second city.
4. Click Demo scene. Open Signed summary of these IDs. The page says HOLDS and repeats the same entity IDs. Say the signature is a demo key in the repo, not the Qloo key.
5. Close on the line: remove Qloo and the right column has nothing to commit.

## Deploy

The public URL above is fixture mode on GitHub Pages (`docs/` on `main`). `npm run pages` rebuilds that folder. The browser runs the fixture. It does not call Qloo.

The anonymous Vercel deploy expired at 2026-10-10 21:20 UTC. This machine is logged out, and `vercel login` needs a person. To publish a logged-in Vercel host later:

```bash
npx vercel login
npx vercel link
npx vercel env add QLOO_API_KEY production
npx vercel --prod
```

Skip `env add` to publish fixture mode. The banner will say FIXTURE. Do not prefix the variable with `NEXT_PUBLIC_`. Cloudflare steps are in `README.md`. This machine did not deploy there: Wrangler was logged out, and Wrangler 4.149 wants Node.js 22. Set the key with `npx wrangler secret put QLOO_API_KEY`, not in a config file.

After the key is on the server, `npm run probe` checks live `/search`, `/v2/tags`, and `/v2/insights` and prints counts only. It does not print the key.

## Checklist

Done in this tree:

- [x] Product is Frame Call. Not Taste Gate, not a chat.
- [x] Right column commits only from search, tags, insights, and explainability. Threshold 0.10.
- [x] Second brief is the contrast withdrawal. It does not search a second city.
- [x] Fixture mode runs with no key. Banner says FIXTURE. IDs start with `fixture:`.
- [x] Live mode does not fall back to fixture bodies. Covered by tests with a fake fetch.
- [x] `QLOO_API_KEY` is server-only. `.env.example` is empty. `.env` and `.env.local` are gitignored.
- [x] Responses that echo the key are withheld.
- [x] English README, Devpost text, and demo script.
- [x] MIT `LICENSE` at the app root.
- [x] `vercel.json` plus Vercel and Cloudflare steps.
- [x] Public fixture demo: https://er-s-an.github.io/frame-call/ . Banner says FIXTURE. The fixture runs in the browser. No key is on that host.
- [x] Public Git repository: https://github.com/er-s-an/frame-call with MIT `LICENSE`.

Still a person:

- [x] Durable public fixture URL: https://er-s-an.github.io/frame-call/ . The anonymous Vercel deploy expired at 2026-10-10 21:20 UTC. This machine could not `vercel login`, so `npx vercel --prod` was not run.
- [ ] Join https://qloo.devpost.com/
- [ ] Put the hackathon key in the host environment. Do not commit it.
- [ ] Run `npm run probe` on a machine that has the key. If it prints `PROBE_THIN`, keep the product shape and do not relabel fixture scores as live.
- [ ] Paste https://er-s-an.github.io/frame-call/ . Do not paste the expired Vercel URL.
- [ ] Submit on Devpost before the deadline. No login on the demo. No video is required. Do not treat this file as a click on Submit.

## What this does not claim

No customer, no revenue, no sync license, no personal taste profile, and no proof the film will work. The receipt key in the repo is a demo key. It is not the Qloo key.
