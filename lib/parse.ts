import type { ParsedBrief } from "./types";

/** The only brief that may commit. */
export const DEMO_BRIEF = "Hong Kong independent coffee brand, need a 15-second opening film";

/**
 * The second authored brief, and the last one.
 * It exists so a judge can withdraw the slip. It is not a second city product.
 */
export const CONTRAST_BRIEF = "Tokyo record shop, need a 15-second film";

function hasHongKong(text: string): boolean {
  return /香港|hong\s*kong/i.test(text);
}

function hasCoffee(text: string): boolean {
  return /咖啡|coffee/i.test(text);
}

function hasTokyoRecord(text: string): boolean {
  return /东京|東京|tokyo/i.test(text) && /唱片|record/i.test(text);
}

export function parseBrief(brief: string): ParsedBrief {
  const text = brief.trim();
  const lower = text.toLowerCase();
  const hongKong = hasHongKong(text);
  const coffee = hasCoffee(text);
  const opening = /开业|開業|opening|promo/.test(lower) || /开业|開業/.test(text);
  const durationMatch = text.match(/(\d+)\s*(?:秒|s(?:ec(?:ond)?s?)?)/i);
  const durationSec = durationMatch ? Number(durationMatch[1]) : null;
  const sceneId = hongKong && coffee
    ? "hong-kong-coffee"
    : hasTokyoRecord(text)
      ? "contrast-withdraw"
      : null;

  const commitScene = sceneId === "hong-kong-coffee";
  const seeds = commitScene
    ? [
        {
          query: "Hong Kong",
          types: ["urn:entity:destination"],
          role: "place" as const,
        },
        {
          query: "The Coffee Academics",
          types: ["urn:entity:brand"],
          role: "brand-anchor" as const,
        },
      ]
    : [];

  const gloss = commitScene
    ? "A Hong Kong independent coffee brand needs a 15-second opening film."
    : sceneId === "contrast-withdraw"
      ? "Contrast brief. A Tokyo record shop needs a 15-second film. This line exists so the slip withdraws."
      : "This line is outside the two authored briefs.";

  return {
    brief: text,
    gloss,
    durationSec,
    place: commitScene ? "Hong Kong" : sceneId === "contrast-withdraw" ? "Tokyo" : hongKong ? "Hong Kong" : null,
    category: coffee ? "coffee" : "other",
    opening,
    sceneId,
    seeds,
    tagQuery: commitScene ? "coffee" : null,
    anchorName: commitScene ? "The Coffee Academics" : null,
    anchorNote: commitScene
      ? "The brief names a category, not a brand. This scene anchors that category to The Coffee Academics, a real Hong Kong coffee brand, so the graph has a brand entity to score. Live mode searches this same name and keeps whatever ID /search returns."
      : null,
  };
}
