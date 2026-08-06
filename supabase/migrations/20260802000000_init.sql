-- =============================================================================
-- KIENPRO LMS - DATABASE INITIAL MIGRATION
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. user_roles
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'content_admin', 'instructor', 'support', 'finance', 'student')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, role)
);

-- 3. courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    thumbnail_url TEXT,
    intro_video_id VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    original_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (original_price >= 0),
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (sale_price >= 0),
    access_duration_days INT CHECK (access_duration_days >= 0),
    status VARCHAR(50) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    certificate_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    completion_percentage INT DEFAULT 80 NOT NULL CHECK (completion_percentage BETWEEN 1 AND 100),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- 4. course_modules
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0 CHECK (order_index >= 0),
    status VARCHAR(50) DEFAULT 'published' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. lessons
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    lesson_type VARCHAR(50) NOT NULL CHECK (lesson_type IN ('video', 'article', 'quiz', 'assignment', 'live')),
    duration_seconds INT NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    thumbnail_url TEXT,
    video_provider VARCHAR(50) DEFAULT 'bunny' CHECK (video_provider IN ('bunny', 'cloudflare', 'youtube', 'external', 'upload')),
    video_id VARCHAR(255),
    video_status VARCHAR(50) DEFAULT 'ready' CHECK (video_status IN ('uploading', 'processing', 'ready', 'failed')),
    is_preview BOOLEAN DEFAULT FALSE NOT NULL,
    is_required BOOLEAN DEFAULT TRUE NOT NULL,
    order_index INT NOT NULL DEFAULT 0 CHECK (order_index >= 0),
    status VARCHAR(50) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 6. lesson_resources
CREATE TABLE lesson_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('pdf', 'zip', 'doc', 'link', 'prompt', 'template')),
    storage_path TEXT,
    external_url TEXT,
    file_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT DEFAULT 0 CHECK (file_size >= 0),
    allow_download BOOLEAN DEFAULT TRUE NOT NULL,
    order_index INT NOT NULL DEFAULT 0 CHECK (order_index >= 0),
    status VARCHAR(50) DEFAULT 'ready' NOT NULL CHECK (status IN ('uploading', 'ready', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. transcript_segments
CREATE TABLE transcript_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    start_seconds NUMERIC(8, 2) NOT NULL CHECK (start_seconds >= 0),
    end_seconds NUMERIC(8, 2) NOT NULL CHECK (end_seconds >= 0),
    content TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0 CHECK (order_index >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_end_after_start CHECK (end_seconds > start_seconds)
);

-- 8. checklist_items
CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT TRUE NOT NULL,
    order_index INT NOT NULL DEFAULT 0 CHECK (order_index >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. quizzes
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score INT DEFAULT 80 NOT NULL CHECK (passing_score BETWEEN 1 AND 100),
    max_attempts INT DEFAULT 0 NOT NULL CHECK (max_attempts >= 0),
    shuffle_questions BOOLEAN DEFAULT FALSE NOT NULL,
    shuffle_answers BOOLEAN DEFAULT FALSE NOT NULL,
    required_to_continue BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. quiz_questions
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false', 'short_answer', 'essay')),
    question TEXT NOT NULL,
    explanation TEXT,
    points INT DEFAULT 10 NOT NULL CHECK (points >= 0),
    order_index INT NOT NULL DEFAULT 0 CHECK (order_index >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. quiz_options
CREATE TABLE quiz_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE NOT NULL,
    order_index INT NOT NULL DEFAULT 0 CHECK (order_index >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. assignments
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_at TIMESTAMPTZ,
    allowed_submission_types TEXT[] NOT NULL DEFAULT '{"file"}'::TEXT[],
    max_score INT DEFAULT 100 NOT NULL CHECK (max_score >= 0),
    rubric TEXT,
    allow_resubmission BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. access_rules
CREATE TABLE access_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('immediate', 'complete_previous', 'pass_quiz', 'after_days', 'specific_date', 'admin_only')),
    required_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    required_quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL,
    delay_days INT CHECK (delay_days >= 0),
    unlock_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    source VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, course_id)
);

-- 15. lesson_progress
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    progress_seconds INT DEFAULT 0 NOT NULL CHECK (progress_seconds >= 0),
    progress_percent INT DEFAULT 0 NOT NULL CHECK (progress_percent BETWEEN 0 AND 100),
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMPTZ,
    last_viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, lesson_id)
);

