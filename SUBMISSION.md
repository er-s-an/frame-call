# Frame Call submission

Taste-grounded music and shot decisions for a brand film. Remove Qloo and there is nothing to call.

This file is the English packet. Paste `DEVPOST.md` into Devpost. Speak `DEMO.md` if someone records the optional two-minute clip. License is MIT at `LICENSE`.

Do not click Submit from this file. This machine has no `QLOO_API_KEY`. The public demo stays on the fixture banner.

## Links

| | |
| --- | --- |
| Try it out | https://er-s-an.github.io/frame-call/ |
| Repository | https://github.com/er-s-an/frame-call |
| License | MIT. GitHub About shows MIT License. File: `LICENSE`. |
| Checked | 2026-10-11, commit `8068c9fcd20290d17147dbeca0ff5fc60e1ecabf` |

That host is GitHub Pages, source `/docs` on `main`, status `built`. There is no server and no `QLOO_API_KEY`. The fixture runs in the browser. The banner says FIXTURE. IDs start with `fixture:`. The signed summary is checked in the browser with the demo receipt key that already ships in the repository. It is not the Qloo key. The anonymous Vercel URL expired at 2026-10-10 21:20 UTC. Do not paste it.

## What collapses without Qloo

The left column can still say Lo-fi and "Slow push-in. Warm bokeh." It has no entity ID. These steps on the right cannot:

- `GET /search` never resolves a destination or a brand, so there is no signal.
- `GET /v2/tags` never attaches.
- `GET /v2/insights` never returns an artist or a movie, and explainability never returns contributor scores.
- The 0.10 rule has nothing to measure, so both calls stay withdrawn.
- There is nothing to sign.

Adjectives are not a call. The contrast brief is the on-screen proof: a Tokyo record shop withdraws to Nothing to call, and the coffee entities are not reused.

## Judge path, two minutes

No login. Open https://er-s-an.github.io/frame-call/ . If the banner says FIXTURE, say the IDs were written for the demo. Do not show an API key or an `X-Api-Key` header. Devpost does not require a video. `DEMO.md` is the spoken script for the same path.

1. The Hong Kong coffee brief is already loaded: `香港独立咖啡品牌，要一条 15 秒的开业片`. Left: Lo-fi, slow push-in, warm bokeh, no ID. Right: Hong Kong and The Coffee Academics in. Tatsuro Yamashita out at affinity 0.74, contributors 0.61 and 0.33. In the Mood for Love out at affinity 0.69, contributors 0.72 and 0.22. The rule on the slip is a contributor of at least 0.10.
2. Open Request trace. Fixture rows say NOT SENT. Read the two insights rows: `urn:entity:artist` and `urn:entity:movie`, both with `feature.explainability=true`. On this host every row says NOT SENT.
3. Click Contrast brief. The line becomes `东京唱片店，要一条 15 秒的片`. The right side says Nothing to call. Nothing to sign. The coffee entities are gone. Say this line is the control, not a second city.
4. Click Demo scene. Click Signed summary of these IDs. The page says HOLDS. Mode says "Fixture. Not a live Qloo response." The music ID `fixture:artist:tatsuro-yamashita` and the camera ID `fixture:movie:in-the-mood-for-love` match the slip. Say the signature is a demo key in the repo, not the Qloo key.
5. Close on the line: remove Qloo and the right column has nothing to commit.

Walked on the public URL on 2026-10-11. The page requested only `er-s-an.github.io`. `GET /api/call` on that host is 404. The in-page link opens `verify.html`. `GET /verify` on Pages also returns that file. `GET /verify/` is 404, so use the link.

## Devpost

**Title:** Frame Call

**Tagline:** Taste-grounded music and shot decisions for a brand film. Remove Qloo and there is nothing to call.

**Try it out:** https://er-s-an.github.io/frame-call/

**Repository:** https://github.com/er-s-an/frame-call

**License:** MIT

**Built with:** Next.js, TypeScript, Qloo Hackathon API (`GET /search`, `GET /v2/tags`, `GET /v2/insights` with `feature.explainability=true`).

The long description, including the fixture sentence, the collapse list, the MIT line, and the two-minute path, is the paste block in `DEVPOST.md`.

## Repo and Pages

Compared on 2026-10-11, before this packet edit. Local `main`, `origin/main`, and GitHub `main` were `8068c9fcd20290d17147dbeca0ff5fc60e1ecabf`. Pages `html_url` is https://er-s-an.github.io/frame-call/ . This packet edit does not change `docs/`. These files matched byte for byte between `docs/` in that commit and the live host:

- `index.html`
- `verify.html`
- `client.js`
- `verify.js`
- `globals.css`
- `.nojekyll`

The live banner is: "FIXTURE. QLOO_API_KEY is not set. IDs starting with fixture: and the scores under them were written for this demo. They are not a Qloo response."

## Deploy

`npm run pages` rebuilds `docs/` from this directory. The browser runs the fixture. It does not call Qloo.

A logged-in Vercel host is still the path for a live key. This machine is logged out, and `vercel login` needs a person. To publish later:

```bash
npx vercel login
npx vercel link
npx vercel env add QLOO_API_KEY production
npx vercel --prod
```

Skip `env add` to publish fixture mode. The banner will say FIXTURE. Do not prefix the variable with `NEXT_PUBLIC_`. Cloudflare steps are in `README.md`. This machine did not deploy there. Set the key with `npx wrangler secret put QLOO_API_KEY`, not in a config file.

After the key is on a server, `npm run probe` checks live `/search`, `/v2/tags`, and `/v2/insights` and prints counts only. It does not print the key. This machine printed nothing this round because `QLOO_API_KEY` is unset. Do not relabel fixture scores as live.

## Checklist

Done in this tree:

- [x] Product is Frame Call. The right column commits only from search, tags, insights, and explainability. Threshold 0.10.
- [x] Second brief is the contrast withdrawal. It does not search a second city.
- [x] Fixture mode runs with no key. Banner says FIXTURE. IDs start with `fixture:`.
- [x] `QLOO_API_KEY` is server-only. It is not in the repository.
- [x] English README, Devpost paste, two-minute path, and `DEMO.md`.
- [x] MIT `LICENSE` at the repository root, and GitHub About shows MIT License.
- [x] Public fixture demo: https://er-s-an.github.io/frame-call/
- [x] Public repository matches Pages for the six files above.
- [x] Judge path clicked on that URL: commit, trace NOT SENT, contrast withdrawal, restore, HOLDS.

Still a person:

- [ ] Join https://qloo.devpost.com/
- [ ] Paste the Pages URL into Try it out. Paste `DEVPOST.md` into the description. Paste the repository URL.
- [ ] Leave the video field empty unless someone records `DEMO.md`.
- [ ] Submit on Devpost before Oct 30, 2026, 11:45pm EDT. Do not treat this file as that click.
- [ ] Put the hackathon key on a server only if a live banner is required. Then run `npm run probe`. If it prints `PROBE_THIN`, keep the product shape and do not relabel fixture scores as live.

## What this does not claim

No customer, no revenue, no sync license, no personal taste profile, and no proof the film will work. The receipt key in the repo is a demo key. It is not the Qloo key. The Wong Kar-wai line under the film title is local knowledge about that title. It has no separate entity ID on the slip. No demo video was rendered for this packet.
