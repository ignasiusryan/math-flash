import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEV_MODE = !process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY === "sk_test_placeholder";

export default async function middleware(request: NextRequest) {
  if (DEV_MODE) {
    // Dev mode: allow all routes
    return NextResponse.next();
  }

  // Production mode: use Clerk middleware
  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

  return clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  })(request, {} as never);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
