"use client";

import { useState } from "react";
import type { CallResult, Decision, ToolTrace } from "../lib/types";

function queryLine(query: Record<string, string>): string {
  return Object.entries(query)
    .map(([key, value]) => `${key}=${value}`)
    .join("  ");
}

function Why({ decision }: { decision: Decision }) {
  return (
    <ol className="why">
      {decision.entity.contributors.map((row) => (
        <li key={row.id}>
          <div className="why-top">
            <span>
              {row.name} <code>{row.id}</code>
            </span>
            <span className="score">{row.score.toFixed(2)}</span>
          </div>
          <div className="track" aria-hidden="true">
            <div className="fill" style={{ width: `${Math.max(6, Math.min(100, row.score * 100))}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function DecisionCard({ decision, title }: { decision: Decision; title: string }) {
  const affinity = decision.entity.affinity;
  return (
    <article className="decision">
      <div className="label">
        <span>{title}</span>
        <span>Committed</span>
      </div>
      <strong className="entity">{decision.entity.name}</strong>
      <p className="direction">{decision.line}</p>
      <p className="meta">
        {decision.entity.type}
        {affinity !== undefined ? ` · affinity ${affinity.toFixed(2)}` : ""}
      </p>
      <code className="id">{decision.entity.id}</code>
      <Why decision={decision} />
      {decision.credit ? (
        <p className="credit">
          Director credit on this title: {decision.credit}. {decision.creditNote}
        </p>
      ) : null}
    </article>
  );
}

function Trace({ rows }: { rows: ToolTrace[] }) {
  if (!rows.length) return null;
  const sent = rows.some((row) => row.sent);
  return (
    <details className="trace-wrap">
      <summary>{sent ? "Request trace · sent to Qloo" : "Request trace · not sent"}</summary>
      <ol className="trace">
        {rows.map((row) => (
          <li key={`${row.step}-${row.op}`}>
            <span className={`op ${row.sent ? "sent" : "held"}`}>
              {row.sent ? "SENT" : "NOT SENT"} · {row.op.replaceAll("_", " ")}
            </span>
            <span className="query">
              {row.method} {row.path}
              {row.status ? ` · ${row.status}` : ""}
              {queryLine(row.query) ? ` · ${queryLine(row.query)}` : ""}
            </span>
            <span className="note">{row.note}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}

export function Studio({
  initial,
  demoBrief,
  contrastBrief,
  readBrief,
  receiptPath = "/verify",
}: {
  initial: CallResult;
  demoBrief: string;
  contrastBrief: string;
  readBrief?: (brief: string) => Promise<CallResult>;
  receiptPath?: string;
}) {
  const [brief, setBrief] = useState(initial.brief || demoBrief);
  const [result, setResult] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function read(nextBrief: string) {
    setPending(true);
    setError(null);
    try {
      if (readBrief) {
        setResult(await readBrief(nextBrief));
        return;
      }
      const response = await fetch("/api/call", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: nextBrief }),
      });
      if (!response.ok) throw new Error(`The server returned ${response.status}.`);
      const body = (await response.json()) as CallResult;
      setResult(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The read failed.");
    } finally {
      setPending(false);
    }
  }

  const receipt = result.receipt
    ? `${receiptPath}?p=${encodeURIComponent(result.receipt.payload)}&s=${encodeURIComponent(result.receipt.signature)}`
    : null;

  return (
    <main className="page">
      <header className="top">
        <div>
          <p className="kicker">Promo desk</p>
          <h1>Frame Call</h1>
        </div>
        <p className="deck">
          One line in. Left: a generic answer with no entity IDs. Right: music and camera only if the taste graph names them.
        </p>
      </header>

      <p className={`banner ${result.mode}`} role="status">
        {result.mode === "fixture"
          ? "FIXTURE. QLOO_API_KEY is not set. IDs starting with fixture: and the scores under them were written for this demo. They are not a Qloo response."
          : "LIVE. IDs and scores below came from hackathon.api.qloo.com on this request. Fixture bodies were not used."}
      </p>

      <form
        className="brief"
        onSubmit={(event) => {
          event.preventDefault();
          void read(brief);
        }}
      >
        <textarea
          aria-label="Promo brief"
          rows={1}
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
        />
        <button type="submit" disabled={pending}>
          {pending ? "Reading" : "Read the brief"}
        </button>
        <button
          type="button"
          className="ghost"
          disabled={pending}
          onClick={() => {
            setBrief(demoBrief);
            void read(demoBrief);
          }}
        >
          Demo scene
        </button>
        <button
          type="button"
          className="ghost"
          disabled={pending}
          onClick={() => {
            setBrief(contrastBrief);
            void read(contrastBrief);
          }}
        >
          Contrast brief
        </button>
      </form>
      <p className="gloss">{result.parsed.gloss}</p>
      {error ? <p className="banner fixture">{error}</p> : null}

      <div className="board">
        <section className="panel generic" aria-label="Generic model">
          <p className="eyebrow">No taste graph</p>
          <h2>Generic model</h2>
          <p className="lead">Same brief, no entity. Take Qloo away and this column is all that remains.</p>
          <div className="call">
            <div className="label"><span>Music</span><span>No ID</span></div>
            <p className="phrase">{result.generic.music}</p>
          </div>
          <div className="call">
            <div className="label"><span>Camera</span><span>No ID</span></div>
            <p className="phrase">{result.generic.camera}</p>
            <p className="because">{result.generic.because}</p>
          </div>
        </section>

        <section className="panel slip" aria-label="Qloo taste graph">
          <p className="eyebrow">Insights · explainability · cross-category</p>
          <h2>Qloo slip</h2>
          <p className="lead">Destination and brand in. Artist and movie out. A commit needs a contributor score of at least 0.10.</p>

          {result.signals.length ? (
            <div className="signals">
              {result.signals.map((entity) => (
                <article className="signal" key={entity.id}>
                  <strong>{entity.name}</strong>
                  <p className="meta">
                    {entity.type} · <code>{entity.id}</code>
                  </p>
                </article>
              ))}
            </div>
          ) : null}
          {result.tags.length ? (
            <p className="tagline meta">
              Tag signal {result.tags.map((tag) => `${tag.name} · ${tag.id}`).join(", ")}. Explainability on the commits names entities.
            </p>
          ) : null}
          {result.parsed.anchorNote ? <p className="anchor">{result.parsed.anchorNote}</p> : null}

          {result.music || result.shot ? (
            <div className="decisions">
              {result.music ? <DecisionCard decision={result.music} title="Music" /> : <Withdrawn title="Music" message={result.message} />}
              {result.shot ? <DecisionCard decision={result.shot} title="Camera" /> : <Withdrawn title="Camera" message={result.message} />}
            </div>
          ) : (
            <div className="withdrawn">
              <div className="label"><span>No commit</span></div>
              <p className="phrase">Nothing to call.</p>
              <p>{result.message}</p>
            </div>
          )}

          <Trace rows={result.trace} />
          <div className="foot">
            <span>{result.message}</span>
            {receipt ? <a href={receipt}>Signed summary of these IDs</a> : <span>Nothing to sign.</span>}
          </div>
        </section>
      </div>
      <p className="limits">
        Aggregate affinity only. This is not a viewer's profile, a sync license, or a prediction that the film will work. A signature shows these IDs left the server together. It does not prove the graph is right.
      </p>
    </main>
  );
}

function Withdrawn({ title, message }: { title: string; message: string }) {
  return (
    <article className="withdrawn">
      <div className="label"><span>{title}</span><span>Withdrawn</span></div>
      <p>{message}</p>
    </article>
  );
}
