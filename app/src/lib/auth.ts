import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ver-access-session";

type Session = { token: string; expiresAt: number };

function readStored(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    return session.token && session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

let session = readStored();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getToken(): string | null {
  return session && session.expiresAt > Date.now() ? session.token : null;
}

export function setSession(token: string, expiresAt: Date) {
  session = { token, expiresAt: expiresAt.getTime() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // storage unavailable: the session then lives until the page is closed
  }
  emit();
}

export function clearSession() {
  session = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to clear
  }
  emit();
}

/** The current token, re-rendering when the user logs in or out (or the server rejects it). */
export function useToken(): string | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getToken,
  );
}
