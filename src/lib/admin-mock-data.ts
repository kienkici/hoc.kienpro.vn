// =============================================================================
// KIENPRO LMS - Admin Mock Data & Helpers
// [MOCK] Tất cả dữ liệu trong file này là giả lập UI. Chưa kết nối DB.
// =============================================================================

import type {
  Course, Module, Lesson, VideoAsset, LessonResource, TranscriptSegment,
  ChecklistItem, Quiz, QuizQuestion, QuizOption, Assignment, AccessRule,
  MediaAsset, CourseStatus,
} from '@/types/admin';

// --- Helpers ---

let _idCounter = 1000;
export function generateId(prefix = 'id'): string {
  _idCounter += 1;
  return `${prefix}-${_idCounter}-${Date.now().toString(36)}`;
}

export function createDefaultAccessRule(): AccessRule {
  return { type: 'immediate', value: '' };
}

export function createDefaultModule(courseId: string, orderIndex: number): Module {
  const id = generateId('mod');
  return {
    id,
    courseId,
    title: `Chương mới ${orderIndex + 1}`,
    description: '',
    orderIndex,
    isPublished: false,
    lessons: [],
    createdAt: new Date().toISOString(),
  };
}

export function createDefaultLesson(moduleId: string, orderIndex: number): Lesson {
  const id = generateId('les');
  return {
    id,
    moduleId,
    title: `Bài học mới ${orderIndex + 1}`,
    slug: `bai-hoc-moi-${orderIndex + 1}`,
    description: '',
    thumbnailUrl: '',
    lessonType: 'video',
    contentMarkdown: '',
    durationSeconds: 0,
    orderIndex,
    status: 'draft',
    isFreePreview: false,
    isRequired: true,
    video: null,
    resources: [],
    transcriptSegments: [],
    checklist: [],
    quiz: null,
    assignment: null,
    accessRule: createDefaultAccessRule(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createDefaultQuiz(lessonId: string): Quiz {
  return {
    id: generateId('quiz'),
    lessonId,
    title: 'Bài kiểm tra',
    description: '',
    passingScore: 70,
    maxAttempts: 3,
    shuffleQuestions: false,
    shuffleOptions: false,
    requirePassToUnlockNext: false,
    timeLimitMinutes: 0,
    questions: [],
  };
}

export function createDefaultQuestion(quizId: string, orderIndex: number): QuizQuestion {
  return {
    id: generateId('q'),
    quizId,
    type: 'single_choice',
    text: '',
    explanation: '',
    points: 10,
    orderIndex,
    options: [
      { id: generateId('opt'), questionId: '', text: 'Đáp án A', isCorrect: true, orderIndex: 0 },
      { id: generateId('opt'), questionId: '', text: 'Đáp án B', isCorrect: false, orderIndex: 1 },
    ],
  };
}

export function createDefaultAssignment(lessonId: string): Assignment {
  return {
    id: generateId('assign'),
    lessonId,
    title: 'Bài tập thực hành',
    description: '',
    dueDays: 7,
    maxScore: 100,
    allowedResponseTypes: ['text', 'file'],
    allowResubmit: true,
    rubric: '',
  };
}

// --- Mock Video Assets ---

const MOCK_VIDEO_READY: VideoAsset = {
  id: 'vid-001',
  provider: 'bunny',
  externalId: 'abc123-bunny-stream',
  title: 'Bài 1 - Giới thiệu KIENPRO LMS',
  durationSeconds: 750,
  status: 'ready',
  thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
  uploadProgress: 100,
  fileSize: 125_000_000,
  resolution: '1920x1080',
  createdAt: '2026-07-20T10:00:00Z',
};

// --- Mock Transcript Segments ---

const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  { id: 'ts-1', startTime: 0, endTime: 8, content: 'Xin chào các bạn, chào mừng đến với khóa học Thiết kế Website AI của thương hiệu Kiên Pro.', orderIndex: 0 },
  { id: 'ts-2', startTime: 8, endTime: 18, content: 'Trong bài học đầu tiên này, chúng ta sẽ tìm hiểu tổng quan về hệ thống KIENPRO LMS.', orderIndex: 1 },
  { id: 'ts-3', startTime: 18, endTime: 30, content: 'Giao diện được thiết kế với tông màu Gold Premium kết hợp Dark Mode tối giản nhưng sang trọng.', orderIndex: 2 },
];

// --- Mock Checklist ---

const MOCK_CHECKLIST: ChecklistItem[] = [
  { id: 'cl-1', text: 'Xem hết video bài giảng', description: 'Hoàn thành xem toàn bộ 12 phút video', isRequired: true, orderIndex: 0 },
  { id: 'cl-2', text: 'Tải Slide PDF', description: '', isRequired: false, orderIndex: 1 },
  { id: 'cl-3', text: 'Ghi chép 3 ý tưởng phối màu', description: 'Áp dụng Gold/Dark cho website cá nhân', isRequired: true, orderIndex: 2 },
];

// --- Mock Resources ---

const MOCK_RESOURCES: LessonResource[] = [
  {
    id: 'res-admin-1', lessonId: 'les-admin-101', title: 'Slide bài giảng Chương 1', description: 'Tài liệu PowerPoint bài giảng',
    resourceType: 'pdf', storagePath: '/resources/slide-ch1.pdf', externalUrl: '', fileName: 'slide-ch1.pdf',
    mimeType: 'application/pdf', fileSize: 3_200_000, allowDownload: true, orderIndex: 0, status: 'ready', createdAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'res-admin-2', lessonId: 'les-admin-101', title: 'Bộ UI Tokens Gold Premium', description: 'File ZIP chứa color tokens và font files',
    resourceType: 'zip', storagePath: '/resources/ui-tokens.zip', externalUrl: '', fileName: 'ui-tokens-gold.zip',
    mimeType: 'application/zip', fileSize: 12_500_000, allowDownload: true, orderIndex: 1, status: 'ready', createdAt: '2026-07-20T10:00:00Z',
  },
];

// --- Mock Quiz ---

const MOCK_QUIZ: Quiz = {
  id: 'quiz-001',
  lessonId: 'les-admin-101',
  title: 'Kiểm tra kiến thức Chương 1',
  description: 'Bài kiểm tra ngắn về tư duy giao diện Premium',
  passingScore: 70,
  maxAttempts: 3,
  shuffleQuestions: true,
  shuffleOptions: false,
  requirePassToUnlockNext: false,
  timeLimitMinutes: 10,
  questions: [
    {
      id: 'q-1', quizId: 'quiz-001', type: 'single_choice', text: 'Mã màu Gold Primary của KIENPRO LMS là gì?',
      explanation: 'Gold Primary là #D4AF37 — màu vàng cổ điển tượng trưng cho sự sang trọng.', points: 10, orderIndex: 0,
      options: [
        { id: 'opt-1', questionId: 'q-1', text: '#D4AF37', isCorrect: true, orderIndex: 0 },
        { id: 'opt-2', questionId: 'q-1', text: '#FFD700', isCorrect: false, orderIndex: 1 },
        { id: 'opt-3', questionId: 'q-1', text: '#FFC107', isCorrect: false, orderIndex: 2 },
      ],
    },
    {
      id: 'q-2', quizId: 'quiz-001', type: 'true_false', text: 'KIENPRO LMS sử dụng Light Mode làm giao diện mặc định.',
      explanation: 'Sai. KIENPRO LMS dùng Dark Mode (#09090B) làm mặc định.', points: 10, orderIndex: 1,
      options: [
        { id: 'opt-4', questionId: 'q-2', text: 'Đúng', isCorrect: false, orderIndex: 0 },
        { id: 'opt-5', questionId: 'q-2', text: 'Sai', isCorrect: true, orderIndex: 1 },
      ],
    },
    {
      id: 'q-3', quizId: 'quiz-001', type: 'multiple_choice', text: 'Chọn các thành phần có trong Tech Stack của KIENPRO LMS:',
      explanation: 'Next.js, Tailwind CSS và Supabase đều nằm trong stack. Angular không có.', points: 15, orderIndex: 2,
      options: [
        { id: 'opt-6', questionId: 'q-3', text: 'Next.js App Router', isCorrect: true, orderIndex: 0 },
        { id: 'opt-7', questionId: 'q-3', text: 'Tailwind CSS', isCorrect: true, orderIndex: 1 },
        { id: 'opt-8', questionId: 'q-3', text: 'Angular', isCorrect: false, orderIndex: 2 },
        { id: 'opt-9', questionId: 'q-3', text: 'Supabase', isCorrect: true, orderIndex: 3 },
      ],
    },
  ],
};

// --- Full Mock Lessons ---

const MOCK_LESSON_1: Lesson = {
  id: 'les-admin-101',
  moduleId: 'mod-admin-1',
  title: 'Bài 1: Giới thiệu KIENPRO LMS & Tư duy giao diện cao cấp',
  slug: 'gioi-thieu-kienpro-lms',
  description: 'Tổng quan về hệ thống LMS cao cấp, phối màu Gold/Dark Premium.',
  thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
  lessonType: 'video',
  contentMarkdown: '### Nội dung bài giảng\nTrong bài học này, bạn sẽ nắm rõ tư duy phối màu Đen - Trắng - Gold cổ điển.\n\n**Ý chính:**\n- Tông màu chủ đạo: `#09090B` (nền), `#D4AF37` (Gold accent)\n- Font chữ: Inter / Outfit\n- Tối giản cao cấp, không lạm dụng hiệu ứng',
  durationSeconds: 750,
  orderIndex: 0,
  status: 'published',
  isFreePreview: true,
  isRequired: true,
  video: MOCK_VIDEO_READY,
  resources: MOCK_RESOURCES,
  transcriptSegments: MOCK_TRANSCRIPT,
  checklist: MOCK_CHECKLIST,
  quiz: MOCK_QUIZ,
  assignment: null,
  accessRule: { type: 'immediate', value: '' },
  createdAt: '2026-07-20T10:00:00Z',
  updatedAt: '2026-08-01T15:30:00Z',
};

const MOCK_LESSON_2: Lesson = {
  id: 'les-admin-102',
  moduleId: 'mod-admin-1',
  title: 'Bài 2: Cài đặt công cụ & Chuẩn bị môi trường Next.js',
  slug: 'cai-dat-cong-cu-nextjs',
  description: 'Hướng dẫn cài đặt Node.js, VS Code, Tailwind CSS và shadcn/ui.',
  thumbnailUrl: '',
  lessonType: 'video',
  contentMarkdown: 'Hướng dẫn cài đặt Node.js 20+, VS Code Extensions, Tailwind CSS và shadcn/ui component library.',
  durationSeconds: 1140,
  orderIndex: 1,
  status: 'draft',
  isFreePreview: false,
  isRequired: true,
  video: null,
  resources: [],
  transcriptSegments: [],
  checklist: [],
  quiz: null,
  assignment: null,
  accessRule: { type: 'complete_previous', value: '' },
  createdAt: '2026-07-21T08:00:00Z',
  updatedAt: '2026-07-21T08:00:00Z',
};

const MOCK_LESSON_3: Lesson = {
  id: 'les-admin-201',
  moduleId: 'mod-admin-2',
  title: 'Bài 3: Cấu hình SePay Webhook & Anti-Replay Idempotency',
  slug: 'cau-hinh-sepay-webhook',
  description: 'Chi tiết cài đặt webhook SePay nhận chuyển khoản VietQR tự động.',
  thumbnailUrl: '',
  lessonType: 'video',
  contentMarkdown: 'Chi tiết các bước cài đặt webhook SePay nhận chuyển khoản VietQR tự động.',
  durationSeconds: 1420,
  orderIndex: 0,
  status: 'draft',
  isFreePreview: false,
  isRequired: true,
  video: null,
  resources: [],
  transcriptSegments: [],
  checklist: [],
  quiz: null,
  assignment: {
    id: 'assign-201', lessonId: 'les-admin-201', title: 'Bài tập: Cấu hình Webhook cá nhân',
    description: 'Đăng ký SePay/PayOS sandbox và cấu hình webhook nhận callback thành công.',
    dueDays: 7, maxScore: 100, allowedResponseTypes: ['text', 'link'], allowResubmit: true, rubric: '',
  },
  accessRule: { type: 'complete_previous', value: '' },
  createdAt: '2026-07-22T09:00:00Z',
  updatedAt: '2026-07-22T09:00:00Z',
};

// --- Full Mock Courses for Admin ---

export const MOCK_ADMIN_COURSES: Course[] = [
  {
    id: 'crs-admin-ai-website',
    slug: 'thiet-ke-website-ai',
    title: 'Khóa Học Thiết Kế Website AI & Tự Động Hóa Bán Hàng 2026',
    subtitle: 'Xây dựng website bán hàng cao cấp, tích hợp Chatbot AI',
    description: 'Khóa học thực chiến giúp bạn tự tay thiết kế Landing Page & Website LMS chuyên nghiệp.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    previewVideoUrl: '',
    category: 'thiet-ke',
    instructorId: 'usr-admin-001',
    instructorName: 'Kiên Pro',
    price: 3500000,
    salePrice: 1490000,
    status: 'published',
    accessDurationDays: null,
    enableCertificate: true,
    completionPercentRequired: 80,
    studentCount: 1280,
    rating: 4.9,
    reviewCount: 342,
    highlights: [
      'Tự tay làm Website LMS & Landing Page cao cấp chỉ trong 3 ngày',
      'Tự động hóa thanh toán VietQR 0% phí giao dịch',
      'Bảo mật HLS mã hóa video chống tải xuống',
      'Bộ Template thiết kế Gold Premium làm sẵn',
      'Hỗ trợ hỏi đáp 1:1 qua nhóm Zalo VIP',
    ],
    modules: [
      {
        id: 'mod-admin-1',
        courseId: 'crs-admin-ai-website',
        title: 'Chương 1: Tổng quan Kiến trúc & Tư duy Thiết kế Premium',
        description: 'Nắm vững nền tảng tư duy thiết kế giao diện Gold/Dark Premium.',
        orderIndex: 0,
        isPublished: true,
        lessons: [MOCK_LESSON_1, MOCK_LESSON_2],
        createdAt: '2026-07-20T10:00:00Z',
      },
      {
        id: 'mod-admin-2',
        courseId: 'crs-admin-ai-website',
        title: 'Chương 2: Tự động hóa Thanh toán QR & Cấp Khóa Học 10 Giây',
        description: 'Xây dựng hệ thống webhook thanh toán tự động 100%.',
        orderIndex: 1,
        isPublished: false,
        lessons: [MOCK_LESSON_3],
        createdAt: '2026-07-22T09:00:00Z',
      },
    ],
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-02T20:00:00Z',
  },
  {
    id: 'crs-admin-ai-marketing',
    slug: 'ai-marketing-tu-dong-hoa',
    title: 'Masterclass AI Marketing & Tự Động Hóa Nội Dung',
    subtitle: 'ChatGPT, Claude, Midjourney cho chiến lược nội dung bán hàng',
    description: 'Khóa học AI Marketing toàn diện.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    previewVideoUrl: '',
    category: 'marketing',
    instructorId: 'usr-admin-001',
    instructorName: 'Kiên Pro',
    price: 2800000,
    salePrice: 990000,
    status: 'draft',
    accessDurationDays: 365,
    enableCertificate: false,
    completionPercentRequired: 70,
    studentCount: 890,
    rating: 4.8,
    reviewCount: 215,
    highlights: ['Bộ Prompt viết bài bán hàng chuẩn', 'Tạo ảnh 8K Midjourney', 'Kịch bản TikTok triệu view'],
    modules: [],
    createdAt: '2026-07-25T10:00:00Z',
    updatedAt: '2026-08-01T18:00:00Z',
  },
  {
    id: 'crs-admin-vietqr',
    slug: 'tu-dong-hoa-vietqr-webhook',
    title: 'VietQR Webhook Automation: Thanh toán 0% phí',
    subtitle: 'Hệ thống nhận thanh toán ngân hàng tự động trong 3 giây',
    description: 'Khóa học chuyên sâu về tích hợp SePay/PayOS webhook.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&auto=format&fit=crop&q=80',
    previewVideoUrl: '',
    category: 'cong-nghe',
    instructorId: 'usr-admin-001',
    instructorName: 'Kiên Pro',
    price: 1990000,
    salePrice: 790000,
    status: 'archived',
    accessDurationDays: null,
    enableCertificate: true,
    completionPercentRequired: 90,
    studentCount: 450,
    rating: 4.7,
    reviewCount: 98,
    highlights: ['Zero-fee payment', 'HMAC signature verification', 'Idempotency key pattern'],
    modules: [],
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-07-15T12:00:00Z',
  },
];

// --- Mock Media Assets ---

export const MOCK_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media-vid-1', type: 'video', title: 'Bài 1 - Giới thiệu KIENPRO LMS', fileName: 'bai-1-gioi-thieu.mp4',
    fileSize: 125_000_000, mimeType: 'video/mp4', url: '#', thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
    status: 'ready', provider: 'bunny', resolution: '1920x1080', durationSeconds: 750, usedInLessons: ['les-admin-101'], createdAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'media-vid-2', type: 'video', title: 'Bài 3 - SePay Webhook Demo', fileName: 'bai-3-sepay.mp4',
    fileSize: 200_000_000, mimeType: 'video/mp4', url: '#', thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=400&auto=format&fit=crop&q=80',
    status: 'processing', provider: 'bunny', resolution: '1920x1080', durationSeconds: 1420, usedInLessons: [], createdAt: '2026-08-01T14:00:00Z',
  },
  {
    id: 'media-doc-1', type: 'document', title: 'Slide bài giảng Chương 1', fileName: 'slide-ch1.pdf',
    fileSize: 3_200_000, mimeType: 'application/pdf', url: '#', thumbnailUrl: '',
    status: 'ready', provider: 'supabase', resolution: '', durationSeconds: 0, usedInLessons: ['les-admin-101'], createdAt: '2026-07-20T10:30:00Z',
  },
  {
    id: 'media-img-1', type: 'image', title: 'Thumbnail khóa học Website AI', fileName: 'thumb-website-ai.jpg',
    fileSize: 450_000, mimeType: 'image/jpeg', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
    status: 'ready', provider: 'supabase', resolution: '1920x1080', durationSeconds: 0, usedInLessons: [], createdAt: '2026-07-15T08:00:00Z',
  },
];

// --- Export single course getter for editor ---

export function getMockCourseById(courseId: string): Course | undefined {
  return MOCK_ADMIN_COURSES.find((c) => c.id === courseId);
}

export function getMockLessonById(lessonId: string): Lesson | undefined {
  for (const course of MOCK_ADMIN_COURSES) {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) return lesson;
    }
  }
  return undefined;
}
