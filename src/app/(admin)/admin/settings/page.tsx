"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, ShieldCheck, Globe, CreditCard, Mail, Bell, Webhook } from "lucide-react";
import { MockBanner } from "@/components/admin/MockBanner";
import { SaveIndicator, SaveState } from "@/components/admin/SaveIndicator";

export default function AdminSettingsPage() {
  const [saveState, setSaveState] = useState<SaveState>("saved");

  // Mock settings state
  const [siteName, setSiteName] = useState("KIENPRO LMS");
  const [siteUrl, setSiteUrl] = useState("https://lms.kienpro.com");
  const [adminEmail, setAdminEmail] = useState("admin@kienpro.com");
  const [enableEmailNotif, setEnableEmailNotif] = useState(true);
  const [enableWebhookLog, setEnableWebhookLog] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    setSaveState("saving");
    setTimeout(() => setSaveState("saved"), 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cấu Hình Hệ Thống Admin"
        description="Quản lý các thông số chung của nền tảng KIENPRO LMS."
      >
        <SaveIndicator state={saveState} />
      </PageHeader>

      <MockBanner message="[MOCK UI] Trang Cài đặt hệ thống. Thay đổi không lưu vào DB thật." />

      {/* General Section */}
      <div className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-2 text-white font-bold text-base border-b border-zinc-800 pb-4">
          <Globe className="w-5 h-5 text-gold-400" /> Thông Tin Nền Tảng
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Tên Website</label>
            <Input
              value={siteName}
              onChange={(e) => { setSiteName(e.target.value); setSaveState("unsaved"); }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">URL Chính</label>
            <Input
              value={siteUrl}
              onChange={(e) => { setSiteUrl(e.target.value); setSaveState("unsaved"); }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Email Admin Chính</label>
            <Input
              value={adminEmail}
              onChange={(e) => { setAdminEmail(e.target.value); setSaveState("unsaved"); }}
            />
          </div>
        </div>
      </div>

      {/* Notification Section */}
      <div className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-2 text-white font-bold text-base border-b border-zinc-800 pb-4">
          <Bell className="w-5 h-5 text-gold-400" /> Thông Báo & Webhook
        </div>

        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-950 border border-zinc-800">
            <div>
              <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gold-400" /> Email Thông Báo Đơn Hàng
              </h5>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Gửi email tới Admin khi có đơn thanh toán VietQR thành công.
              </p>
            </div>
            <Switch
              checked={enableEmailNotif}
              onCheckedChange={(val) => { setEnableEmailNotif(val); setSaveState("unsaved"); }}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-950 border border-zinc-800">
            <div>
              <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Webhook className="w-3.5 h-3.5 text-gold-400" /> Ghi Log Webhook Chi Tiết
              </h5>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Lưu toàn bộ payload webhook SePay/PayOS vào bảng webhook_events.
              </p>
            </div>
            <Switch
              checked={enableWebhookLog}
              onCheckedChange={(val) => { setEnableWebhookLog(val); setSaveState("unsaved"); }}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-red-950/30 border border-red-800/50">
            <div>
              <h5 className="text-xs font-semibold text-red-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" /> Chế Độ Bảo Trì (Maintenance)
              </h5>
              <p className="text-[11px] text-red-400/70 mt-0.5">
                Khi bật, tất cả học viên sẽ thấy trang thông báo bảo trì.
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={(val) => { setMaintenanceMode(val); setSaveState("unsaved"); }}
            />
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-2 text-white font-bold text-base border-b border-zinc-800 pb-4">
          <CreditCard className="w-5 h-5 text-gold-400" /> Cổng Thanh Toán & API Keys
        </div>

        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            KIENPRO LMS sử dụng biến môi trường (<code>.env.local</code>) để quản lý API Keys.
            Không bao giờ ghi secret thật vào source code. Cấu hình trên hosting server (Vercel, Railway).
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">SePay Webhook Secret</label>
            <Input value="••••••••••••••••" disabled />
            <p className="text-[10px] text-zinc-500">Env: SEPAY_WEBHOOK_SECRET</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Bunny Stream API Key</label>
            <Input value="••••••••••••••••" disabled />
            <p className="text-[10px] text-zinc-500">Env: BUNNY_STREAM_API_KEY</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Resend API Key</label>
            <Input value="••••••••••••••••" disabled />
            <p className="text-[10px] text-zinc-500">Env: RESEND_API_KEY</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Supabase Service Role Key</label>
            <Input value="••••••••••••••••" disabled />
            <p className="text-[10px] text-zinc-500">Env: SUPABASE_SERVICE_ROLE_KEY</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="gold" onClick={handleSave} className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Cấu Hình Hệ Thống
        </Button>
      </div>
    </div>
  );
}
