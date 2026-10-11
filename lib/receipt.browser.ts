import nacl from "tweetnacl";
import { canonical } from "./canonical";

/**
 * Same demo receipt key as lib/receipt.ts, stored as the raw seed so this
 * file can run in the browser. It is not the Qloo API key.
 * The Pages bundle signs with this key. Anyone can mint a slip.
 */
const DEMO_SEED = Uint8Array.from([
  176, 190, 218, 150, 9, 200, 115, 149, 220, 67, 107, 232, 166, 68, 158, 11, 70, 111, 184, 55, 76, 146,
  200, 114, 160, 95, 208, 148, 232, 7, 176, 28,
]);

const PUBLIC_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAye0PFthcqmu5sIs9SE2qKS6n4FE7klghP9sB8NXq8Fk=
-----END PUBLIC KEY-----
`;

const demoKeys = nacl.sign.keyPair.fromSeed(DEMO_SEED);

export type VerifyResult =
  | { ok: true; body: unknown }
  | { ok: false; reason: string; body: unknown | null };

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) throw new Error("bad base64url");
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + pad);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function signPayload(value: unknown): { payload: string; signature: string; publicKey: string } {
  const json = canonical(value);
  const message = new TextEncoder().encode(json);
  const signature = nacl.sign.detached(message, demoKeys.secretKey);
  return { payload: toBase64Url(message), signature: toBase64Url(signature), publicKey: PUBLIC_PEM.trim() };
}

export function verifyPayload(payload: string, signature: string): VerifyResult {
  let json: string;
  try {
    json = new TextDecoder().decode(fromBase64Url(payload));
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
  let sig: Uint8Array;
  try {
    sig = fromBase64Url(signature);
  } catch {
    return { ok: false, reason: "Signature is not base64url.", body };
  }
  let valid = false;
  try {
    valid = nacl.sign.detached.verify(new TextEncoder().encode(json), sig, demoKeys.publicKey);
  } catch {
    valid = false;
  }
  if (!valid) return { ok: false, reason: "Signature does not hold.", body };
  return { ok: true, body };
}

export function publicKeyPem(): string {
  return PUBLIC_PEM.trim();
}
