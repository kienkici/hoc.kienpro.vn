import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // Protected paths
  const isProtectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/my-courses") ||
    pathname.startsWith("/notes") ||
    pathname.startsWith("/profile");

  // If user is not logged in and is accessing protected route, redirect to login
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes role checking
  if (pathname.startsWith("/admin") && user) {
    // Fetch user's role from user_roles
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const userRole = roleData?.role;

    // Students are not allowed to access /admin
    if (userRole === "student" || !userRole) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
