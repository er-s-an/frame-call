import { commitMusic, commitShot } from "./commit";
import {
  insightsArtists,
  insightsMovies,
  searchBrand,
  searchHongKong,
  tagsCoffee,
} from "./fixtures";
import { genericAnswer } from "./generic";
import { normalizeInsights, normalizeSearch, normalizeTags } from "./normalize";
import { parseBrief } from "./parse";
import { insightsQuery, readLiveGraph, type FetchLike } from "./qloo";
import { signPayload } from "./receipt";
import type { CallResult, Decision, GraphEntity, GraphTag, Mode, ParsedBrief, Status, ToolTrace } from "./types";

function emptyResult(input: {
  mode: Mode;
  brief: string;
  status: Status;
  message: string;
  trace?: ToolTrace[];
  signals?: GraphEntity[];
  tags?: GraphTag[];
  music?: Decision | null;
  shot?: Decision | null;
  explainabilityWarning?: string | null;
}): CallResult {
  const parsed = parseBrief(input.brief);
  const music = input.music ?? null;
  const shot = input.shot ?? null;
  const result: CallResult = {
    ok: input.status === "committed" || input.status === "partial",
    mode: input.mode,
    brief: parsed.brief,
    parsed,
    generic: genericAnswer(parsed),
    status: input.status,
    message: input.message,
    signals: input.signals ?? [],
    tags: input.tags ?? [],
    music,
    shot,
    trace: input.trace ?? [],
    explainabilityWarning: input.explainabilityWarning ?? null,
    receipt: null,
  };
  if (music || shot) result.receipt = signReceipt(result);
  assertCallResult(result);
  return result;
}

function signReceipt(result: CallResult) {
  return signPayload({
    v: 1,
    product: "frame-call",
    mode: result.mode,
    brief: result.brief,
    signals: result.signals.map((entity) => ({ id: entity.id, name: entity.name, type: entity.type })),
    tags: result.tags.map((tag) => ({ id: tag.id, name: tag.name })),
    music: decisionFacts(result.music),
    shot: decisionFacts(result.shot),
  });
}

function decisionFacts(decision: Decision | null) {
  if (!decision) return null;
  return {
    id: decision.entity.id,
    name: decision.entity.name,
    type: decision.entity.type,
    affinity: decision.entity.affinity ?? null,
    contributors: decision.entity.contributors.map((row) => ({
      id: row.id,
      score: row.score,
    })),
  };
}

export function assertCallResult(result: CallResult): void {
  const genericText = `${result.generic.music}\n${result.generic.camera}\n${result.generic.because}`;
  if (/urn:|fixture:/.test(genericText)) {
    throw new Error("Generic answer contains an entity ID.");
  }
  for (const decision of [result.music, result.shot]) {
    if (!decision) continue;
    if (!decision.entity.id) throw new Error("Decision is missing an entity ID.");
    if (!decision.entity.contributors.length) {
      throw new Error("Decision has no explainability contributors.");
    }
  }
  if (result.mode === "live") {
    const ids = [
      ...result.signals.map((entity) => entity.id),
      ...result.tags.map((tag) => tag.id),
      result.music?.entity.id,
      result.shot?.entity.id,
    ].filter(Boolean) as string[];
    if (ids.some((id) => id.startsWith("fixture:"))) {
      throw new Error("Live result contains a fixture ID.");
    }
  }
  if (result.mode === "fixture" && result.trace.some((row) => row.sent)) {
    throw new Error("Fixture trace marked a request as sent.");
  }
  if (result.status === "committed" && (!result.music || !result.shot)) {
    throw new Error("Committed status requires both calls.");
  }
}

function parseTrace(parsed: ParsedBrief, mode: Mode): ToolTrace {
  let note = "No authored scene for this brief.";
  if (parsed.sceneId === "hong-kong-coffee") {
    note = mode === "live"
      ? "Scene hong-kong-coffee. Next requests go to hackathon.api.qloo.com."
      : "Scene hong-kong-coffee. Seeds are Hong Kong and The Coffee Academics.";
  } else if (parsed.sceneId === "contrast-withdraw") {
    note = "Contrast brief. No search. The demo scene's entities are not reused.";
  }
  return {
    step: 1,
    op: "PARSE",
    method: "LOCAL",
    path: "parseBrief",
    query: {},
    sent: false,
    status: null,
    note,
    entityIds: [],
  };
}

