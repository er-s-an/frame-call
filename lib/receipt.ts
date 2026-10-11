import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";
import { canonical } from "./canonical";

/**
 * Demo receipt key. It is in the repository on purpose.
 * It is not the Qloo API key and it is not a production identity.
 * Anyone with this file can sign a slip. The check shows the browser
 * did not edit the entity IDs after the server committed them.
 */
const PRIVATE_PEM = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEILC+2pYJyHOV3ENr6KZEngtGb7g3TJLIcqBf0JToB7Ac
-----END PRIVATE KEY-----
`;

const PUBLIC_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAye0PFthcqmu5sIs9SE2qKS6n4FE7klghP9sB8NXq8Fk=
-----END PUBLIC KEY-----
`;

const privateKey = createPrivateKey(PRIVATE_PEM);
const publicKey = createPublicKey(PUBLIC_PEM);

export { canonical } from "./canonical";

export function signPayload(value: unknown): { payload: string; signature: string; publicKey: string } {
  const json = canonical(value);
  const payload = Buffer.from(json, "utf8").toString("base64url");
  const signature = sign(null, Buffer.from(json, "utf8"), privateKey).toString("base64url");
  return { payload, signature, publicKey: PUBLIC_PEM.trim() };
}

export type VerifyResult =
  | { ok: true; body: unknown }
  | { ok: false; reason: string; body: unknown | null };

export function verifyPayload(payload: string, signature: string): VerifyResult {
  let json: string;
  try {
    json = Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return { ok: false, reason: "Payload is not base64url.", body: null };
  }
  let body: unknown;
  try {
    body = JSON.parse(json);
  } catch {
    return { ok: false, reason: "Payload is not JSON.", body: null };
  }
  if (canonical(body) !== json) {
    return { ok: false, reason: "Payload is not in canonical form.", body };
  }
  let sig: Buffer;
  try {
    sig = Buffer.from(signature, "base64url");
  } catch {
    return { ok: false, reason: "Signature is not base64url.", body };
  }
  const valid = verify(null, Buffer.from(json, "utf8"), publicKey, sig);
  if (!valid) return { ok: false, reason: "Signature does not hold.", body };
  return { ok: true, body };
}

export function publicKeyPem(): string {
  return PUBLIC_PEM.trim();
}
