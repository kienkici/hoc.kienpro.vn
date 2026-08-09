import { Metadata } from "next";
import { TrainingScheduleClient } from "./TrainingScheduleClient";

export const metadata: Metadata = {
  title: "Lịch Đào Tạo & Huấn Luyện Chuyên Sâu - KIENPRO LMS",
  description: "Lịch đào tạo và huấn luyện chuyên sâu Facebook Ads, Marketing trực tuyến qua Zoom tháng 8 và tháng 9 năm 2026 từ thương hiệu Kiên Pro.",
};

export default function TrainingSchedulePage() {
  return <TrainingScheduleClient />;
}
