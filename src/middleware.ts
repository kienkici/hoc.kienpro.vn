import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // 1. Chuyển hướng tự động từ /learn/[courseSlug] sang /learn/[courseSlug]/[lessonSlug]
  const learnMatch = pathname.match(/^\/learn\/([^/]+)$/);
  if (learnMatch) {
    const courseSlug = learnMatch[1];
    if (courseSlug !== "success" && courseSlug !== "failed" && user) {
      try {
        const { data: courseData } = await supabase
          .from("courses")
          .select("id")
          .eq("slug", courseSlug)
          .maybeSingle();

        if (courseData) {
          const { data: modulesData } = await supabase
            .from("course_modules")
            .select(`
              id,
              order_index,
              lessons (
                slug,
                order_index
              )
            `)
            .eq("course_id", courseData.id)
            .order("order_index", { ascending: true });

          if (modulesData && modulesData.length > 0) {
            let firstLessonSlug = "";
            for (const mod of modulesData) {
              if (mod.lessons && mod.lessons.length > 0) {
                const sortedLessons = [...mod.lessons].sort((a: any, b: any) => a.order_index - b.order_index);
                firstLessonSlug = sortedLessons[0].slug;
                break;
              }
            }

            if (firstLessonSlug) {
              const url = request.nextUrl.clone();
              url.pathname = `/learn/${courseSlug}/${firstLessonSlug}`;
              return NextResponse.redirect(url);
            }
          }
        }
      } catch (err) {
        console.error("Middleware redirect error:", err);
      }
    }
  }

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
