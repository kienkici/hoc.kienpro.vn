import { UserProfile, Order } from "@/types";

export interface MockLessonResource {
  id: string;
  title: string;
  fileUrl: string;
  fileType: "pdf" | "zip" | "doc" | "link";
  fileSize: string;
}

export interface MockLesson {
  id: string;
  title: string;
  slug: string;
  durationSeconds: number;
  isFreePreview: boolean;
  videoUrlPlaceholder: string;
  contentMarkdown: string;
  transcript: string;
  resources: MockLessonResource[];
  practicalChecklist: { id: string; text: string; completed: boolean }[];
}

export interface MockModule {
  id: string;
  title: string;
  sortOrder: number;
  lessons: MockLesson[];
}

export interface MockCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  salePrice: number;
  studentCount: number;
  rating: number;
  reviewCount: number;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  modules: MockModule[];
  highlights: string[];
}

export interface MockEnrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lastStudiedAt: string;
  lastLessonSlug: string;
}

export interface MockLessonNote {
  id: string;
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  timestampSeconds: number;
  content: string;
  createdAt: string;
}

export interface MockDashboardStats {
  totalCoursesOwned: number;
  completedCourses: number;
  totalHoursLearned: number;
  activeCertificates: number;
  adminTotalRevenue: number;
  adminTotalStudents: number;
  adminTotalOrders: number;
  adminPendingOrders: number;
}

// =============================================================================
// MOCK DATA EXPORTS
// =============================================================================

export const MOCK_CURRENT_USER: UserProfile = {
  id: "usr-student-001",
  email: "hocvien.kienpro@gmail.com",
  fullName: "Trần Văn Nam",
  phone: "0987.654.321",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "student",
  isActivated: true,
  createdAt: "2026-07-15T08:30:00Z",
};

export const MOCK_ADMIN_USER: UserProfile = {
  id: "usr-admin-001",
  email: "admin@kienpro.com",
  fullName: "Kiên Pro Admin",
  phone: "0909.999.888",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  role: "super_admin",
  isActivated: true,
  createdAt: "2026-01-01T00:00:00Z",
};

export const MOCK_COURSES: MockCourse[] = [
  {
    id: "crs-ai-website",
    slug: "thiet-ke-website-ai",
    title: "Khóa Học Thiết Kế Website AI & Tự Động Hóa Bán Hàng 2026",
    subtitle: "Xây dựng website bán hàng cao cấp, tích hợp Chatbot AI và quy trình tự động hóa chuyển đổi 10x",
    description: "Khóa học thực chiến giúp bạn tự tay thiết kế Landing Page & Website LMS chuyên nghiệp chuẩn thương hiệu cao cấp mà không cần biết viết code phức tạp.",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    price: 3500000,
    salePrice: 1490000,
    studentCount: 1280,
    rating: 4.9,
    reviewCount: 342,
    instructorName: "Kiên Pro",
    instructorTitle: "Senior Architect & Founder Kiên Pro Brand",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    highlights: [
      "Tự tay làm Website LMS & Landing Page cao cấp chỉ trong 3 ngày",
      "Tự động hóa thanh toán VietQR 0% phí giao dịch",
      "Bảo mật HLS mã hóa video chống tải xuống",
      "Bộ Template thiết kế Gold Premium làm sẵn",
      "Hỗ trợ hỏi đáp 1:1 qua nhóm Zalo VIP"
    ],
    modules: [
      {
        id: "mod-1",
        title: "Chương 1: Tổng quan Kiến trúc & Tư duy Thiết kế Premium Gold/Dark",
        sortOrder: 1,
        lessons: [
          {
            id: "les-101",
            title: "Bài 1: Giới thiệu hệ thống KIENPRO LMS & Tư duy giao diện cao cấp",
            slug: "gioi-thieu-kienpro-lms",
            durationSeconds: 750, // 12:30
            isFreePreview: true,
            videoUrlPlaceholder: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            contentMarkdown: "### Nội dung bài giảng\nTrong bài học này, bạn sẽ nắm rõ tư duy phối màu Đen - Trắng - Gold cổ điển mang lại vẻ sang trọng cho nền tảng đào tạo.",
            transcript: "Chào mừng các bạn đến với khóa học Thiết kế Website AI của thương hiệu Kiên Pro...",
            resources: [
              { id: "res-1", title: "Slide bài giảng Chương 1.pdf", fileUrl: "#", fileType: "pdf", fileSize: "3.2 MB" },
              { id: "res-2", title: "Bộ UI Tokens Gold Premium.zip", fileUrl: "#", fileType: "zip", fileSize: "12.5 MB" }
            ],
            practicalChecklist: [
              { id: "chk-1", text: "Xem hết video bài giảng 12 phút", completed: true },
              { id: "chk-2", text: "Tải xuống Slide bài giảng PDF", completed: true },
              { id: "chk-3", text: "Ghi chép 3 ý tưởng phối màu cho website cá nhân", completed: false }
            ]
          },
          {
            id: "les-102",
            title: "Bài 2: Cài đặt công cụ & Chuẩn bị môi trường Next.js",
            slug: "cai-dat-cong-cu-nextjs",
            durationSeconds: 1140, // 19:00
            isFreePreview: false,
            videoUrlPlaceholder: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            contentMarkdown: "Hướng dẫn cài đặt Node.js, VS Code, Tailwind CSS và shadcn/ui.",
            transcript: "Trong bài học này chúng ta sẽ khởi tạo project Next.js với App Router...",
            resources: [
              { id: "res-3", title: "Checklist setup công cụ.pdf", fileUrl: "#", fileType: "pdf", fileSize: "1.1 MB" }
            ],
            practicalChecklist: [
              { id: "chk-4", text: "Khởi tạo thành công project Next.js ở máy local", completed: false }
            ]
          }
        ]
      },
      {
        id: "mod-2",
        title: "Chương 2: Tự động hóa Thanh toán QR & Cấp Khóa Học 10 Giây",
        sortOrder: 2,
        lessons: [
          {
            id: "les-201",
            title: "Bài 3: Cấu hình SePay Webhook & Quy trình Anti-Replay Idempotency",
            slug: "cau-hinh-sepay-webhook",
            durationSeconds: 1420,
            isFreePreview: false,
            videoUrlPlaceholder: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            contentMarkdown: "Chi tiết các bước cài đặt webhook SePay nhận chuyển khoản VietQR tự động.",
            transcript: "Webhook là trái tim của hệ thống cấp khóa học tự động 100%...",
            resources: [],
            practicalChecklist: []
          }
        ]
      }
    ]
  },
  {
    id: "crs-ai-marketing",
    slug: "ai-marketing-tu-dong-hoa",
    title: "Masterclass AI Marketing & Tự Động Hóa Nội Dung Bán Hàng",
    subtitle: "Ứng dụng ChatGPT, Claude và Midjourney xây dựng ma trận nội dung kéo 100.000 khách hàng tiềm năng",
    description: "Khóa học toàn diện về ứng dụng Trí tuệ nhân tạo (AI) vào viết bài bán hàng, tạo hình ảnh quảng cáo và kịch bản video ngắn.",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    price: 2800000,
    salePrice: 990000,
    studentCount: 890,
    rating: 4.8,
    reviewCount: 215,
    instructorName: "Kiên Pro",
    instructorTitle: "Senior Architect & Founder Kiên Pro Brand",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    highlights: [
      "Bộ Prompt viết bài bán hàng chuẩn tâm lý học mua hàng",
      "Tạo hình ảnh quảng cáo 8K với Midjourney",
      "Kịch bản Video ngắn TikTok / Reels triệu view"
    ],
    modules: []
  }
];

