"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Lock,
  Menu,
  X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getBunnyVideoUrl, getLessonResources, getLessonLearnData } from "@/server/actions/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonChecklist } from "@/components/lesson/LessonChecklist";
import { LessonNotes } from "@/components/lesson/LessonNotes";
import { LessonResources } from "@/components/lesson/LessonResources";
import { AIMentorPlaceholder } from "@/components/lesson/AIMentorPlaceholder";
import { ImageLightboxModal } from "@/components/shared/ImageLightboxModal";
import { ZoomIn, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  params: {
    courseSlug: string;
    lessonSlug: string;
  };
}

export default function LessonLearnPage({ params }: Props) {
  const { courseSlug, lessonSlug } = params;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isLessonChanging, setIsLessonChanging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [videoError, setVideoError] = useState<string>("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  
  // Progress & checklist states
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Lightbox state for images in lesson
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ url: "", title: "" });

  const openLightbox = (url: string, title: string) => {
    setLightboxImage({ url, title });
    setLightboxOpen(true);
  };

  useEffect(() => {
    const fetchLearnData = async () => {
      if (isFirstLoad) {
        setIsLoading(true);
      } else {
        setIsLessonChanging(true);
      }

      // Gọi Server Action an toàn để lấy dữ liệu bài giảng & phân quyền (cho phép học thử preview)
      const result = await getLessonLearnData(courseSlug, lessonSlug);

      if (!result.success || !result.course || !result.currentLesson) {
        setIsLoading(false);
        setIsLessonChanging(false);
        return;
      }

      setCourse(result.course);
      setModules(result.modules || []);
      setCurrentLesson(result.currentLesson);
      setIsEnrolled(!!result.isEnrolled);
      setUserId(result.userId || "");
      setUserEmail(result.userEmail || "");

      if (result.hasAccess && result.embedUrl) {
        setEmbedUrl(result.embedUrl);
        setVideoError("");
      } else if (!result.hasAccess) {
        setVideoError("Bài học này thuộc nội dung nâng cao. Vui lòng đăng ký khóa học để bắt đầu học tập.");
        setEmbedUrl("");
      } else {
        setEmbedUrl("");
        setVideoError("");
      }

      // Nếu học viên đã đăng nhập, tải tiến độ học tập từ database
      if (result.userId) {
        const supabase = createClient();
        const { data: progressRes } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", result.userId)
          .eq("completed", true);

        if (progressRes) {
          const completedIds = progressRes.map((p: any) => p.lesson_id) || [];
          setCompletedLessons(completedIds);
          setIsCompleted(completedIds.includes(result.currentLesson.id));
        }
      }

      setIsLoading(false);
      setIsFirstLoad(false);
      setIsLessonChanging(false);
    };

    fetchLearnData();
  }, [courseSlug, lessonSlug]);

  const getNextLessonUrl = () => {
    const allLessons: any[] = [];
    modules.forEach((mod) => {
      if (mod.lessons) {
        const sortedLessons = [...mod.lessons].sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
        allLessons.push(...sortedLessons);
      }
    });

    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      return `/learn/${courseSlug}/${nextLesson.slug}`;
    }
    return null;
  };

  const handleMarkComplete = async () => {
    if (!currentLesson || !userId || !course) return;
    
    const supabase = createClient();
    const newStatus = !isCompleted;
    
    setIsCompleted(newStatus);
    if (newStatus) {
      setCompletedLessons((prev) => [...prev, currentLesson.id]);
      const { error } = await supabase.from("lesson_progress").upsert({
        user_id: userId,
        course_id: course.id,
        lesson_id: currentLesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,lesson_id" });

      if (error) {
        console.error("Lỗi lưu tiến độ học tập:", error);
      }

      const nextUrl = getNextLessonUrl();
      if (nextUrl) {
        toast.success("Bài học hoàn thành! Đang chuyển sang bài tiếp theo...");
        router.push(nextUrl);
      } else {
        toast.success("Chúc mừng! Bạn đã hoàn thành bài học cuối cùng!");
      }
    } else {
      setCompletedLessons((prev) => prev.filter((id) => id !== currentLesson.id));
      await supabase.from("lesson_progress").delete().match({
        user_id: userId,
        lesson_id: currentLesson.id
      });
      toast.info("Đã hủy đánh dấu hoàn thành bài học.");
    }
  };

  // Tự động chuyển bài khi xem xong video Bunny Stream
  useEffect(() => {
    if (!currentLesson || !userId || isCompleted || !course) return;

    const handlePlayerMessage = async (e: MessageEvent) => {
      if (!e.origin.includes("mediadelivery.net")) return;

      let isEnded = false;
      try {
        if (typeof e.data === "string") {
          // Chỉ kích hoạt khi nhận tin nhắn kết thúc (ended), không check từ 'complete' để tránh dính 'setup-complete' lúc load player
          if (e.data.includes(":ended") || e.data === "ended") {
            isEnded = true;
          } else {
            const parsed = JSON.parse(e.data);
            if (parsed.event === "ended" || parsed.value === "ended" || parsed.event === "player:ended") {
              isEnded = true;
            }
          }
        } else if (e.data && typeof e.data === "object") {
          if (e.data.event === "ended" || e.data.value === "ended" || e.data.event === "player:ended") {
            isEnded = true;
          }
        }
      } catch (err) {}

      if (isEnded) {
        const supabase = createClient();
        setIsCompleted(true);
        setCompletedLessons((prev) => [...prev, currentLesson.id]);
        
        await supabase.from("lesson_progress").upsert({
          user_id: userId,
          course_id: course.id,
          lesson_id: currentLesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id,lesson_id" });

        const nextUrl = getNextLessonUrl();
        if (nextUrl) {
          toast.success("Đã học xong video! Tự động chuyển sang bài mới...");
          router.push(nextUrl);
        } else {
          toast.success("Chúc mừng! Bạn đã xem xong bài học cuối cùng!");
        }
      }
    };

    window.addEventListener("message", handlePlayerMessage);
    return () => window.removeEventListener("message", handlePlayerMessage);
  }, [currentLesson, userId, isCompleted, modules, course, router]);

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
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* LEFT COLUMN: Course Navigation Sidebar (Desktop fixed / Mobile sliding drawer) */}
      <div className={`
        fixed inset-y-0 left-0 w-80 bg-zinc-900 border-r border-zinc-800 z-50 transform transition-transform duration-300 flex flex-col justify-between
        lg:static lg:w-80 lg:translate-x-0 lg:z-auto lg:bg-zinc-900/30
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-4 border-b border-zinc-800 space-y-3 relative">
          <div className="flex justify-between items-center">
            <Link 
              href={userId ? "/dashboard" : `/courses/${courseSlug}`} 
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {userId ? "Bảng điều khiển" : "Chi tiết khóa học"}
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="lg:hidden p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Đóng danh sách"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
                  const isLockedLesson = !les.is_preview && !isEnrolled;

                  return (
                    <Link
                      key={les.id}
                      href={`/learn/${courseSlug}/${les.slug}`}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        isActive
                          ? "bg-gold-500/10 border-gold-500/50 text-gold-400 font-semibold"
                          : isCompletedLesson
                          ? "bg-zinc-900/40 border-zinc-800/40 text-zinc-300 hover:border-zinc-700"
                          : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
                      } ${isLockedLesson ? "opacity-75" : ""}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        {isCompletedLesson ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isLockedLesson ? (
                          <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        ) : (
                          <Play className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-gold-400 fill-gold-400/20" : "text-zinc-500"}`} />
                        )}
                        <span className="truncate">{les.title}</span>
                      </div>
                      {les.is_preview && (
                        <span className="text-[10px] text-gold-400 shrink-0 font-normal">Học thử</span>
                      )}
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
        {/* Floating Quick Navigation Bar on Mobile */}
        <div className="lg:hidden p-3 bg-zinc-900/80 backdrop-blur border-b border-zinc-800 flex items-center justify-between sticky top-0 z-30">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSidebarOpen(true)} 
            className="text-xs font-bold gap-1.5 text-gold-400 border-gold-500/30 hover:bg-gold-500/10 hover:text-gold-300"
          >
            <Menu className="w-3.5 h-3.5" /> Danh sách bài học
          </Button>
          <div className="text-[10px] text-zinc-400 font-semibold max-w-[180px] truncate">
            Đang học: {currentLesson.title}
          </div>
        </div>
        {/* Secure Video Player */}
        <div className="bg-zinc-950 p-4 lg:p-6 flex flex-col items-center">
          <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative">
            {isLessonChanging && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 gap-3 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
                <span className="text-xs text-zinc-400 font-semibold">Đang chuẩn bị bài giảng bảo mật...</span>
              </div>
            )}
            
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
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {currentLesson.is_preview && (
                  <Badge variant="gold" className="text-[10px] py-0.5 px-2">BÀI HỌC THỬ MIỄN PHÍ</Badge>
                )}
                {!isEnrolled && !currentLesson.is_preview && (
                  <Badge variant="secondary" className="text-[10px] py-0.5 px-2 text-zinc-400">NỘI DUNG NÂNG CAO</Badge>
                )}
              </div>
              <h1 className="text-lg md:text-xl font-extrabold text-white">
                {currentLesson.title}
              </h1>
              <p className="text-xs text-zinc-400">
                Lộ trình khóa học: {course.title}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!isEnrolled && (
                <Button variant="gold" size="sm" asChild className="font-bold text-xs">
                  <Link href={`/checkout/${courseSlug}`}>
                    Đăng Ký Khóa Học Trọn Gói
                  </Link>
                </Button>
              )}
              {isEnrolled && (
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
              )}
            </div>
          </div>
        </div>

        {/* Tab Details */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 max-w-5xl mx-auto w-full">
          <Tabs defaultValue="content" className="w-full space-y-6">
            <TabsList className="bg-zinc-900 border border-zinc-800 p-1 w-full flex overflow-x-auto justify-start lg:justify-center scrollbar-none whitespace-nowrap min-w-0">
              <TabsTrigger value="content" className="text-xs px-4 shrink-0">Nội Dung</TabsTrigger>
              <TabsTrigger value="checklist" className="text-xs px-4 shrink-0">
                Checklist ({currentLesson.checklist?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs px-4 shrink-0">
                Tài Liệu ({currentLesson.resources?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs px-4 shrink-0">Ghi Chú</TabsTrigger>
              <TabsTrigger value="mentor" className="text-xs px-4 shrink-0 text-gold-400">AI Mentor</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="text-zinc-300 bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 shadow-xl space-y-6">
                {/* Lesson Header Banner */}
                <div className="border-b border-zinc-800/80 pb-4">
                  <span className="text-[10px] font-mono uppercase text-[#2997ff] tracking-widest font-bold">
                    Nội Dung & Tài Liệu Bài Giảng
                  </span>
                  <h2 className="text-lg md:text-xl font-bold text-white mt-1">
                    {currentLesson.title}
                  </h2>
                  {currentLesson.description && (
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {currentLesson.description}
                    </p>
                  )}
                </div>

                {/* Content Stream (Text + Interactive Visual Images) */}
                {currentLesson.content ? (
                  <div className="space-y-6 pt-1">
                    {currentLesson.content.split("\n\n").map((block: string, idx: number) => {
                      const imgMatch = block.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
                      if (imgMatch) {
                        const alt = imgMatch[1] || "Hình ảnh minh họa bài học";
                        const url = imgMatch[2];

                        return (
                          <div
                            key={idx}
                            className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-lg hover:border-zinc-700 transition-all my-5"
                          >
                            {/* Image Header with quick Zoom Button */}
                            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <ImageIcon className="w-3.5 h-3.5 text-[#2997ff] shrink-0" />
                                <span className="font-semibold text-zinc-200 truncate">{alt}</span>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => openLightbox(url, alt)}
                                className="h-7 text-xs text-[#2997ff] hover:bg-[#0071e3]/20 hover:text-white gap-1"
                              >
                                <ZoomIn className="w-3.5 h-3.5" /> Phóng to chi tiết
                              </Button>
                            </div>

                            {/* Clickable Image Body */}
                            <div
                              onClick={() => openLightbox(url, alt)}
                              className="p-3 sm:p-4 flex flex-col items-center justify-center cursor-zoom-in relative bg-black/40 group/img"
                            >
                              <img
                                src={url}
                                alt={alt}
                                className="max-h-[550px] w-auto max-w-full rounded-xl object-contain shadow-md transition-transform duration-200 group-hover/img:scale-[1.01]"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 flex items-center justify-center transition-colors pointer-events-none">
                                <span className="opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/85 backdrop-blur text-white text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 shadow-xl">
                                  <ZoomIn className="w-3.5 h-3.5 text-[#2997ff]" /> Nhấp để phóng to / kéo xem chi tiết
                                </span>
                              </div>
                            </div>

                            {alt && (
                              <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-950/60 text-center">
                                <p className="text-xs text-zinc-400 italic">
                                  {alt}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (block.startsWith("### ")) {
                        return (
                          <h4 key={idx} className="text-sm font-bold text-white pt-2 border-l-2 border-[#0071e3] pl-3">
                            {block.replace("### ", "")}
                          </h4>
                        );
                      }
                      if (block.startsWith("## ")) {
                        return (
                          <h3 key={idx} className="text-base font-bold text-white pt-3 border-l-2 border-white pl-3">
                            {block.replace("## ", "")}
                          </h3>
                        );
                      }

                      return (
                        <p key={idx} className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                          {block}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 italic py-6 text-center">
                    Nội dung lý thuyết chưa được cung cấp cho bài học này.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="checklist">
              <LessonChecklist 
                initialItems={currentLesson.checklist || []}
                lessonId={currentLesson.id}
              />
            </TabsContent>

            <TabsContent value="resources">
              <LessonResources 
                resources={currentLesson.resources || []}
              />
            </TabsContent>

            <TabsContent value="notes">
              <LessonNotes 
                userId={userId}
                userEmail={userEmail}
                lessonId={currentLesson.id}
                lessonTitle={currentLesson.title}
              />
            </TabsContent>

            <TabsContent value="mentor">
              <AIMentorPlaceholder />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Lightbox Modal for zooming and panning images */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={lightboxImage.url}
        title={lightboxImage.title}
      />
    </div>
  );
}
