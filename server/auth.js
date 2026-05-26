import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const TOKEN_SECRET = process.env.AUTH_SECRET || "replace-this-secret-before-deploying-health-manager";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const base64url = (value) => Buffer.from(value).toString("base64url");

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const key = await scrypt(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return stored.length === key.length && timingSafeEqual(stored, key);
}

export function createToken(userId) {
  const payload = {
    sub: userId,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = createHmac("sha256", TOKEN_SECRET).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || !token.includes(".")) return null;

  const [encodedPayload, signature] = token.split(".");
  const expected = createHmac("sha256", TOKEN_SECRET).update(encodedPayload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload.sub || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
