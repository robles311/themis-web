import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  // Middleware placeholder for auth protection
  // The actual auth middleware will be configured when the auth module is set up
  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*"],
};
