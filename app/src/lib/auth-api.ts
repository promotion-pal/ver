import { authClient } from "@/lib/api";
import { setSession } from "@/lib/auth";

/** Verifies the password on the server and stores the returned session token. */
export async function login(password: string): Promise<void> {
  const res = await authClient.login({ password });
  const expiresAt = res.expiresAt ? new Date(Number(res.expiresAt.seconds) * 1000) : new Date(Date.now() + 3600_000);
  setSession(res.token, expiresAt);
}

/** Throws (and drops the session) unless the server accepts the stored token. */
export async function checkSession(): Promise<void> {
  await authClient.check({});
}
