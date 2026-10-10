import assert from "node:assert/strict";
import test from "node:test";
import { runCall } from "./agent";
import { fixtureIds, insightsArtists, searchHongKong } from "./fixtures";
import { HACKATHON_ORIGIN } from "./types";
import { normalizeInsights, normalizeSearch } from "./normalize";
import { CONTRAST_BRIEF, DEMO_BRIEF } from "./parse";
import { insightsQuery } from "./qloo";
import { verifyPayload } from "./receipt";

const KEY = "test-key-not-real";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("demo brief commits music and camera from fixture entities", async () => {
  const result = await runCall(DEMO_BRIEF, { apiKey: null });
  assert.equal(result.mode, "fixture");
  assert.equal(result.status, "committed");
  assert.equal(result.music?.entity.id, fixtureIds.ARTIST);
  assert.equal(result.music?.entity.name, "Tatsuro Yamashita");
  assert.equal(result.shot?.entity.id, fixtureIds.MOVIE);
  assert.equal(result.shot?.entity.name, "In the Mood for Love");
  assert.ok(result.music?.line.includes("city-pop"));
  assert.ok(result.shot?.line.includes("Corridor frame"));
  assert.equal(result.shot?.credit, "Wong Kar-wai");
  assert.match(result.shot?.creditNote ?? "", /not a Qloo score/);
  assert.ok(result.music!.entity.contributors.every((row) => row.score >= 0.1));
  assert.ok(result.shot!.entity.contributors.some((row) => row.id === fixtureIds.HONG_KONG));
  assert.ok(result.shot!.entity.contributors.some((row) => row.id === fixtureIds.BRAND));
  assert.equal(result.generic.music, "Lo-fi");
  assert.match(result.generic.camera, /Slow push-in/);
  assert.match(result.generic.camera, /Warm bokeh/);
  assert.doesNotMatch(`${result.generic.music} ${result.generic.camera} ${result.generic.because}`, /fixture:|urn:/);
  assert.ok(result.trace.every((row) => row.sent === false));
  assert.ok(result.trace.some((row) => row.path === "/v2/insights" && row.query["feature.explainability"] === "true"));
  assert.ok(result.trace.some((row) => row.query["filter.type"] === "urn:entity:artist"));
  assert.ok(result.trace.some((row) => row.query["filter.type"] === "urn:entity:movie"));
  assert.ok(result.receipt);
  const verified = verifyPayload(result.receipt!.payload, result.receipt!.signature);
  assert.equal(verified.ok, true);
  if (verified.ok) {
    const body = verified.body as { music: { id: string }; shot: { id: string }; mode: string };
    assert.equal(body.mode, "fixture");
    assert.equal(body.music.id, fixtureIds.ARTIST);
    assert.equal(body.shot.id, fixtureIds.MOVIE);
  }
  assert.equal(verifyPayload(result.receipt!.payload, `${result.receipt!.signature}x`).ok, false);
});

test("the contrast brief withdraws and does not reuse the coffee entities", async () => {
  const result = await runCall(CONTRAST_BRIEF, { apiKey: null });
  assert.equal(result.mode, "fixture");
  assert.equal(result.parsed.sceneId, "contrast-withdraw");
  assert.equal(result.status, "no-seed");
  assert.equal(result.music, null);
  assert.equal(result.shot, null);
  assert.equal(result.receipt, null);
  assert.equal(result.signals.length, 0);
  assert.equal(result.tags.length, 0);
  assert.match(result.message, /Nothing to call/);
  assert.match(result.generic.camera, /Slow push-in/);
  assert.doesNotMatch(JSON.stringify(result), /fixture:|Tatsuro|Coffee Academics/);
  assert.ok(result.trace.every((row) => row.sent === false));
  assert.equal(result.trace.some((row) => row.path === "/search"), false);
});

