"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, ExternalLink, Sparkles, Video, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Session {
  time: string;
  date: string;
  label?: string;
}

interface ScheduleItem {
  title: string;
  type: string;
  detailUrl: string;
  location: string;
  sessions: Session[];
}

const SCHEDULE_DATA = {
  august: [
    {
      title: "Webinar - Bí mật Fb Ads (2 Buổi - Miễn Phí)",
      type: "Miễn Phí",
      detailUrl: "https://kienpro.vn/webinar-fbads/",
      location: "Học online qua zoom",
      sessions: [
        { time: "20:00 - 22:00", date: "Ngày 11, 12/08/2026" },
        { time: "20:00 - 22:00", date: "Ngày 25, 26/08/2026" }
      ]
    },
    {
      title: "Khóa Học Facebook Ads Cơ Bản Đến Chuyên Sâu (4 Buổi)",
      type: "Chuyên Sâu",
      detailUrl: "https://kienpro.vn/facebookads-coban/",
      location: "Học online qua zoom",
      sessions: [
        { label: "K5", time: "20:00 - 22:00", date: "Thứ 5, 6. Ngày 20, 21/08/2026" },
        { label: "K5", time: "20:00 - 22:00", date: "Thứ 5, 6. Ngày 27, 28/08/2026" },
        { label: "K6", time: "09:00 - 17:00", date: "Thứ 7, CN. Ngày 29, 30/08/2026" }
      ]
    }
  ] as ScheduleItem[],
  september: [
    {
      title: "Webinar - Bí mật Fb Ads (2 Buổi - Miễn Phí)",
      type: "Miễn Phí",
      detailUrl: "https://kienpro.vn/webinar-fbads/",
      location: "Học online qua zoom",
      sessions: [
        { time: "20:00 - 22:00", date: "Ngày 6, 7/09/2026" },
        { time: "20:00 - 22:00", date: "Ngày 20, 21/09/2026" }
      ]
    },
    {
      title: "Khóa Học Facebook Ads Cơ Bản Đến Chuyên Sâu (4 Buổi)",
      type: "Chuyên Sâu",
      detailUrl: "https://kienpro.vn/facebookads-coban/",
      location: "Học online qua zoom",
      sessions: [
        { label: "K7", time: "20:00 - 22:00", date: "Thứ 1, 6. Ngày 15, 16/09/2026" },
        { label: "K7", time: "20:00 - 22:00", date: "Thứ 5, 6. Ngày 22, 23/09/2026" },
        { label: "K8", time: "09:00 - 17:00", date: "Thứ 7, CN. Ngày 17, 18/09/2026" }
      ]
    },
    {
      title: "Khóa Học Master Marketing & Ads Từ A-Z (6 Buổi)",
      type: "Cao Cấp",
      detailUrl: "https://kienpro.vn/master-mkt/",
      location: "Học online qua zoom",
      sessions: [
        { time: "20:00 - 22:00", date: "Thứ 3, 5. Ngày 27, 29/09/2026" },
        { time: "09:00 - 17:00", date: "Thứ 7, CN. Ngày 31/09 & 01/10/2026" }
      ]
    }
  ] as ScheduleItem[]
};

export function TrainingScheduleClient() {
  const [activeTab, setActiveTab] = useState<"august" | "september">("august");

  const currentSchedule = activeTab === "august" ? SCHEDULE_DATA.august : SCHEDULE_DATA.september;

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-zinc-950 via-zinc-900/20 to-zinc-950 text-white">
      <div className="container max-w-6xl mx-auto px-4 space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <Badge variant="gold" className="px-4 py-1 text-xs tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline-block text-zinc-950 animate-pulse" />
            Chương Trình Huấn Luyện Chuyên Sâu
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Lịch Đào Tạo <span className="text-gold-gradient">Kiên Pro</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto">
            Lịch đào tạo chi tiết các chương trình huấn luyện thực chiến qua Zoom, giúp bạn làm chủ Facebook Ads và chiến lược Marketing số.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="flex p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl max-w-md w-full">
            <button
              id="btn-schedule-aug"
              onClick={() => setActiveTab("august")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === "august"
                  ? "bg-gold-gradient text-zinc-950 shadow-md animate-none"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Lịch Học Tháng 08/2026
            </button>
            <button
              id="btn-schedule-sept"
              onClick={() => setActiveTab("september")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === "september"
                  ? "bg-gold-gradient text-zinc-950 shadow-md animate-none"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Lịch Học Tháng 09/2026
            </button>
          </div>
        </div>

        {/* Schedule List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {currentSchedule.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md p-6 hover:border-gold-500/40 hover:shadow-lg hover:shadow-gold-500/5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Gold Top Border Glow */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/30 to-transparent group-hover:via-gold-500 transition-all duration-500" />
              
              <div className="space-y-6">
                {/* Card Title & Type */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={item.type === "Miễn Phí" ? "success" : "default"} className="text-[10px] uppercase font-bold tracking-wider">
                      {item.type}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      {item.location}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-gold-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </div>

                {/* Session Timeline */}
                <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Lịch phát sóng qua Zoom:</span>
                  <div className="space-y-3">
                    {item.sessions.map((session, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            {session.label && (
                              <Badge variant="outline" className="text-[10px] text-gold-400 border-gold-500/30 px-1.5 py-0 h-4 shrink-0 font-extrabold flex items-center justify-center bg-gold-500/5">
                                {session.label}
                              </Badge>
                            )}
                            <span className="font-medium text-zinc-200 block">{session.date}</span>
                          </div>
                          <span className="text-xs text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gold-500/60" /> {session.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-zinc-800/80">
                <Button variant="gold" asChild className="w-full text-xs font-bold gap-2">
                  <a href={item.detailUrl} target="_blank" rel="noopener noreferrer">
                    Xem Chi Tiết Khóa Học <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Guarantee Section */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-6 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Hỗ trợ học viên 24/7</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Mọi thắc mắc về lịch học Zoom, vui lòng liên hệ Ban quản trị.</p>
            </div>
          </div>
          <Button variant="outline" asChild className="text-xs text-zinc-300 border-zinc-800 hover:text-white shrink-0">
            <a href="https://zalo.me/0961831111" target="_blank" rel="noopener noreferrer">
              Liên hệ
            </a>
          </Button>
        </div>

      </div>
    </div>
  );
}
