import { withAuth } from "next-auth/middleware";

const AUTH_DEBUG = process.env.AUTH_DEBUG === "1";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      if (AUTH_DEBUG) {
        try {
          const cookieHeader = req.headers.get("cookie");
          const cookieNames = cookieHeader
            ? cookieHeader
                .split(";")
                .map((c) => c.split("=")[0]?.trim())
                .filter(Boolean)
                .slice(0, 20)
            : [];

          const data = {
            pathname: req.nextUrl.pathname,
            origin: req.nextUrl.origin,
            host: req.headers.get("host"),
            xfHost: req.headers.get("x-forwarded-host"),
            xfProto: req.headers.get("x-forwarded-proto"),
            cookieNames,
            tokenPresent: Boolean(token),
            tokenKeys: token ? Object.keys(token) : [],
            tokenSubPresent: Boolean(token && typeof token.sub === "string"),
            nextAuthSecretPresent: Boolean(process.env.NEXTAUTH_SECRET),
            nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length ?? 0,
          };

          // #region agent log
          const payload = {sessionId:'e7dd5c',runId:'pre-fix',hypothesisId:'H_middleware_token_missing',location:'middleware.ts:authorized',message:'withAuth authorized() evaluated',data,timestamp:Date.now()};
          fetch('http://127.0.0.1:7632/ingest/06d69de6-7191-402a-a979-7f081457ccf1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e7dd5c'},body:JSON.stringify(payload)}).catch(()=>{});
          console.log("[auth-debug]", JSON.stringify(payload));
          // #endregion agent log
        } catch {
          // no-op
        }
      }

      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/deals/:path*",
    "/api/deals/:path*",
    "/api/reminders/:path*",
    "/api/invoices/:path*",
  ],
};