test("the contrast brief is not searched when live mode is on", async () => {
  let called = 0;
  const fetchImpl: typeof fetch = async () => {
    called += 1;
    throw new Error("contrast brief must not be searched");
  };
  const result = await runCall("Tokyo record shop, 15 seconds", { apiKey: KEY, fetchImpl });
  assert.equal(called, 0);
  assert.equal(result.mode, "live");
  assert.equal(result.parsed.sceneId, "contrast-withdraw");
  assert.equal(result.status, "no-seed");
  assert.equal(result.music, null);
  assert.equal(result.shot, null);
  assert.equal(result.receipt, null);
  assert.equal(JSON.stringify(result).includes(KEY), false);
});

test("a third brief is outside both authored lines", async () => {
  const result = await runCall("巴黎面包店，要一条 15 秒的片", { apiKey: null });
  assert.equal(result.parsed.sceneId, null);
  assert.equal(result.status, "no-seed");
  assert.equal(result.music, null);
  assert.equal(result.signals.length, 0);
  assert.match(result.parsed.gloss, /two authored briefs/);
});

test("fixture bodies normalize like the documented response shapes", () => {
  const place = normalizeSearch(searchHongKong)[0];
  assert.equal(place.id, fixtureIds.HONG_KONG);
  assert.equal(place.type, "urn:entity:destination");
  const artist = normalizeInsights(insightsArtists)[0];
  assert.equal(artist.affinity, 0.74);
  assert.equal(artist.contributors.length, 2);
});

test("live requests use the hackathon host and never fall back to fixtures", async () => {
  const calls: { url: string; headers: Headers }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, headers: new Headers(init?.headers) });
    assert.equal(init?.method, "GET");
    assert.equal(new Headers(init?.headers).get("X-Api-Key"), KEY);
    assert.equal(new URL(url).origin, HACKATHON_ORIGIN);
    if (url.includes("/search")) {
      return jsonResponse({ success: true, results: [] });
    }
    return jsonResponse({ success: true, results: { entities: [] } });
  };
  const result = await runCall(DEMO_BRIEF, { apiKey: KEY, fetchImpl });
  assert.equal(result.mode, "live");
  assert.equal(result.status, "no-path");
  assert.equal(result.music, null);
  assert.equal(result.shot, null);
  assert.ok(calls.length >= 2);
  assert.ok(calls.every((call) => !call.url.includes("fixture")));
  const dumped = JSON.stringify(result);
  assert.equal(dumped.includes("Tatsuro"), false);
  assert.equal(dumped.includes("fixture:"), false);
});

function routeOf(input: RequestInfo | URL): { pathname: string; query: URLSearchParams } {
  const url = new URL(String(input));
  return { pathname: url.pathname, query: url.searchParams };
}

test("live success commits the returned entities, not the fixture", async () => {
  const fetchImpl: typeof fetch = async (input) => {
    const { pathname, query } = routeOf(input);
    if (pathname === "/search" && query.get("query") === "Hong Kong") {
      return jsonResponse({
        results: [{ entity_id: "live-hk", name: "Hong Kong", type: "urn:entity:destination" }],
      });
    }
    if (pathname === "/search") {
      return jsonResponse({
        results: [{ entity_id: "live-brand", name: "The Coffee Academics", type: "urn:entity:brand" }],
      });
    }
    if (pathname === "/v2/tags") {
      return jsonResponse({ results: [{ id: "live-tag", name: "coffee" }] });
    }
    if (query.get("filter.type") === "urn:entity:artist") {
      return jsonResponse({
        results: {
          entities: [
            {
              entity_id: "live-artist",
              name: "Faye Wong",
              type: "urn:entity:artist",
              query: {
                affinity: 0.81,
                explainability: {
                  entities: [
                    { entity_id: "live-hk", name: "Hong Kong", score: 0.4 },
                    { entity_id: "live-brand", name: "The Coffee Academics", score: 0.2 },
                  ],
                },
              },
            },
          ],
        },
      });
    }
    return jsonResponse({
      results: {
        entities: [
          {
            entity_id: "live-movie",
            name: "Chungking Express",
            type: "urn:entity:movie",
            query: {
              affinity: 0.66,
              explainability: {
                entities: [{ entity_id: "live-hk", name: "Hong Kong", score: 0.55 }],
              },
            },
          },
        ],
      },
    });
  };
  const result = await runCall(DEMO_BRIEF, { apiKey: KEY, fetchImpl });
  assert.equal(result.status, "committed");
  assert.equal(result.mode, "live");
  assert.equal(result.music?.entity.name, "Faye Wong");
  assert.equal(result.shot?.entity.name, "Chungking Express");
  assert.match(result.shot?.line ?? "", /Step-printed street/);
  assert.ok(result.trace.every((row) => row.op === "PARSE" || row.sent));
  const verified = verifyPayload(result.receipt!.payload, result.receipt!.signature);
  assert.equal(verified.ok, true);
});

