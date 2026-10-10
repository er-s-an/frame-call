import { HACKATHON_ORIGIN, type GraphEntity, type GraphTag, type ToolTrace } from "./types";
import { normalizeInsights, normalizeSearch, normalizeTags, readExplainabilityWarning } from "./normalize";

export type FetchLike = typeof fetch;

export type QlooCall = {
  path: string;
  query: Record<string, string>;
  status: number;
  body: unknown;
};

function redact(text: string, apiKey: string): string {
  if (!apiKey) return text;
  return text.split(apiKey).join("[redacted]");
}

export function insightsQuery(input: {
  filterType: string;
  entityIds: string[];
  tagIds: string[];
}): Record<string, string> {
  const query: Record<string, string> = {
    "filter.type": input.filterType,
    "feature.explainability": "true",
    take: "5",
    "signal.interests.entities": input.entityIds.join(","),
  };
  if (input.tagIds.length) query["signal.interests.tags"] = input.tagIds.join(",");
  return query;
}

export async function qlooGet(
  path: string,
  query: Record<string, string>,
  apiKey: string,
  fetchImpl: FetchLike,
): Promise<QlooCall> {
  const url = new URL(path, HACKATHON_ORIGIN);
  for (const [key, value] of Object.entries(query)) {
    if (value) url.searchParams.set(key, value);
  }
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "request failed";
    throw new Error(redact(`Qloo request failed: ${message}`, apiKey));
  }
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: redact(text.slice(0, 280), apiKey) };
    }
  }
  if (!response.ok) {
    const detail = typeof body === "object" && body && "message" in body
      ? String((body as { message: unknown }).message)
      : text.slice(0, 280);
    const error = new Error(redact(`Qloo ${response.status} on ${path}. ${detail}`, apiKey));
    (error as Error & { qlooStatus?: number; qlooBody?: unknown }).qlooStatus = response.status;
    (error as Error & { qlooBody?: unknown }).qlooBody = body;
    throw error;
  }
  return { path, query, status: response.status, body };
}

export function assertNoFixtureIds(entities: { id: string }[], where: string): void {
  const leaked = entities.filter((entity) => entity.id.startsWith("fixture:"));
  if (leaked.length) {
    throw new Error(`${where} returned fixture IDs in live mode.`);
  }
}

export type LiveGraph = {
  signals: GraphEntity[];
  tags: GraphTag[];
  artists: GraphEntity[];
  movies: GraphEntity[];
  warning: string | null;
  trace: ToolTrace[];
  error: string | null;
};

export async function readLiveGraph(input: {
  apiKey: string;
  fetchImpl: FetchLike;
  seeds: { query: string; types: string[] }[];
  tagQuery: string | null;
}): Promise<LiveGraph> {
  const trace: ToolTrace[] = [];
  let step = 2;
  const searches: Array<GraphEntity | null> = [];

  for (const seed of input.seeds) {
    const query = { query: seed.query, types: seed.types.join(","), take: "5" };
    try {
      const call = await qlooGet("/search", query, input.apiKey, input.fetchImpl);
      const entities = normalizeSearch(call.body);
      assertNoFixtureIds(entities, "/search");
      trace.push({
        step: step++,
        op: "SEARCH",
        method: "GET",
        path: "/search",
        query,
        sent: true,
        status: call.status,
        note: entities.length ? `Top hit ${entities[0].name}.` : "200 with no entities.",
        entityIds: entities.slice(0, 3).map((entity) => entity.id),
      });
      searches.push(entities[0] ?? null);
    } catch (error) {
      const status = (error as { qlooStatus?: number }).qlooStatus ?? null;
      const message = error instanceof Error ? error.message : "Search failed.";
      trace.push({
        step: step++,
        op: "SEARCH",
        method: "GET",
        path: "/search",
        query,
        sent: true,
        status,
        note: message,
        entityIds: [],
      });
      return { signals: [], tags: [], artists: [], movies: [], warning: null, trace, error: message };
    }
  }

  let tags: GraphTag[] = [];
  if (input.tagQuery) {
    const query = { "filter.query": input.tagQuery, take: "5" };
    try {
      const call = await qlooGet("/v2/tags", query, input.apiKey, input.fetchImpl);
      tags = normalizeTags(call.body).slice(0, 1);
      assertNoFixtureIds(tags, "/v2/tags");
      trace.push({
        step: step++,
        op: "TAGS",
        method: "GET",
        path: "/v2/tags",
        query,
        sent: true,
        status: call.status,
        note: tags.length ? `Tag ${tags[0].name}.` : "200 with no tags. Insights continue on entities only.",
        entityIds: tags.map((tag) => tag.id),
      });
    } catch (error) {
      const status = (error as { qlooStatus?: number }).qlooStatus ?? null;
      trace.push({
        step: step++,
        op: "TAGS",
        method: "GET",
        path: "/v2/tags",
        query,
        sent: true,
        status,
        note: error instanceof Error ? `${error.message} Insights continue on entities only.` : "Tags failed.",
        entityIds: [],
      });
    }
  }

  const signals = searches.filter((entity): entity is GraphEntity => Boolean(entity));
  if (!signals.length) {
    return { signals, tags, artists: [], movies: [], warning: null, trace, error: null };
  }

  const tagIds = tags.map((tag) => tag.id);
  const entityIds = signals.map((entity) => entity.id);
  const warnings: string[] = [];

  async function insights(filterType: string, op: string): Promise<GraphEntity[]> {
    const query = insightsQuery({ filterType, entityIds, tagIds });
    try {
      const call = await qlooGet("/v2/insights", query, input.apiKey, input.fetchImpl);
      const entities = normalizeInsights(call.body);
      assertNoFixtureIds(entities, "/v2/insights");
      const warning = readExplainabilityWarning(call.body);
      if (warning) warnings.push(warning);
      trace.push({
        step: step++,
        op,
        method: "GET",
        path: "/v2/insights",
        query,
        sent: true,
        status: call.status,
        note: entities.length
          ? `${entities.length} entities.${warning ? ` Explainability warning: ${warning}` : ""}`
          : "200 with an empty entity list.",
        entityIds: entities.slice(0, 3).map((entity) => entity.id),
      });
      return entities;
    } catch (error) {
      const status = (error as { qlooStatus?: number }).qlooStatus ?? null;
      const message = error instanceof Error ? error.message : "Insights failed.";
      trace.push({
        step: step++,
        op,
        method: "GET",
        path: "/v2/insights",
        query,
        sent: true,
        status,
        note: message,
        entityIds: [],
      });
      return [];
    }
  }

  const artists = await insights("urn:entity:artist", "INSIGHTS_ARTIST");
  const movies = await insights("urn:entity:movie", "INSIGHTS_MOVIE");
  const insightRows = trace.filter((row) => row.op.startsWith("INSIGHTS"));
  const bothFailed = insightRows.length === 2 && insightRows.every((row) => row.status !== 200);
  if (bothFailed) {
    return {
      signals,
      tags,
      artists: [],
      movies: [],
      warning: null,
      trace,
      error: insightRows[0]?.note ?? "Insights failed.",
    };
  }

  return {
    signals,
    tags,
    artists,
    movies,
    warning: warnings[0] ?? null,
    trace,
    error: null,
  };
}
