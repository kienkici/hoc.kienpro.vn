"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, GraduationCap, Award, PlayCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function StudentDashboardPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // 1. Fetch Profile
      const { data: profData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profData);

      // 2. Fetch Enrollments joined with courses
      const { data: enrollData } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses (
            *
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "ACTIVE");

      setEnrollments(enrollData || []);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
        <span className="text-sm text-zinc-400">Đang tải bảng điều khiển học tập...</span>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <Badge variant="gold" className="uppercase tracking-wider">Học Viên Kiên Pro</Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Chào mừng quay lại, {profile?.full_name || "Học Viên"}!
          </h1>
          <p className="text-xs text-zinc-400">
            Hôm nay là một ngày tuyệt vời để học kỹ năng mới. Hãy tiếp tục lộ trình bài học của bạn.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
            <span className="block text-2xl font-bold text-white">{enrollments.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Khóa học của tôi</span>
          </div>
          <div className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
            <span className="block text-2xl font-bold text-gold-400">100%</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gold-400" /> Khóa Học Đang Kích Hoạt
        </h2>

        {enrollments.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-gold-400 mx-auto">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Chưa đăng ký khóa học nào</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Anh hãy đăng ký mua khóa học để bắt đầu lộ trình học tập cao cấp của thương hiệu Kiên Pro.
            </p>
            <Button variant="gold" size="sm" asChild>
              <Link href="/#courses">Xem Danh Sách Khóa Học</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enroll) => {
              const course = enroll.courses;
              if (!course) return null;

              return (
                <div key={enroll.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden hover:border-zinc-700 transition-all flex flex-col justify-between">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={course.thumbnail_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400"}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {course.category === "thiet-ke" ? "Thiết Kế Web" : "Kỹ Năng"}
                      </Badge>
                      <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {course.short_description}
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button variant="gold" className="w-full text-xs font-bold" asChild>
                        <Link href={`/courses/${course.slug}`}>
                          <PlayCircle className="w-4 h-4 mr-1.5" /> Vào Học Ngay
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
