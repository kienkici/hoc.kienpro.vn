// =============================================================================
// KIENPRO LMS - Admin Course Builder Types
// Tất cả types cho hệ thống quản trị khóa học
// =============================================================================

// --- Enums / Union Types ---

export type CourseStatus = 'draft' | 'published' | 'archived';

export type LessonType = 'video' | 'article' | 'quiz' | 'assignment' | 'live';

export type VideoProvider = 'bunny' | 'cloudflare' | 'youtube' | 'external' | 'upload';

export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export type ResourceType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'zip' | 'image' | 'link' | 'prompt' | 'template';

export type AccessRuleType =
  | 'immediate'
  | 'complete_previous'
  | 'pass_quiz'
  | 'after_days'
  | 'specific_date'
  | 'admin_only';

export type QuizQuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export type MediaAssetType = 'video' | 'document' | 'image';

export type CourseCategory = 'thiet-ke' | 'marketing' | 'kinh-doanh' | 'cong-nghe' | 'ky-nang' | 'khac';

// --- Core Admin Entities ---

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  previewVideoUrl: string;
  category: CourseCategory;
  instructorId: string;
  instructorName: string;
  price: number;
  salePrice: number;
  status: CourseStatus;
  accessDurationDays: number | null; // null = lifetime
  enableCertificate: boolean;
  completionPercentRequired: number; // 0-100
  studentCount: number;
  rating: number;
  reviewCount: number;
  highlights: string[];
  modules: Module[];
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  isPublished: boolean;
  lessons: Lesson[];
  createdAt: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  lessonType: LessonType;
  contentMarkdown: string;
  durationSeconds: number;
  orderIndex: number;
  status: CourseStatus;
  isFreePreview: boolean;
  isRequired: boolean;
  video: VideoAsset | null;
  resources: LessonResource[];
  transcriptSegments: TranscriptSegment[];
  checklist: ChecklistItem[];
  quiz: Quiz | null;
  assignment: Assignment | null;
  accessRule: AccessRule;
  createdAt: string;
  updatedAt: string;
}

// --- Video ---

export interface VideoAsset {
  id: string;
  provider: VideoProvider;
  externalId: string; // Bunny/CF Stream video ID or external URL
  title: string;
  durationSeconds: number;
  status: VideoStatus;
  thumbnailUrl: string;
  uploadProgress: number; // 0-100
  fileSize: number; // bytes
  resolution: string;
  createdAt: string;
}

// --- Resources ---

export interface LessonResource {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  storagePath: string;
  externalUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  allowDownload: boolean;
  orderIndex: number;
  status: 'uploading' | 'ready' | 'failed';
  createdAt: string;
}

// --- Transcript ---

export interface TranscriptSegment {
  id: string;
  startTime: number; // seconds
  endTime: number; // seconds
  content: string;
  orderIndex: number;
}

// --- Checklist ---

export interface ChecklistItem {
  id: string;
  text: string;
  description: string;
  isRequired: boolean;
  orderIndex: number;
}

// --- Quiz ---

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  passingScore: number; // 0-100
  maxAttempts: number; // 0 = unlimited
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  requirePassToUnlockNext: boolean;
  timeLimitMinutes: number; // 0 = no limit
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuizQuestionType;
  text: string;
  explanation: string;
  points: number;
  orderIndex: number;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

// --- Assignment ---

export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  dueDays: number; // days after enrollment
  maxScore: number;
  allowedResponseTypes: ('text' | 'link' | 'file')[];
  allowResubmit: boolean;
  rubric: string;
}

// --- Access Rules ---

export interface AccessRule {
  type: AccessRuleType;
  value: string; // JSON string for the specific rule value
}

// --- Media Library ---

export interface MediaAsset {
  id: string;
  type: MediaAssetType;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl: string;
  status: VideoStatus | 'ready';
  provider: VideoProvider | 'supabase' | 'r2';
  resolution: string;
  durationSeconds: number;
  usedInLessons: string[]; // lesson IDs referencing this asset
  createdAt: string;
}

// --- Form Schemas (Zod-ready field definitions) ---

export interface CourseFormValues {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  previewVideoUrl: string;
  category: CourseCategory;
  instructorId: string;
  price: number;
  salePrice: number;
  status: CourseStatus;
  accessDurationDays: number | null;
  enableCertificate: boolean;
  completionPercentRequired: number;
  highlights: string[];
}

export interface LessonFormValues {
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  lessonType: LessonType;
  durationSeconds: number;
  status: CourseStatus;
  isFreePreview: boolean;
  isRequired: boolean;
  contentMarkdown: string;
}

// --- Utility ---

export const COURSE_STATUS_MAP: Record<CourseStatus, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: 'secondary' },
  published: { label: 'Đã xuất bản', color: 'success' },
  archived: { label: 'Đã lưu trữ', color: 'warning' },
};

export const LESSON_TYPE_MAP: Record<LessonType, { label: string; icon: string }> = {
  video: { label: 'Video bài giảng', icon: 'PlayCircle' },
  article: { label: 'Bài viết', icon: 'FileText' },
  quiz: { label: 'Bài kiểm tra', icon: 'ClipboardCheck' },
  assignment: { label: 'Bài tập', icon: 'PenTool' },
  live: { label: 'Buổi học trực tiếp', icon: 'Radio' },
};

export const CATEGORY_MAP: Record<CourseCategory, string> = {
  'thiet-ke': 'Thiết kế & Website',
  'marketing': 'Marketing & Quảng cáo',
  'kinh-doanh': 'Kinh doanh & Khởi nghiệp',
  'cong-nghe': 'Công nghệ & Lập trình',
  'ky-nang': 'Kỹ năng mềm',
  'khac': 'Khác',
};

export const VIDEO_STATUS_MAP: Record<VideoStatus, { label: string; color: string }> = {
  uploading: { label: 'Đang tải lên', color: 'warning' },
  processing: { label: 'Đang xử lý', color: 'warning' },
  ready: { label: 'Sẵn sàng', color: 'success' },
  failed: { label: 'Lỗi', color: 'destructive' },
};
