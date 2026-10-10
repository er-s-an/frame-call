# Frame Call

Music and camera for a 15-second brand film. The right-hand slip commits only when the Qloo taste graph names the entities and an explainability path clears 0.10. Remove Qloo and that slip has nothing to call.

The page is one screen. It is not a chat.

## What collapses without Qloo

The left column can still say Lo-fi and "Slow push-in. Warm bokeh." It has no entity ID. These steps on the right cannot:

1. `GET /search` never resolves the destination or the brand.
2. `GET /v2/tags` never attaches a tag.
3. `GET /v2/insights?feature.explainability=true` never returns an artist or a movie, and never returns contributor scores.
4. The 0.10 rule has nothing to measure, so music and camera both stay withdrawn.
5. There is nothing to sign.

## Two briefs

Only two lines are authored.

| Button | Line | Result |
| --- | --- | --- |
| Demo scene | 香港独立咖啡品牌，要一条 15 秒的开业片 | Commits, when the graph has a path. A Hong Kong independent coffee brand, 15-second opening film. |
| Contrast brief | 东京唱片店，要一条 15 秒的片 | Withdraws. A Tokyo record shop, 15 seconds. Not a second city. The coffee entities are not reused, and Tokyo is not searched. |

Anything else withdraws the same way: Nothing to call.

On the demo slip the category is anchored to The Coffee Academics, because the sentence names a category and not a brand. Live mode searches that name and keeps the ID `/search` returns. It does not keep the fixture ID.

## Run

Node.js 20 or newer. Run the commands in this directory. In the competition workspace that directory is `app/`. The public repository root is this directory.

```bash
npm install
npm test
npm run probe
npm run dev
```

Open http://localhost:3000.

`npm run probe` calls the live API only when `QLOO_API_KEY` is set. With no key it prints `PROBE_SKIPPED` and sends nothing. The site keeps working in fixture mode.

For a judge, build first so the dev indicator is gone:

```bash
npm run build
npm start
```

## Fixture and live

The banner is always on.

**Fixture.** `QLOO_API_KEY` is missing or empty. IDs start with `fixture:`. Scores were written for this demo. They are not a Qloo measurement. The trace says NOT SENT. Fixture text is never labeled LIVE.

**Live.** A non-empty `QLOO_API_KEY` switches the server to `https://hackathon.api.qloo.com`. Requests are GET with header `X-Api-Key`. Paths:

- `GET /search?query=&types=&take=`
- `GET /v2/tags?filter.query=&take=`
- `GET /v2/insights?filter.type=&signal.interests.entities=&signal.interests.tags=&feature.explainability=true&take=`

`filter.type` is `urn:entity:artist` and `urn:entity:movie`. Signals are a destination and a brand, so the call is cross-category.

Live mode searches the Hong Kong coffee brief only. The contrast brief does not search. An empty search, a bad key, two failed insights calls, or entities with no contributor score withdraw the decision. Failure does not fall back to the fixture, and fixture IDs are never labeled LIVE.

The key is read on the server from `QLOO_API_KEY`. The browser receives a summary. The route refuses to send a JSON body that still contains the key. Do not use the name `NEXT_PUBLIC_QLOO_API_KEY`.

Copy `.env.example` to `.env.local` for a local key. Both `.env` and `.env.local` are gitignored. The example file has an empty value.

## Deploy

The key stays in the host's environment, not in `vercel.json` and not in the client bundle. Home, `/api/call`, and `/verify` run on the Node.js runtime because the receipt uses `node:crypto`.

### Public fixture demo

https://temporary-spry-marsh-vhqvnvx.vercel.app

Checked on 2026-10-10. `GET /api/call` returns `{"mode":"fixture","keyConfigured":false}`. The banner says FIXTURE. That host has no `QLOO_API_KEY`.

The deployment is anonymous. The Vercel CLI on the build machine was logged out, so this is not a durable project. The URL expires at 2026-10-10 21:20 UTC unless a person claims it. The claim link is a secret and is not in this repository. After expiry, deploy again with the logged-in commands below. Do not paste an expired URL into Devpost.

### Vercel, durable

From this directory, after `npx vercel login`:

```bash
npx vercel link
npx vercel env add QLOO_API_KEY production
npx vercel --prod
```

`vercel env add` prompts for the value. Do not put the value in the command line if the shell history is shared. Leave the variable unmarked for the browser. Vercel keeps names without the `NEXT_PUBLIC_` prefix on the server.

Skip `env add` to ship fixture mode. The banner will say FIXTURE until the variable is set and the deployment is redeployed. The home page is dynamic, so the banner follows the server environment rather than the build machine.

The command that created the temporary URL is `env -u CI npx vercel deploy --temporary --yes`. Do not pass `--archive`. `CI=true` makes the CLI refuse an anonymous deploy. That command works only until the anonymous project expires or is claimed. It does not replace `vercel login`.

Dashboard path: import the Git repository, framework Next.js, root this directory. Add `QLOO_API_KEY` under Environment Variables. Do not enable "Expose to Browser".

### Cloudflare Workers

Alternate free host. This deploy did not use it. Wrangler was not logged in, and Wrangler 4.149 requires Node.js 22. This machine has Node.js 20. This tree does not install the adapter.

Automatic configuration, from this directory, after `npx wrangler login`:

```bash
npx wrangler deploy
```

Wrangler detects Next.js and asks before it writes its config. Then:

```bash
npx wrangler secret put QLOO_API_KEY
```

Paste the key at the prompt. Do not write it into `wrangler.jsonc`.

Manual OpenNext path, if you do not want the automatic Vite config:

```bash
npm install @opennextjs/cloudflare@latest
npm install --save-dev wrangler@latest
```

Add `open-next.config.ts`:

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig();
```

Add `wrangler.jsonc` with `nodejs_compat`, `main` set to `.open-next/worker.js`, and assets bound to `.open-next/assets`. Set `compatibility_date` to the day you deploy. Then:

```bash
npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy
npx wrangler secret put QLOO_API_KEY
```

Those commands are the host setup. They are not run by `npm run build`.

## Receipt

`/verify` checks the entity IDs on a slip. The demo signing key is in the repository on purpose. Anyone can mint a slip with it. It is not the Qloo key and it is not a production identity. HOLDS means the IDs were not edited after the server signed them.

## Limits

- Music lines and camera lines are a local lexicon keyed by the entity name. The lexicon does not choose the entity. A name with no line still commits as that entity and its affinity.
- Tags go into the insights query. The bars on the slip are entity contribution scores.
- The left column is a template. This app has no language-model key.
- Affinity is an aggregate taste signal. It is not a viewer's profile, a sync license, or a prediction that the film will work.
- Business model: experimental. No customer interviews are claimed here.

## Submission text

- Judge script: [DEMO.md](DEMO.md)
- Devpost paste: [DEVPOST.md](DEVPOST.md)
- Packet: [SUBMISSION.md](SUBMISSION.md)
- License: [LICENSE](LICENSE) (MIT)
- Repository: https://github.com/er-s-an/frame-call

An agent assisted the implementation. The product decisions are the entrant's.