export const MOCK_ENROLLMENTS: MockEnrollment[] = [
  {
    id: "enr-001",
    courseId: "crs-ai-website",
    courseTitle: "Khóa Học Thiết Kế Website AI & Tự Động Hóa Bán Hàng 2026",
    courseSlug: "thiet-ke-website-ai",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    progressPercent: 35,
    completedLessons: 1,
    totalLessons: 3,
    lastStudiedAt: "2026-08-02 21:15",
    lastLessonSlug: "gioi-thieu-kienpro-lms",
  },
  {
    id: "enr-002",
    courseId: "crs-ai-marketing",
    courseTitle: "Masterclass AI Marketing & Tự Động Hóa Nội Dung Bán Hàng",
    courseSlug: "ai-marketing-tu-dong-hoa",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    progressPercent: 80,
    completedLessons: 4,
    totalLessons: 5,
    lastStudiedAt: "2026-08-01 15:30",
    lastLessonSlug: "prompt-viet-bai-ban-hang",
  }
];

export const MOCK_NOTES: MockLessonNote[] = [
  {
    id: "note-1",
    lessonId: "les-101",
    lessonTitle: "Bài 1: Giới thiệu hệ thống KIENPRO LMS & Tư duy giao diện cao cấp",
    courseTitle: "Khóa Học Thiết Kế Website AI",
    timestampSeconds: 145,
    content: "Cần chú ý tông màu Gold Primary #D4AF37 làm màu nhấn nút CTA chính.",
    createdAt: "2026-08-02 21:20",
  },
  {
    id: "note-2",
    lessonId: "les-101",
    lessonTitle: "Bài 1: Giới thiệu hệ thống KIENPRO LMS & Tư duy giao diện cao cấp",
    courseTitle: "Khóa Học Thiết Kế Website AI",
    timestampSeconds: 420,
    content: "Anti-replay idempotency dùng bảng webhook_events unique(provider, transaction_id).",
    createdAt: "2026-08-02 21:25",
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-98241",
    orderCode: "KP98241",
    userId: "usr-student-001",
    customerName: "Trần Văn Nam",
    customerEmail: "hocvien.kienpro@gmail.com",
    customerPhone: "0987.654.321",
    totalAmount: 1490000,
    status: "PAID",
    createdAt: "2026-08-02 20:45",
  },
  {
    id: "ord-98242",
    orderCode: "KP98242",
    userId: undefined,
    customerName: "Lê Thị Thu",
    customerEmail: "thuthu@gmail.com",
    customerPhone: "0912.345.678",
    totalAmount: 990000,
    status: "PENDING",
    createdAt: "2026-08-02 22:10",
  },
  {
    id: "ord-98243",
    orderCode: "KP98243",
    userId: undefined,
    customerName: "Phạm Hoàng Long",
    customerEmail: "hoanglong@outlook.com",
    customerPhone: "0933.111.222",
    totalAmount: 1490000,
    status: "CANCELLED",
    createdAt: "2026-08-01 14:00",
  }
];

export const MOCK_DASHBOARD_STATS: MockDashboardStats = {
  totalCoursesOwned: 2,
  completedCourses: 0,
  totalHoursLearned: 4.5,
  activeCertificates: 0,
  adminTotalRevenue: 148500000,
  adminTotalStudents: 1280,
  adminTotalOrders: 342,
  adminPendingOrders: 5,
};
