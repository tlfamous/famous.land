import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { EncryptedHomeSecret } from "./types";

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function hexToBytes(value: string): Uint8Array {
  return Uint8Array.from(value.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16));
}

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function configuredKeyMaterial(): Promise<string> {
  const processValue = process.env.HOMES_DATA_KEY?.trim();
  if (processValue) return processValue;

  try {
    const context = await getCloudflareContext({ async: true });
    const value = (context.env as { HOMES_DATA_KEY?: string }).HOMES_DATA_KEY?.trim();
    if (value) return value;
  } catch {
    // Local Next.js does not expose a Cloudflare context.
  }

  throw new Error("HOMES_DATA_KEY must be configured before home secrets can be used.");
}

async function keyBytes(): Promise<Uint8Array> {
  const material = await configuredKeyMaterial();
  const unprefixed = material.replace(/^(?:base64|hex):/i, "");

  if (/^(?:hex:)?[a-f\d]{64}$/i.test(material)) {
    return hexToBytes(unprefixed);
  }

  if (/^base64:/i.test(material)) {
    const decoded = base64UrlToBytes(unprefixed);
    if (decoded.byteLength !== 32) {
      throw new Error("HOMES_DATA_KEY base64 material must decode to exactly 32 bytes.");
    }
    return decoded;
  }

  // Accept an arbitrary secret value while always importing a 256-bit AES key.
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(material));
  return new Uint8Array(digest);
}

async function encryptionKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", arrayBuffer(await keyBytes()), { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt"
  ]);
}

function additionalData(context: string): Uint8Array {
  return new TextEncoder().encode(`famous.land/homes:${context}:v1`);
}

export async function encryptHomeSecret(
  plaintext: string,
  context: string
): Promise<EncryptedHomeSecret> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: arrayBuffer(iv),
      additionalData: arrayBuffer(additionalData(context)),
      tagLength: 128
    },
    await encryptionKey(),
    arrayBuffer(new TextEncoder().encode(plaintext))
  );

  return {
    ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)),
    iv: bytesToBase64Url(iv),
    algorithm: "AES-GCM-256",
    keyVersion: 1
  };
}

export async function decryptHomeSecret(
  secret: Pick<EncryptedHomeSecret, "ciphertext" | "iv" | "algorithm" | "keyVersion">,
  context: string
): Promise<string> {
  if (secret.algorithm !== "AES-GCM-256" || secret.keyVersion !== 1) {
    throw new Error("Unsupported home secret encryption format.");
  }

  try {
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: arrayBuffer(base64UrlToBytes(secret.iv)),
        additionalData: arrayBuffer(additionalData(context)),
        tagLength: 128
      },
      await encryptionKey(),
      arrayBuffer(base64UrlToBytes(secret.ciphertext))
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    throw new Error("Unable to decrypt home secret.");
  }
}

export async function encryptHomeSecretJson<T>(value: T, context: string) {
  return encryptHomeSecret(JSON.stringify(value), context);
}

export async function decryptHomeSecretJson<T>(
  secret: Pick<EncryptedHomeSecret, "ciphertext" | "iv" | "algorithm" | "keyVersion">,
  context: string
): Promise<T> {
  return JSON.parse(await decryptHomeSecret(secret, context)) as T;
}
