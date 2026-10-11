# Devpost paste sheet

Do not click Submit from this file. Do not attach a screenshot of an API key, a terminal, or a network panel that shows `X-Api-Key`.

This host has no server and no `QLOO_API_KEY`. The banner says FIXTURE. IDs start with `fixture:`. The scores were written for the demo. They are not a Qloo response. Paste the Pages URL below. The anonymous Vercel URL expired at 2026-10-10 21:20 UTC. Do not paste it.

Devpost does not require a video. A two-minute spoken script is in `DEMO.md`. No recording ships with this packet.

## Fields

| Devpost field | Paste |
| --- | --- |
| Project name | Frame Call |
| Tagline | Taste-grounded music and shot decisions for a brand film. Remove Qloo and there is nothing to call. |
| Try it out | https://er-s-an.github.io/frame-call/ |
| Source code | https://github.com/er-s-an/frame-call |
| License | MIT. The `LICENSE` file is in the repository root. GitHub About shows MIT License. |
| Built with | Next.js, TypeScript, Qloo Hackathon API (`GET /search`, `GET /v2/tags`, `GET /v2/insights` with `feature.explainability=true`) |
| Video | Leave empty. |

## Description

Paste from here through the license line.

Frame Call is a one-screen desk for a 15-second brand opening film. A producer pastes one brief. The left column is a generic answer with no entity IDs: Lo-fi, a slow push-in, warm bokeh. The right column is a Qloo slip. It commits a music call and a camera call only when the taste graph returns entities and an explainability path.

Try it, no login: https://er-s-an.github.io/frame-call/

The public page is fixture mode. The banner reads: "FIXTURE. QLOO_API_KEY is not set. IDs starting with fixture: and the scores under them were written for this demo. They are not a Qloo response." GitHub Pages serves static files from this repository. The browser does not call `hackathon.api.qloo.com`. A live host would set `QLOO_API_KEY` on the server only, and the banner would say LIVE for that request. This URL does not.

The demo brief is a Hong Kong independent coffee brand, 15 seconds. The agent resolves Hong Kong (destination) and The Coffee Academics (brand) with `GET /search`, a coffee tag with `GET /v2/tags`, then calls `GET /v2/insights` twice with `feature.explainability=true`: once for `urn:entity:artist` and once for `urn:entity:movie`. A commit needs a contributor score of at least 0.10 from an input entity. On this fixture the slip shows Tatsuro Yamashita (affinity 0.74; Hong Kong 0.61, The Coffee Academics 0.33) and In the Mood for Love (affinity 0.69; Hong Kong 0.72, The Coffee Academics 0.22). The signed summary repeats those IDs. The signature uses a demo key that ships in the repository. It is not the Qloo key, and it does not prove the film will work. The director credit under the film title is local knowledge about that title. It is not a Qloo score.

There is a second brief, and only one. It is a Tokyo record shop, 15 seconds. It is the contrast, not a second city. The right column withdraws: Nothing to call. The coffee entities are not reused. Nothing is signed.

What collapses without Qloo:

- `GET /search` never resolves a destination or a brand, so there is no signal.
- `GET /v2/tags` never attaches.
- `GET /v2/insights` never returns an artist or a movie, and explainability never returns contributor scores.
- The 0.10 rule has nothing to measure, so both calls stay withdrawn.
- There is nothing to sign.

The left column can still print adjectives. That is the point. Adjectives are not a call.

Judge path, about two minutes, on https://er-s-an.github.io/frame-call/ :

1. Read the banner. It says FIXTURE. The brief is already filled in. Left: Lo-fi, and "Slow push-in. Warm bokeh.", labeled No ID. Right: Hong Kong and The Coffee Academics in, Tatsuro Yamashita and In the Mood for Love out, each with contributor scores. The rule on the slip is 0.10.
2. Open Request trace. Every row says NOT SENT, including two `/search` rows, one `/v2/tags` row, and two `/v2/insights` rows (`urn:entity:artist` and `urn:entity:movie`, both with `feature.explainability=true`).
3. Click Contrast brief. The line becomes a Tokyo record shop. The right side says Nothing to call and Nothing to sign. The coffee entities are gone. This line is the control.
4. Click Demo scene. Click Signed summary of these IDs. The page says HOLDS. Mode says "Fixture. Not a live Qloo response." The music ID and the camera ID match the slip.
5. Close on the line under the left column: take Qloo away and that column is all that remains.

Built for the Qloo Agentic Hackathon. Experimental. Aggregate affinity is not a viewer profile, a sync license, or a prediction that the opening film will work.

License: MIT. https://github.com/er-s-an/frame-call/blob/main/LICENSE
