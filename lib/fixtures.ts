/**
 * Authored stand-ins for the one demo scene.
 * These are not Qloo API responses. Every ID starts with "fixture:"
 * so it cannot be mistaken for a live catalog ID.
 * Live mode must not import the bodies below.
 */

const HONG_KONG = "fixture:destination:hong-kong";
const BRAND = "fixture:brand:the-coffee-academics";
const TAG = "fixture:tag:coffee";
const ARTIST = "fixture:artist:tatsuro-yamashita";
const MOVIE = "fixture:movie:in-the-mood-for-love";

export const fixtureIds = { HONG_KONG, BRAND, TAG, ARTIST, MOVIE };

export const searchHongKong = {
  success: true,
  results: [
    {
      entity_id: HONG_KONG,
      name: "Hong Kong",
      type: "urn:entity:destination",
      disambiguation: "City",
      popularity: 0.94,
    },
  ],
};

export const searchBrand = {
  success: true,
  results: [
    {
      entity_id: BRAND,
      name: "The Coffee Academics",
      type: "urn:entity:brand",
      disambiguation: "Hong Kong coffee brand",
      popularity: 0.62,
    },
  ],
};

export const tagsCoffee = {
  success: true,
  results: [
    {
      id: TAG,
      name: "coffee",
      type: "urn:tag:genre:place:cafe",
    },
  ],
};

function explain(rows: { entity_id: string; name: string; score: number }[]) {
  return { entities: rows };
}

export const insightsArtists = {
  success: true,
  results: {
    entities: [
      {
        entity_id: ARTIST,
        name: "Tatsuro Yamashita",
        type: "urn:entity:artist",
        disambiguation: "City pop",
        popularity: 0.71,
        query: {
          affinity: 0.74,
          explainability: explain([
            { entity_id: HONG_KONG, name: "Hong Kong", score: 0.61 },
            { entity_id: BRAND, name: "The Coffee Academics", score: 0.33 },
          ]),
        },
      },
    ],
  },
  query: {
    explainability: {
      entities: [
        { entity_id: HONG_KONG, name: "Hong Kong", score: 0.58 },
        { entity_id: BRAND, name: "The Coffee Academics", score: 0.29 },
      ],
    },
  },
};

export const insightsMovies = {
  success: true,
  results: {
    entities: [
      {
        entity_id: MOVIE,
        name: "In the Mood for Love",
        type: "urn:entity:movie",
        disambiguation: "2000 film",
        popularity: 0.88,
        query: {
          affinity: 0.69,
          explainability: explain([
            { entity_id: HONG_KONG, name: "Hong Kong", score: 0.72 },
            { entity_id: BRAND, name: "The Coffee Academics", score: 0.22 },
          ]),
        },
      },
    ],
  },
};