const CONTRAST_MESSAGE =
  "Contrast brief. Nothing to call. Frame Call will not borrow the demo scene's entities, and it will not search a second city.";

function scrub(text: string, apiKey: string): string {
  return text.split(apiKey).join("[redacted]");
}

function withholdKey(result: CallResult, apiKey: string | null): CallResult {
  if (!apiKey || !JSON.stringify(result).includes(apiKey)) return result;
  const trace = result.trace.map((row) => ({
    ...row,
    path: scrub(row.path, apiKey),
    note: scrub(row.note, apiKey),
    query: Object.fromEntries(
      Object.entries(row.query).map(([key, value]) => [scrub(key, apiKey), scrub(value, apiKey)]),
    ),
    entityIds: row.entityIds.map((id) => scrub(id, apiKey)),
  }));
  return emptyResult({
    mode: result.mode,
    brief: scrub(result.brief, apiKey),
    status: "upstream-error",
    message: "The response was withheld because it contained the API key.",
    trace,
  });
}

function fixtureTrace(signals: GraphEntity[], tags: GraphTag[]): ToolTrace[] {
  const entityIds = signals.map((entity) => entity.id).join(",");
  const tagIds = tags.map((tag) => tag.id);
  const artistQuery = insightsQuery({
    filterType: "urn:entity:artist",
    entityIds: signals.map((entity) => entity.id),
    tagIds,
  });
  const movieQuery = insightsQuery({
    filterType: "urn:entity:movie",
    entityIds: signals.map((entity) => entity.id),
    tagIds,
  });
  return [
    {
      step: 2,
      op: "SEARCH",
      method: "GET",
      path: "/search",
      query: { query: "Hong Kong", types: "urn:entity:destination", take: "5" },
      sent: false,
      status: null,
      note: "Not sent. Authored fixture body.",
      entityIds: [signals[0]?.id].filter(Boolean) as string[],
    },
    {
      step: 3,
      op: "SEARCH",
      method: "GET",
      path: "/search",
      query: { query: "The Coffee Academics", types: "urn:entity:brand", take: "5" },
      sent: false,
      status: null,
      note: "Not sent. Authored fixture body.",
      entityIds: [signals[1]?.id].filter(Boolean) as string[],
    },
    {
      step: 4,
      op: "TAGS",
      method: "GET",
      path: "/v2/tags",
      query: { "filter.query": "coffee", take: "5" },
      sent: false,
      status: null,
      note: "Not sent. Authored fixture body.",
      entityIds: tags.map((tag) => tag.id),
    },
    {
      step: 5,
      op: "INSIGHTS_ARTIST",
      method: "GET",
      path: "/v2/insights",
      query: artistQuery,
      sent: false,
      status: null,
      note: `Not sent. Cross-category: destination and brand toward artist. Entities ${entityIds}.`,
      entityIds: [normalizeInsights(insightsArtists)[0]?.id].filter(Boolean) as string[],
    },
    {
      step: 6,
      op: "INSIGHTS_MOVIE",
      method: "GET",
      path: "/v2/insights",
      query: movieQuery,
      sent: false,
      status: null,
      note: "Not sent. Cross-category: destination and brand toward movie.",
      entityIds: [normalizeInsights(insightsMovies)[0]?.id].filter(Boolean) as string[],
    },
  ];
}

