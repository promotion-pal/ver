import { Code, ConnectError, createClient, type Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { AuthService } from "@ver/proto/service/auth.service_pb";
import { FeedbackService } from "@ver/proto/service/feedback.service_pb";
import { JournalService, WorkEntryService } from "@ver/proto/service/journal.service_pb";
import { SchemeStageService } from "@ver/proto/service/scheme.service_pb";
import { clearSession, getToken } from "@/lib/auth";

/** Adds the session token; a server-side "unauthenticated" drops the session, which shows the login screen. */
const authInterceptor: Interceptor = (next) => async (req) => {
  const token = getToken();
  if (token) req.header.set("Authorization", `Bearer ${token}`);
  try {
    return await next(req);
  } catch (error) {
    if (error instanceof ConnectError && error.code === Code.Unauthenticated) clearSession();
    throw error;
  }
};

/**
 * `/api` is proxied to the gRPC/Connect server — by the Vite dev server
 * locally and by nginx in Docker — so the browser never needs CORS.
 */
const transport = createConnectTransport({
  baseUrl: import.meta.env.VITE_API_URL ?? "/api",
  interceptors: [authInterceptor],
});

export const authClient = createClient(AuthService, transport);
export const journalClient = createClient(JournalService, transport);
export const workEntryClient = createClient(WorkEntryService, transport);
export const feedbackClient = createClient(FeedbackService, transport);
export const schemeStageClient = createClient(SchemeStageService, transport);