-- 16. student_notes
CREATE TABLE student_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    video_timestamp_seconds INT CHECK (video_timestamp_seconds >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 17. media_assets
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('video', 'document', 'image')),
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_asset_id VARCHAR(255),
    storage_path TEXT,
    file_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT DEFAULT 0 CHECK (file_size >= 0),
    duration_seconds INT DEFAULT 0 CHECK (duration_seconds >= 0),
    thumbnail_url TEXT,
    status VARCHAR(50) DEFAULT 'ready' CHECK (status IN ('uploading', 'processing', 'ready', 'failed')),
    metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 18. audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- INDEXES FOR SEARCH AND QUERY PERFORMANCE
-- =============================================================================
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_lessons_slug ON lessons(slug);
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);

-- =============================================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Dynamic function to determine if a user has a management role
CREATE OR REPLACE FUNCTION auth_has_role(role_name TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_is_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'content_admin', 'instructor', 'support', 'finance')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Profiles select own" ON profiles FOR SELECT USING (auth.uid() = id OR auth_is_manager());
CREATE POLICY "Profiles update own" ON profiles FOR UPDATE USING (auth.uid() = id OR auth_has_role('super_admin'));
CREATE POLICY "Profiles insert signup" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User Roles Policies
CREATE POLICY "User roles select own or manager" ON user_roles FOR SELECT USING (auth.uid() = user_id OR auth_is_manager());
CREATE POLICY "User roles manage by super_admin" ON user_roles FOR ALL USING (auth_has_role('super_admin'));

-- Courses Policies
CREATE POLICY "Courses view public" ON courses FOR SELECT USING (status = 'published' AND deleted_at IS NULL OR auth_is_manager());
CREATE POLICY "Courses manage content" ON courses FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('content_admin') OR auth_has_role('instructor'));

-- Course Modules Policies
CREATE POLICY "Course modules view" ON course_modules FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_id AND (courses.status = 'published' AND courses.deleted_at IS NULL)) OR auth_is_manager());
CREATE POLICY "Course modules manage content" ON public.course_modules FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('content_admin') OR auth_has_role('instructor'));

-- Lessons Policies
CREATE POLICY "Lessons view" ON lessons FOR SELECT USING (
    deleted_at IS NULL AND (
        is_preview = TRUE 
        OR EXISTS (
            SELECT 1 FROM public.enrollments 
            WHERE enrollments.course_id = lessons.course_id 
              AND enrollments.user_id = auth.uid() 
              AND enrollments.status = 'ACTIVE'
        )
        OR auth_is_manager()
    )
);
CREATE POLICY "Lessons manage content" ON lessons FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('content_admin') OR auth_has_role('instructor'));

-- Lesson Resources Policies
CREATE POLICY "Lesson resources view" ON lesson_resources FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.lessons 
        WHERE lessons.id = lesson_id 
          AND (
            lessons.is_preview = TRUE 
            OR EXISTS (
                SELECT 1 FROM public.enrollments 
                WHERE enrollments.course_id = lessons.course_id 
                  AND enrollments.user_id = auth.uid() 
                  AND enrollments.status = 'ACTIVE'
            )
          )
    ) OR auth_is_manager()
);
CREATE POLICY "Lesson resources manage content" ON lesson_resources FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('content_admin') OR auth_has_role('instructor'));

-- Transcript segments Policies
CREATE POLICY "Transcript segments view" ON transcript_segments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.lessons 
        WHERE lessons.id = lesson_id 
          AND (
            lessons.is_preview = TRUE 
            OR EXISTS (
                SELECT 1 FROM public.enrollments 
                WHERE enrollments.course_id = lessons.course_id 
                  AND enrollments.user_id = auth.uid() 
                  AND enrollments.status = 'ACTIVE'
            )
          )
    ) OR auth_is_manager()
);
CREATE POLICY "Transcript segments manage" ON transcript_segments FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('content_admin') OR auth_has_role('instructor'));

