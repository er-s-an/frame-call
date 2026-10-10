# Devpost description

Paste the sections below into the Devpost submission. Do not add a screenshot that shows an API key.

Do not paste this paragraph. The fixture demo is https://temporary-spry-marsh-vhqvnvx.vercel.app until 2026-10-10 21:20 UTC. The banner says FIXTURE. There is no `QLOO_API_KEY` on that server. The deployment is anonymous. Claim it or replace it with a durable URL before you put a link on Devpost. Do not put the claim link in Devpost or in git. The steps below match that host.

## Title

Frame Call

## Tagline

Taste-grounded music and shot decisions for a brand film. Remove Qloo and there is nothing to call.

## Description

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

1. Open the site. Read the banner. FIXTURE means the server has no QLOO_API_KEY and the IDs start with fixture:. LIVE means this request hit hackathon.api.qloo.com.
2. The demo brief is already filled in. The left column has no IDs. The right column names the entities and the scores.
3. Open the request trace.
4. Click Contrast brief. The right side says Nothing to call.
5. Click Demo scene to restore the slip.
6. Open the signed summary. It should say HOLDS.

The Qloo key stays on the server as QLOO_API_KEY. It is not a NEXT_PUBLIC_ variable and it is not in the repository. Without a key the public demo still runs, in fixture mode, and the banner says so.

Built for the Qloo Agentic Hackathon. Experimental. Aggregate affinity is not a viewer profile, a sync license, or a prediction that the opening film will work.

License: MIT.

## Built with

Next.js, TypeScript, Qloo Hackathon API (GET /search, GET /v2/tags, GET /v2/insights with feature.explainability=true).