function runFixture(brief: string): CallResult {
  const parsed = parseBrief(brief);
  const trace = parseTrace(parsed, "fixture");
  if (parsed.sceneId === "contrast-withdraw") {
    return emptyResult({
      mode: "fixture",
      brief,
      status: "no-seed",
      message: CONTRAST_MESSAGE,
      trace: [trace],
    });
  }
  if (!parsed.seeds.length || !parsed.sceneId) {
    return emptyResult({
      mode: "fixture",
      brief,
      status: parsed.seeds.length ? "no-fixture" : "no-seed",
      message: parsed.seeds.length
        ? "No authored fixture for this brief. Frame Call will not invent entities."
        : "This brief has no cultural seed the demo can resolve. The generic column still answers. It still has nothing to commit.",
      trace: [trace],
    });
  }

  const signals = [normalizeSearch(searchHongKong)[0], normalizeSearch(searchBrand)[0]].filter(
    (entity): entity is GraphEntity => Boolean(entity),
  );
  const tags = normalizeTags(tagsCoffee);
  const artists = normalizeInsights(insightsArtists);
  const movies = normalizeInsights(insightsMovies);
  const music = commitMusic(artists);
  const shot = commitShot(movies);
  const rows = [trace, ...fixtureTrace(signals, tags)];
  if (!music || !shot) {
    return emptyResult({
      mode: "fixture",
      brief,
      status: "no-path",
      message: "The fixture graph returned no explainability path, so neither call is committed.",
      trace: rows,
      signals,
      tags,
      music,
      shot,
    });
  }
  return emptyResult({
    mode: "fixture",
    brief,
    status: "committed",
    message: "Both calls cite fixture entities and contributor scores. Nothing on this slip was fetched from Qloo.",
    trace: rows,
    signals,
    tags,
    music,
    shot,
  });
}

function statusFor(music: Decision | null, shot: Decision | null): { status: Status; message: string } {
  if (music && shot) {
    return {
      status: "committed",
      message: "Both calls cite live entity IDs and the explainability scores returned with them.",
    };
  }
  if (music || shot) {
    const missing = music ? "camera" : "music";
    return {
      status: "partial",
      message: `The ${missing} call is withdrawn. Insights returned no entity with an explainability path.`,
    };
  }
  return {
    status: "no-path",
    message: "Search or insights gave Frame Call no explainability path. Both calls are withdrawn.",
  };
}

async function runLive(brief: string, apiKey: string, fetchImpl: FetchLike): Promise<CallResult> {
  const parsed = parseBrief(brief);
  const trace = parseTrace(parsed, "live");
  if (parsed.sceneId === "contrast-withdraw") {
    return emptyResult({
      mode: "live",
      brief,
      status: "no-seed",
      message: CONTRAST_MESSAGE,
      trace: [trace],
    });
  }
  if (!parsed.sceneId) {
    return emptyResult({
      mode: "live",
      brief,
      status: "no-seed",
      message:
        "Live mode is on, and this build only searches the Hong Kong coffee scene. It will not guess entities for a different brief.",
      trace: [trace],
    });
  }
  try {
    const graph = await readLiveGraph({
      apiKey,
      fetchImpl,
      seeds: parsed.seeds,
      tagQuery: parsed.tagQuery,
    });
    if (graph.error) {
      return emptyResult({
        mode: "live",
        brief,
        status: "upstream-error",
        message: graph.error,
        trace: [trace, ...graph.trace],
      });
    }
    const music = commitMusic(graph.artists);
    const shot = commitShot(graph.movies);
    const { status, message } = graph.signals.length
      ? statusFor(music, shot)
      : {
          status: "no-path" as const,
          message: "Live /search returned no entities, so insights were not asked for a commit.",
        };
    return emptyResult({
      mode: "live",
      brief,
      status,
      message,
      trace: [trace, ...graph.trace],
      signals: graph.signals,
      tags: graph.tags,
      music: graph.signals.length ? music : null,
      shot: graph.signals.length ? shot : null,
      explainabilityWarning: graph.warning,
    });
  } catch (error) {
    return emptyResult({
      mode: "live",
      brief,
      status: "upstream-error",
      message: error instanceof Error ? error.message : "Qloo request failed.",
      trace: [trace],
    });
  }
}

function readEnvKey(): string | null {
  if (typeof process === "undefined" || process.env == null) return null;
  return process.env.QLOO_API_KEY?.trim() || null;
}

export async function runCall(
  brief: string,
  options?: { apiKey?: string | null; fetchImpl?: FetchLike },
): Promise<CallResult> {
  const apiKey = options && "apiKey" in options ? options.apiKey?.trim() || null : readEnvKey();
  const text = brief.trim();
  if (!text) {
    return emptyResult({
      mode: apiKey ? "live" : "fixture",
      brief: "",
      status: "no-seed",
      message: "Paste a one-line promo brief.",
    });
  }
  const result = !apiKey ? runFixture(text) : await runLive(text, apiKey, options?.fetchImpl ?? fetch);
  return withholdKey(result, apiKey);
}
