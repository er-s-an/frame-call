import type { GenericAnswer, ParsedBrief } from "./types";

/** Adjectives a safe model gives an independent cafe. No entity IDs, no graph. */
export function genericAnswer(parsed: ParsedBrief): GenericAnswer {
  if (parsed.category === "coffee") {
    return {
      music: "Lo-fi",
      camera: "Slow push-in. Warm bokeh.",
      because: "Independent coffee reads as cozy, warm, and premium.",
    };
  }
  return {
    music: "Upbeat instrumental",
    camera: "Slow push-in. Warm bokeh.",
    because: "A safe promo look, with no cultural entity behind it.",
  };
}
