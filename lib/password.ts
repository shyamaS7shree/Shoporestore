import { createHash, randomBytes, timingSafeEqual } from "crypto";

const HASH_PREFIX = "sha256";

function hashPassword(password: string, salt: string) {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${HASH_PREFIX}:${salt}:${hashPassword(password, salt)}`;
}

export function verifyPassword(password: string, storedPassword: string) {
  const [prefix, salt, hash] = storedPassword.split(":");

  if (prefix !== HASH_PREFIX || !salt || !hash) {
    return password === storedPassword;
  }

  const nextHash = hashPassword(password, salt);
  const storedBuffer = Buffer.from(hash, "hex");
  const nextBuffer = Buffer.from(nextHash, "hex");

  return storedBuffer.length === nextBuffer.length && timingSafeEqual(storedBuffer, nextBuffer);
}

