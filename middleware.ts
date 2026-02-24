import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token }) => !!token,
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

