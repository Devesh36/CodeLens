import { SignJWT, jwtVerify } from "jose";
import bcryptjs from "bcryptjs";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);

const JWT_EXPIRATION = "30d";

export interface JWTPayload {
  userId: string;
  email: string;
  // allow extra claims when passed to jose's SignJWT
  [key: string]: unknown;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secret);

  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

export function setAuthCookie(token: string): string {
  return `auth=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000; ${
    process.env.NODE_ENV === "production" ? "Secure;" : ""
  }`;
}