-- Checklist items Policies
CREATE POLICY "Checklist items view" ON checklist_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.lessons 
        WHERE lessons.id = lesson_id 
          AND (
            lessons.is_preview = TRUE 
            OR EXISTS (
                SELECT 1 FROM public.enrollments 
                WHERE enrollments.course_id = lessons.course_id 
                  AND enrollments.user_id = auth.uid() 
                  AND enrollments.status = 'ACTIVE'
            )
          )
    ) OR auth_is_manager()
);
CREATE POLICY "Checklist items manage" ON checklist_items FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('content_admin') OR auth_has_role('instructor'));

-- Quizzes, Questions, Options Policies
CREATE POLICY "Quizzes view" ON quizzes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.lessons 
        WHERE lessons.id = lesson_id 
          AND (
            lessons.is_preview = TRUE 
            OR EXISTS (
                SELECT 1 FROM public.enrollments 
                WHERE enrollments.course_id = lessons.course_id 
                  AND enrollments.user_id = auth.uid() 
                  AND enrollments.status = 'ACTIVE'
            )
          )
    ) OR auth_is_manager()
);
CREATE POLICY "Quizzes manage" ON quizzes FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('content_admin') OR auth_has_role('instructor'));

CREATE POLICY "Quiz questions view" ON quiz_questions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.quizzes 
        WHERE quizzes.id = quiz_id
    ) OR auth_is_manager()
);
CREATE POLICY "Quiz questions manage" ON quiz_questions FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('content_admin') OR auth_has_role('instructor'));

CREATE POLICY "Quiz options view" ON quiz_options FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.quiz_questions 
        WHERE quiz_questions.id = question_id
    ) OR auth_is_manager()
);
CREATE POLICY "Quiz options manage" ON quiz_options FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('content_admin') OR auth_has_role('instructor'));

-- Assignments Policies
CREATE POLICY "Assignments view" ON assignments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.lessons 
        WHERE lessons.id = lesson_id 
          AND (
            lessons.is_preview = TRUE 
            OR EXISTS (
                SELECT 1 FROM public.enrollments 
                WHERE enrollments.course_id = lessons.course_id 
                  AND enrollments.user_id = auth.uid() 
                  AND enrollments.status = 'ACTIVE'
            )
          )
    ) OR auth_is_manager()
);
CREATE POLICY "Assignments manage" ON assignments FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('content_admin') OR auth_has_role('instructor'));

-- Enrollments Policies
CREATE POLICY "Enrollments select own or manager" ON enrollments FOR SELECT USING (auth.uid() = user_id OR auth_is_manager());
CREATE POLICY "Enrollments manage admin" ON enrollments FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('support') OR auth_has_role('finance'));

-- Lesson Progress Policies
CREATE POLICY "Lesson progress select own or manager" ON lesson_progress FOR SELECT USING (auth.uid() = user_id OR auth_is_manager());
CREATE POLICY "Lesson progress update own" ON lesson_progress FOR ALL USING (auth.uid() = user_id OR auth_is_manager());

-- Notes Policies
CREATE POLICY "Notes manage own" ON student_notes FOR ALL USING (auth.uid() = user_id OR auth_is_manager());

-- Media Assets Policies
CREATE POLICY "Media assets view manager" ON media_assets FOR SELECT USING (auth_is_manager());
CREATE POLICY "Media assets manage" ON media_assets FOR ALL USING (auth_has_role('super_admin') OR auth_has_role('content_admin'));

-- Audit Logs Policies
CREATE POLICY "Audit logs select super_admin" ON audit_logs FOR SELECT USING (auth_has_role('super_admin'));
CREATE POLICY "Audit logs insert logging" ON audit_logs FOR INSERT WITH CHECK (TRUE);
