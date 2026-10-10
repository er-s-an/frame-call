export type Mode = "fixture" | "live";

export type Status =
  | "committed"
  | "partial"
  | "no-seed"
  | "no-fixture"
  | "no-path"
  | "upstream-error";

export type Seed = {
  query: string;
  types: string[];
  role: "place" | "brand-anchor";
};

export type ParsedBrief = {
  brief: string;
  gloss: string;
  durationSec: number | null;
  place: string | null;
  category: "coffee" | "other";
  opening: boolean;
  sceneId: "hong-kong-coffee" | "contrast-withdraw" | null;
  seeds: Seed[];
  tagQuery: string | null;
  anchorName: string | null;
  anchorNote: string | null;
};

export type Contributor = {
  id: string;
  name: string;
  score: number;
};

export type GraphEntity = {
  id: string;
  name: string;
  type: string;
  disambiguation?: string;
  popularity?: number;
  affinity?: number;
  contributors: Contributor[];
};

export type GraphTag = {
  id: string;
  name: string;
};

export type ToolTrace = {
  step: number;
  op: string;
  method: "GET" | "LOCAL";
  path: string;
  query: Record<string, string>;
  sent: boolean;
  status: number | null;
  note: string;
  entityIds: string[];
};

export type Decision = {
  kind: "music" | "shot";
  entity: GraphEntity;
  line: string;
  credit?: string;
  creditNote?: string;
};

export type GenericAnswer = {
  music: string;
  camera: string;
  because: string;
};

export type Receipt = {
  payload: string;
  signature: string;
  publicKey: string;
};

export type CallResult = {
  ok: boolean;
  mode: Mode;
  brief: string;
  parsed: ParsedBrief;
  generic: GenericAnswer;
  status: Status;
  message: string;
  signals: GraphEntity[];
  tags: GraphTag[];
  music: Decision | null;
  shot: Decision | null;
  trace: ToolTrace[];
  explainabilityWarning: string | null;
  receipt: Receipt | null;
};

export const HACKATHON_ORIGIN = "https://hackathon.api.qloo.com";

export const MIN_CONTRIBUTION = 0.1;
