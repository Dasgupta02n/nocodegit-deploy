import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { config } from "./config";
import { getDb, type UserRow } from "./db";

type SessionPayload = { sub: string; email: string };

function secretKey() {
  return new TextEncoder().encode(config.secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, config.bcryptRounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: { id: string; email: string }) {
  const token = await new SignJWT({ email: user.email } satisfies Omit<
    SessionPayload,
    "sub"
  >)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${config.sessionDays}d`)
    .sign(secretKey());

  const jar = await cookies();
  jar.set(config.sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: config.sessionDays * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.set(config.sessionCookie, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<UserRow | null> {
  const jar = await cookies();
  const token = jar.get(config.sessionCookie)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const id = payload.sub;
    if (!id) return null;
    const user = getDb()
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as UserRow | undefined;
    return user ?? null;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<UserRow> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export function createUser(email: string, password: string, name?: string) {
  const id = uuid();
  const password_hash = bcrypt.hashSync(password, config.bcryptRounds);
  getDb()
    .prepare(
      `INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)`
    )
    .run(id, email.toLowerCase().trim(), password_hash, name || null);
  return getDb()
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(id) as UserRow;
}

export function findUserByEmail(email: string) {
  return getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase().trim()) as UserRow | undefined;
}