test("live upstream failure does not invent a call", async () => {
  const fetchImpl: typeof fetch = async () => jsonResponse({ message: "No API key found in request" }, 401);
  const result = await runCall(DEMO_BRIEF, { apiKey: KEY, fetchImpl });
  assert.equal(result.mode, "live");
  assert.equal(result.status, "upstream-error");
  assert.equal(result.music, null);
  assert.equal(result.shot, null);
  assert.match(result.message, /401/);
  assert.equal(result.message.includes(KEY), false);
});

test("entities without explainability are not committed", async () => {
  const fetchImpl: typeof fetch = async (input) => {
    const { pathname, query } = routeOf(input);
    if (pathname === "/search" && query.get("query") === "Hong Kong") {
      return jsonResponse({ results: [{ entity_id: "live-hk", name: "Hong Kong", types: ["urn:entity:destination"] }] });
    }
    if (pathname === "/search") {
      return jsonResponse({ results: [{ entity_id: "live-brand", name: "The Coffee Academics", type: "urn:entity:brand" }] });
    }
    if (pathname === "/v2/tags") return jsonResponse({ results: [] });
    return jsonResponse({
      results: {
        entities: [
          {
            entity_id: "live-artist",
            name: "Someone",
            type: "urn:entity:artist",
            query: { affinity: 0.9, explainability: { warning: "unavailable" } },
          },
        ],
      },
      query: { explainability: { warning: "unavailable" } },
    });
  };
  const result = await runCall(DEMO_BRIEF, { apiKey: KEY, fetchImpl });
  assert.equal(result.music, null);
  assert.equal(result.shot, null);
  assert.equal(result.status, "no-path");
  assert.equal(result.explainabilityWarning, "unavailable");
});

test("a live body that echoes the key is withheld", async () => {
  const fetchImpl: typeof fetch = async (input) => {
    const { pathname, query } = routeOf(input);
    if (pathname === "/search" && query.get("query") === "Hong Kong") {
      return jsonResponse({
        results: [{ entity_id: "live-hk", name: `Hong Kong ${KEY}`, type: "urn:entity:destination" }],
      });
    }
    if (pathname === "/search") {
      return jsonResponse({
        results: [{ entity_id: "live-brand", name: "The Coffee Academics", type: "urn:entity:brand" }],
      });
    }
    if (pathname === "/v2/tags") return jsonResponse({ results: [] });
    return jsonResponse({ results: { entities: [] } });
  };
  const result = await runCall(DEMO_BRIEF, { apiKey: KEY, fetchImpl });
  assert.equal(JSON.stringify(result).includes(KEY), false);
  assert.equal(result.status, "upstream-error");
  assert.equal(result.music, null);
  assert.match(result.message, /API key/);
});

test("insights query carries explainability and both signal ids", () => {
  const query = insightsQuery({
    filterType: "urn:entity:movie",
    entityIds: ["a", "b"],
    tagIds: ["t"],
  });
  assert.equal(query["filter.type"], "urn:entity:movie");
  assert.equal(query["feature.explainability"], "true");
  assert.equal(query["signal.interests.entities"], "a,b");
  assert.equal(query["signal.interests.tags"], "t");
});
