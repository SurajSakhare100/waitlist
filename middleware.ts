import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

// Protect all routes under these paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upgrade/:path*",
    "/api/waitlists/:path*",
    "/api/payments/:path*",
    "/api/dashboard/:path*",
  ]
} 