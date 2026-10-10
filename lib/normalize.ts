import type { Contributor, GraphEntity, GraphTag } from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function typeOf(record: Record<string, unknown>): string {
  const direct = asString(record.type) ?? asString(record.subtype);
  if (direct) return direct;
  const types = record.types;
  if (Array.isArray(types)) {
    const first = types.map(asString).find(Boolean);
    if (first) return first;
  }
  return "unknown";
}

function roundScore(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function readContributors(record: Record<string, unknown>): Contributor[] {
  const query = asRecord(record.query);
  const buckets = [
    asRecord(record.explainability),
    query ? asRecord(query.explainability) : null,
  ].filter(Boolean) as Record<string, unknown>[];

  const found: Contributor[] = [];
  for (const bucket of buckets) {
    const lists = [bucket.entities, bucket.input_entities, bucket.signals].filter(Array.isArray) as unknown[][];
    for (const list of lists) {
      for (const item of list) {
        const row = asRecord(item);
        if (!row) continue;
        const id = asString(row.entity_id) ?? asString(row.id) ?? asString(row.entityId);
        const name = asString(row.name) ?? asString(row.title) ?? id;
        const score = asNumber(row.score) ?? asNumber(row.weight) ?? asNumber(row.contribution);
        if (!id || !name || score === undefined) continue;
        found.push({ id, name, score: roundScore(score) });
      }
    }
  }

  const seen = new Set<string>();
  return found.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

export function readExplainabilityWarning(body: unknown): string | null {
  const root = asRecord(body);
  if (!root) return null;
  const query = asRecord(root.query);
  const fromQuery = query ? asRecord(query.explainability) : null;
  const fromRoot = asRecord(root.explainability);
  const warning =
    (fromQuery && asString(fromQuery.warning)) ||
    (fromRoot && asString(fromRoot.warning)) ||
    null;
  return warning;
}

function toEntity(value: unknown, withAffinity: boolean): GraphEntity | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = asString(record.entity_id) ?? asString(record.id) ?? asString(record.entityId);
  const name = asString(record.name) ?? asString(record.title);
  if (!id || !name) return null;
  const query = asRecord(record.query);
  const affinity = withAffinity
    ? asNumber(query?.affinity) ?? asNumber(record.affinity) ?? asNumber(record.score)
    : undefined;
  const entity: GraphEntity = {
    id,
    name,
    type: typeOf(record),
    contributors: withAffinity ? readContributors(record) : [],
  };
  const disambiguation = asString(record.disambiguation);
  const popularity = asNumber(record.popularity);
  if (disambiguation) entity.disambiguation = disambiguation;
  if (popularity !== undefined) entity.popularity = popularity;
  if (affinity !== undefined) entity.affinity = roundScore(affinity);
  return entity;
}

export function listFrom(body: unknown): unknown[] {
  const root = asRecord(body);
  if (!root) return [];
  if (Array.isArray(root.results)) return root.results;
  const results = asRecord(root.results);
  if (!results) {
    if (Array.isArray(root.entities)) return root.entities;
    return [];
  }
  if (Array.isArray(results.entities)) return results.entities;
  if (Array.isArray(results.tags)) return results.tags;
  return [];
}

export function normalizeSearch(body: unknown): GraphEntity[] {
  return listFrom(body)
    .map((item) => toEntity(item, false))
    .filter((item): item is GraphEntity => Boolean(item));
}

export function normalizeInsights(body: unknown): GraphEntity[] {
  return listFrom(body)
    .map((item) => toEntity(item, true))
    .filter((item): item is GraphEntity => Boolean(item))
    .sort((a, b) => (b.affinity ?? 0) - (a.affinity ?? 0));
}

export function normalizeTags(body: unknown): GraphTag[] {
  const tags: GraphTag[] = [];
  for (const item of listFrom(body)) {
    const record = asRecord(item);
    if (!record) continue;
    const id = asString(record.tag_id) ?? asString(record.id) ?? asString(record.entity_id);
    const name = asString(record.name) ?? asString(record.tag) ?? asString(record.title);
    if (!id || !name) continue;
    tags.push({ id, name });
  }
  return tags;
}
