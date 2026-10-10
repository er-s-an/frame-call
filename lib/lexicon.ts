export type MusicNote = {
  names: string[];
  line: string;
};

export type ShotNote = {
  names: string[];
  line: string;
  credit: string;
  creditNote: string;
};

const CREDIT_NOTE =
  "Director credit is local knowledge about this film title. It is not a Qloo score and it has no separate entity ID on this slip.";

const MUSIC: MusicNote[] = [
  {
    names: ["tatsuro yamashita", "山下達郎"],
    line: "Dry city-pop rhythm section: chorus guitar, side-stick, a major-key chorus. Spot the vocal like a record.",
  },
  {
    names: ["taeko onuki", "大貫妙子"],
    line: "City-pop piano and a close vocal. Leave the room tone out of the arrangement.",
  },
  {
    names: ["faye wong", "王菲"],
    line: "A spare Faye Wong vocal: breath, a little reverb, no beat under the pour.",
  },
  {
    names: ["chet baker"],
    line: "Chet Baker trumpet in a quiet room. No drum machine.",
  },
  {
    names: ["nujabes"],
    line: "Nujabes by name: dusted drums and a jazz sample, as this artist, not as a genre preset.",
  },
  {
    names: ["ryo fukui", "福居良"],
    line: "Ryo Fukui trio. Piano, upright bass, brushes. Let the cup sit in the pocket.",
  },
];

const SHOTS: ShotNote[] = [
  {
    names: ["in the mood for love", "花样年华", "花樣年華"],
    line: "Corridor frame. Lateral drift past a doorway. Practical tungsten. Hold all 15 seconds in one shot and let the steam smear.",
    credit: "Wong Kar-wai",
    creditNote: CREDIT_NOTE,
  },
  {
    names: ["chungking express", "重庆森林", "重慶森林"],
    line: "Step-printed street at night. A tight insert on the cup, then a smeared hallway. One continuous 15-second hold.",
    credit: "Wong Kar-wai",
    creditNote: CREDIT_NOTE,
  },
  {
    names: ["fallen angels", "堕落天使", "墮落天使"],
    line: "Wide-angle close to the counter. A canted frame. Neon practicals. Hold the 15 seconds without a push-in.",
    credit: "Wong Kar-wai",
    creditNote: CREDIT_NOTE,
  },
  {
    names: ["the grandmaster", "一代宗师", "一代宗師"],
    line: "Formal, slow lateral move through rain-lit glass. The cup stays sharp. The background falls off in planes.",
    credit: "Wong Kar-wai",
    creditNote: CREDIT_NOTE,
  },
];

function norm(name: string): string {
  return name.trim().toLowerCase();
}

export function musicNoteFor(name: string): string {
  const key = norm(name);
  const hit = MUSIC.find((note) => note.names.some((n) => n.toLowerCase() === key));
  if (hit) return hit.line;
  return `Music call: use ${name}. No arrangement note is stored for this name, so the decision is the entity and its affinity.`;
}

export function shotNoteFor(name: string): Pick<ShotNote, "line" | "credit" | "creditNote"> | null {
  const key = norm(name);
  const hit = SHOTS.find((note) => note.names.some((n) => n.toLowerCase() === key));
  if (!hit) return null;
  return { line: hit.line, credit: hit.credit, creditNote: hit.creditNote };
}

export function shotLineFor(name: string): { line: string; credit?: string; creditNote?: string } {
  const hit = shotNoteFor(name);
  if (hit) return hit;
  return {
    line: `Camera call: follow ${name}. No shot note is stored for this title, so the decision is the entity and its affinity.`,
  };
}
