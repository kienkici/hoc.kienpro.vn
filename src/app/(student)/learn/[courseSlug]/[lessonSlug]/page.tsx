"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Play, 
  BookOpen, 
  Download, 
  CheckSquare, 
  HelpCircle, 
  PenTool, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  FileText, 
  ArrowLeft,
  Loader2,
  Lock
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getBunnyVideoUrl } from "@/server/actions/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonChecklist } from "@/components/lesson/LessonChecklist";
import { LessonNotes } from "@/components/lesson/LessonNotes";
import { LessonResources } from "@/components/lesson/LessonResources";
import { AIMentorPlaceholder } from "@/components/lesson/AIMentorPlaceholder";

interface Props {
  params: {
    courseSlug: string;
    lessonSlug: string;
  };
}

export default function LessonLearnPage({ params }: Props) {
  const { courseSlug, lessonSlug } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [videoError, setVideoError] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  
  // Progress & checklist states
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchLearnData = async () => {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }

      // 1. Fetch Course details
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", courseSlug)
        .single();

      if (!courseData) {
        setIsLoading(false);
        return;
      }
      setCourse(courseData);

      // 2. Fetch Modules & Lessons
      const { data: modulesData } = await supabase
        .from("course_modules")
        .select(`
          *,
          lessons (
            *
          )
        `)
        .eq("course_id", courseData.id)
        .order("order_index", { ascending: true });

      setModules(modulesData || []);

      // 3. Find current lesson from modulesData
      let foundLesson: any = null;
      if (modulesData) {
        for (const mod of modulesData) {
          const matched = mod.lessons?.find((l: any) => l.slug === lessonSlug);
          if (matched) {
            foundLesson = matched;
            break;
          }
        }
      }

      if (!foundLesson) {
        setIsLoading(false);
        return;
      }
      setCurrentLesson(foundLesson);

      // 4. Fetch lesson resources
      const { data: resources } = await supabase
        .from("lesson_resources")
        .select("*")
        .eq("lesson_id", foundLesson.id);
      foundLesson.resources = resources || [];

      // 5. Fetch lesson checklist
      const { data: checklist } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("lesson_id", foundLesson.id);
      foundLesson.checklist = checklist || [];

      // 6. Generate signed video URL if Bunny Stream
      if (foundLesson.video_provider === "bunny" && foundLesson.video_id) {
        // If not a preview and the user is not logged in:
        if (!foundLesson.is_preview && !user) {
          setVideoError("Bài học này bị khóa. Vui lòng đăng nhập hoặc mua khóa học để bắt đầu học tập.");
        } else {
          const signResult = await getBunnyVideoUrl(foundLesson.video_id, foundLesson.id);
          if (signResult.success && signResult.embedUrl) {
            setEmbedUrl(signResult.embedUrl);
            setVideoError(""); // Clear any previous errors
          } else {
            setVideoError(signResult.error || "Không thể tải cấu hình phát video.");
          }
        }
      }

      // 7. Get user completed lessons (only if logged in)
      if (user) {
        const { data: progress } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("status", "COMPLETED");
        const completedIds = progress?.map((p) => p.lesson_id) || [];
        setCompletedLessons(completedIds);
        setIsCompleted(completedIds.includes(foundLesson.id));
      }

      setIsLoading(false);
    };

    fetchLearnData();
  }, [courseSlug, lessonSlug]);

  const handleMarkComplete = async () => {
    if (!currentLesson || !userId) return;
    
    const supabase = createClient();
    const newStatus = !isCompleted;
    
    setIsCompleted(newStatus);
    if (newStatus) {
      setCompletedLessons((prev) => [...prev, currentLesson.id]);
      await supabase.from("lesson_progress").upsert({
        user_id: userId,
        lesson_id: currentLesson.id,
        status: "COMPLETED",
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,lesson_id" });
    } else {
      setCompletedLessons((prev) => prev.filter((id) => id !== currentLesson.id));
      await supabase.from("lesson_progress").delete().match({
        user_id: userId,
        lesson_id: currentLesson.id
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
        <span className="text-sm font-semibold">Đang chuẩn bị bài giảng bảo mật...</span>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-400 gap-4 text-center p-6">
        <h2 className="text-xl font-bold text-white">Không tìm thấy bài học</h2>
        <p className="text-xs text-zinc-500">
          Bài học này không tồn tại hoặc tài khoản của anh chưa được phân quyền vào lớp học.
        </p>
        <Button variant="gold" size="sm" asChild>
          <Link href="/dashboard">Quay lại Bảng điều khiển</Link>
        </Button>
      </div>
    );
  }

  // Calculate learning progress percentage
  const totalLessonsCount = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const completedPercent = totalLessonsCount > 0 
    ? Math.round((completedLessons.length / totalLessonsCount) * 100) 
    : 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-950 text-zinc-100">
      
      {/* LEFT COLUMN: Course Navigation Sidebar (Desktop) */}
      <div className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-900/30 flex flex-col justify-between">
        <div className="p-4 border-b border-zinc-800 space-y-3">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Bảng điều khiển
          </Link>
          <h2 className="font-extrabold text-sm text-white line-clamp-2 leading-snug">
            {course.title}
          </h2>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
              <span>Tiến độ học tập</span>
              <span className="text-gold-400">{completedPercent}%</span>
            </div>
            <Progress value={completedPercent} className="h-1.5" />
          </div>
        </div>

        {/* Curriculum Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {modules.map((mod) => (
            <div key={mod.id} className="space-y-1.5">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">
                {mod.title}
              </h3>
              <div className="space-y-1">
                {mod.lessons?.map((les: any) => {
                  const isActive = les.slug === lessonSlug;
                  const isCompletedLesson = completedLessons.includes(les.id);

                  return (
                    <Link
                      key={les.id}
                      href={`/learn/${courseSlug}/${les.slug}`}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        isActive
                          ? "bg-gold-500/10 border-gold-500/50 text-gold-400"
                          : isCompletedLesson
                          ? "bg-zinc-900/40 border-zinc-800/40 text-zinc-300 hover:border-zinc-700"
                          : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isCompletedLesson ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Play className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-gold-400 fill-gold-400/20" : "text-zinc-500"}`} />
                        )}
                        <span className="truncate">{les.title}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Video Player & Tabs Details */}
      <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        {/* Secure Video Player */}
        <div className="bg-zinc-950 p-4 lg:p-6 flex flex-col items-center">
          <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                loading="lazy"
                className="w-full h-full border-0 absolute top-0 left-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            ) : videoError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-300 gap-3">
                <Lock className="w-10 h-10 text-gold-400/80 mb-1" />
                <h4 className="text-base font-bold text-white">Nội dung này đã bị khóa</h4>
                <p className="text-xs text-zinc-400 max-w-md px-4">{videoError}</p>
                {!userId && (
                  <Button variant="gold" size="sm" className="mt-2 font-bold text-xs" asChild>
                    <Link href={`/checkout/${courseSlug}`}>Đăng Ký Khóa Học Ngay</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-900/90 gap-2">
                <Play className="w-12 h-12 text-gold-400/50 mb-2" />
                <h4 className="text-sm font-bold text-white">Chưa Có Video Bài Giảng</h4>
                <p className="text-xs text-zinc-400">
                  Bài học này chưa được cấu hình video hoặc sử dụng tài liệu tự học.
                </p>
              </div>
            )}
          </div>

          {/* Lesson Header & Mark Complete */}
          <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 border-b border-zinc-800 pb-6">
            <div className="space-y-1">
              <h1 className="text-lg md:text-xl font-extrabold text-white">
                {currentLesson.title}
              </h1>
              <p className="text-xs text-zinc-400">
                Lộ trình khóa học: {course.title}
              </p>
            </div>

            <Button 
              onClick={handleMarkComplete} 
              variant={isCompleted ? "secondary" : "gold"} 
              size="sm"
              className="font-bold text-xs"
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                  Đã hoàn thành bài học
                </>
              ) : (
                "Đánh dấu hoàn thành"
              )}
            </Button>
          </div>
        </div>

        {/* Tab Details */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 max-w-5xl mx-auto w-full">
          <Tabs defaultValue="content" className="w-full space-y-6">
            <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
              <TabsTrigger value="content" className="text-xs px-4">Nội Dung</TabsTrigger>
              <TabsTrigger value="checklist" className="text-xs px-4">
                Checklist ({currentLesson.checklist?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs px-4">
                Tài Liệu ({currentLesson.resources?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs px-4">Ghi Chú</TabsTrigger>
              <TabsTrigger value="mentor" className="text-xs px-4 text-gold-400">AI Mentor</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="prose prose-invert prose-xs max-w-none text-zinc-300 bg-zinc-900/20 p-5 rounded-xl border border-zinc-800/60">
                <h3 className="text-sm font-bold text-white mb-2">Tóm tắt bài học:</h3>
                <p className="text-xs leading-relaxed">{currentLesson.description || "Chưa có mô tả chi tiết."}</p>
                
                <h3 className="text-sm font-bold text-white mt-4 mb-2">Chi tiết lý thuyết:</h3>
                <div className="text-xs leading-relaxed whitespace-pre-wrap">
                  {currentLesson.content || "Nội dung lý thuyết chưa được cung cấp."}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="checklist">
              <LessonChecklist 
                initialItems={currentLesson.checklist || []}
              />
            </TabsContent>

            <TabsContent value="resources">
              <LessonResources 
                resources={currentLesson.resources || []}
              />
            </TabsContent>

            <TabsContent value="notes">
              <LessonNotes />
            </TabsContent>

            <TabsContent value="mentor">
              <AIMentorPlaceholder />
            </TabsContent>
          </Tabs>
        </div>
      </div>

    </div>
  );
}
