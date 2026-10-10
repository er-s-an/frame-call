import Link from "next/link";
import { verifyPayload } from "../../lib/receipt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Facts = {
  v?: number;
  mode?: string;
  brief?: string;
  music?: { id?: string; name?: string; affinity?: number | null; contributors?: { id: string; score: number }[] } | null;
  shot?: { id?: string; name?: string; affinity?: number | null; contributors?: { id: string; score: number }[] } | null;
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span className="meta">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; s?: string }>;
}) {
  const params = await searchParams;
  const payload = params.p ?? "";
  const signature = params.s ?? "";
  const checked = payload && signature ? verifyPayload(payload, signature) : null;
  const body = checked?.body && typeof checked.body === "object" ? (checked.body as Facts) : null;

  return (
    <main className="page verify">
      <p className="back">
        <Link href="/">Back to Frame Call</Link>
      </p>
      <section className="slip">
        <p className="eyebrow">Receipt check</p>
        <h1>Signed summary</h1>
        <p className="lead">
          This page checks the entity IDs on a slip. The product is the music call and the camera call. This signature uses a demo key that ships in the repository.
        </p>
        {!checked ? <p>Open this page from a slip that has something to sign.</p> : null}
        {checked && !checked.ok ? (
          <>
            <span className="mark bad">DOES NOT HOLD</span>
            <p>{checked.reason}</p>
          </>
        ) : null}
        {checked?.ok ? (
          <>
            <span className="mark ok">HOLDS</span>
            <Fact label="Mode" value={body?.mode === "fixture" ? "Fixture. Not a live Qloo response." : "Live request."} />
            <Fact label="Brief" value={body?.brief ?? ""} />
            <Fact label="Music entity" value={body?.music ? `${body.music.name ?? ""} · ${body.music.id ?? ""}` : "Withdrawn"} />
            <Fact label="Camera entity" value={body?.shot ? `${body.shot.name ?? ""} · ${body.shot.id ?? ""}` : "Withdrawn"} />
            <Fact
              label="Music path"
              value={
                body?.music?.contributors?.map((row) => `${row.id} ${row.score}`).join(" · ") || "None"
              }
            />
            <Fact
              label="Camera path"
              value={body?.shot?.contributors?.map((row) => `${row.id} ${row.score}`).join(" · ") || "None"}
            />
          </>
        ) : null}
        <p className="credit">
          The signature shows this server recorded these IDs together. It does not prove Qloo’s model, a viewer’s taste, a music license, or that the opening film will work. Aggregate affinity is not a personal profile.
        </p>
      </section>
    </main>
  );
}
