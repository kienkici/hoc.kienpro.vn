"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  params: {
    courseSlug: string;
  };
}

export default function CourseLearnRedirectPage({ params }: Props) {
  const { courseSlug } = params;
  const router = useRouter();

  useEffect(() => {
    const redirectFirstLesson = async () => {
      try {
        const supabase = createClient();

        // 1. Lấy thông tin khóa học
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("id")
          .eq("slug", courseSlug)
          .maybeSingle();

        if (courseError || !courseData) {
          console.error("Không tìm thấy khóa học:", courseError);
          router.push("/dashboard");
          return;
        }

        // 2. Lấy danh sách chương và bài học
        const { data: modulesData, error: modulesError } = await supabase
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

        if (modulesError || !modulesData || modulesData.length === 0) {
          console.error("Không tìm thấy chương học:", modulesError);
          router.push("/dashboard");
          return;
        }

        // 3. Tìm bài học đầu tiên của chương học đầu tiên
        let firstLessonSlug = "";
        for (const mod of modulesData) {
          if (mod.lessons && mod.lessons.length > 0) {
            // Sắp xếp bài học theo order_index tăng dần
            const sortedLessons = [...mod.lessons].sort((a: any, b: any) => a.order_index - b.order_index);
            firstLessonSlug = sortedLessons[0].slug;
            break;
          }
        }

        if (firstLessonSlug) {
          router.replace(`/learn/${courseSlug}/${firstLessonSlug}`);
        } else {
          console.error("Khóa học chưa có bài học nào");
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Lỗi chuyển hướng bài học:", err);
        router.push("/dashboard");
      }
    };

    redirectFirstLesson();
  }, [courseSlug, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-3 bg-zinc-950 text-white">
      <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      <span className="text-sm text-zinc-400">Đang chuẩn bị lộ trình học tập...</span>
    </div>
  );
}
