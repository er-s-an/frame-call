import { musicNoteFor, shotLineFor } from "./lexicon";
import { MIN_CONTRIBUTION, type Decision, type GraphEntity } from "./types";

export function withPath(entities: GraphEntity[]): GraphEntity[] {
  return entities.filter((entity) =>
    entity.contributors.some((row) => row.score >= MIN_CONTRIBUTION),
  );
}

export function commitMusic(entities: GraphEntity[]): Decision | null {
  const entity = withPath(entities)[0];
  if (!entity) return null;
  return {
    kind: "music",
    entity,
    line: musicNoteFor(entity.name),
  };
}

export function commitShot(entities: GraphEntity[]): Decision | null {
  const entity = withPath(entities)[0];
  if (!entity) return null;
  const note = shotLineFor(entity.name);
  return {
    kind: "shot",
    entity,
    line: note.line,
    credit: note.credit,
    creditNote: note.creditNote,
  };
}
