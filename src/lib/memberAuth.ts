import "server-only";

import { cookies } from "next/headers";

import { prisma } from "./prisma";
import {
  MEMBER_SESSION_COOKIE,
  createMemberSessionToken,
  verifyMemberSessionToken,
} from "./memberSession";

export { MEMBER_SESSION_COOKIE };

const MEMBER_SESSION_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export async function setMemberSession(memberId: string): Promise<void> {
  const token = await createMemberSessionToken(memberId);
  const cookieStore = await cookies();
  cookieStore.set(MEMBER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MEMBER_SESSION_MAX_AGE,
  });
}

export async function clearMemberSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MEMBER_SESSION_COOKIE);
}

export async function getCurrentMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;
  return verifyMemberSessionToken(token);
}

export async function getCurrentMember() {
  const memberId = await getCurrentMemberId();
  if (!memberId) return null;
  return prisma.member.findUnique({ where: { id: memberId } });
}
