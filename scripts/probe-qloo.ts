/**
 * Probe hackathon.api.qloo.com when QLOO_API_KEY is set.
 * Prints statuses and counts only. Never prints the key or a raw body.
 *
 * Exit 0: key missing (fixture mode), or live /search, /v2/tags, and
 *         /v2/insights all returned and at least one explainability score is present.
 * Exit 1: the key was set and a request failed.
 * Exit 2: the endpoints answered, but no contributor score came back.
 */
import { insightsQuery, qlooGet, type QlooCall } from "../lib/qloo";
import { normalizeInsights, normalizeSearch, normalizeTags } from "../lib/normalize";

const key = process.env.QLOO_API_KEY?.trim() ?? "";

function say(line: string): void {
  const safe = key ? line.split(key).join("[redacted]") : line;
  process.stdout.write(`${safe}\n`);
}

if (!key) {
  say("PROBE_SKIPPED missing QLOO_API_KEY. Fixture mode remains the demo. No request was sent.");
  process.exit(0);
}

async function hit(label: string, path: string, query: Record<string, string>): Promise<QlooCall | null> {
  try {
    return await qlooGet(path, query, key, fetch);
  } catch (error) {
    const status = (error as { qlooStatus?: number }).qlooStatus ?? null;
    const message = error instanceof Error ? error.message : "failed";
    say(`PROBE ${label} FAIL status=${status ?? "none"} ${message}`);
    return null;
  }
}

async function main(): Promise<number> {
  const destination = await hit("search-destination", "/search", {
    query: "Hong Kong",
    types: "urn:entity:destination",
    take: "5",
  });
  const brand = await hit("search-brand", "/search", {
    query: "The Coffee Academics",
    types: "urn:entity:brand",
    take: "5",
  });
  const tagsCall = await hit("tags", "/v2/tags", { "filter.query": "coffee", take: "5" });

  const placeHits = destination ? normalizeSearch(destination.body) : [];
  const brandHits = brand ? normalizeSearch(brand.body) : [];
  const tagHits = tagsCall ? normalizeTags(tagsCall.body) : [];
  const signals = [placeHits[0], brandHits[0]].filter((entity) => entity !== undefined);
  const tags = tagHits.slice(0, 1);

  if (destination) say(`PROBE search-destination status=${destination.status} hits=${placeHits.length} top=${placeHits[0]?.name ?? "none"}`);
  if (brand) say(`PROBE search-brand status=${brand.status} hits=${brandHits.length} top=${brandHits[0]?.name ?? "none"}`);
  if (tagsCall) say(`PROBE tags status=${tagsCall.status} hits=${tagHits.length} kept=${tags.map((tag) => tag.name).join(",") || "none"}`);

  let contributorScores = 0;
  let insightsFailed = false;
  if (signals.length) {
    const entityIds = signals.map((entity) => entity.id);
    const tagIds = tags.map((tag) => tag.id);
    for (const [label, filterType] of [
      ["insights-artist", "urn:entity:artist"],
      ["insights-movie", "urn:entity:movie"],
    ] as const) {
      const call = await hit(label, "/v2/insights", insightsQuery({ filterType, entityIds, tagIds }));
      if (!call) {
        insightsFailed = true;
        continue;
      }
      const entities = normalizeInsights(call.body);
      const scored = entities.filter((entity) => entity.contributors.length).length;
      contributorScores += entities.reduce((sum, entity) => sum + entity.contributors.length, 0);
      say(`PROBE ${label} status=${call.status} entities=${entities.length} withContributors=${scored}`);
    }
  } else if (destination && brand) {
    say("PROBE insights SKIPPED because /search returned no entities.");
  }

  if (!destination || !brand || !tagsCall || insightsFailed) {
    say("PROBE_FAIL one or more of /search, /v2/tags, /v2/insights did not return.");
    return 1;
  }

  if (contributorScores === 0) {
    say("PROBE_THIN endpoints responded and no explainability contributor score came back. The product shape stays. Do not treat fixture scores as live.");
    return 2;
  }

  say(`PROBE_OK search tags insights explainabilityScores=${contributorScores}`);
  return 0;
}

main()
  .then((code) => {
    process.exit(code);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "probe failed";
    say(`PROBE_FAIL ${message}`);
    process.exit(1);
  });
