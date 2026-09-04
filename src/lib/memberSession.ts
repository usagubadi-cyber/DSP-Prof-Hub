import { SignJWT, jwtVerify } from "jose";

export const MEMBER_SESSION_COOKIE = "dsp_member_session";

const ALG = "HS256";
const SESSION_LIFETIME = "180d";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createMemberSessionToken(
  memberId: string
): Promise<string> {
  return new SignJWT({ memberId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(SESSION_LIFETIME)
    .sign(getSecretKey());
}

export async function verifyMemberSessionToken(
  token: string | undefined
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.memberId === "string" ? payload.memberId : null;
  } catch {
    return null;
  }
}
