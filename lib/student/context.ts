import { supabaseAdmin } from "@/lib/supabase/admin";

type BuildStudentContextOptions = {
    userId: string;
    subjectId?: string | null;
    lessonId?: string | null;
    quizId?: string | null;
    limitLessons?: number;
    limitQuizzes?: number;
    limitResults?: number;
};

function uniqueBy<T>(
    items: T[],
    getKey: (item: T) => string
) {
    const seen = new Set<string>();

    return items.filter((item) => {
        const key = getKey(item);

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

export async function buildStudentContext({
    userId,
    subjectId = null,
    lessonId = null,
    quizId = null,
    limitLessons = 30,
    limitQuizzes = 30,
    limitResults = 20,
}: BuildStudentContextOptions) {
    // =====================================================
    // USER
    // =====================================================

    const { data: userProfile } = await supabaseAdmin
        .from("users")
        .select(`
      id,
      full_name,
      name,
      email,
      university_id,
      faculty,
      department,
      level,
      role,
      phone,
      auth_provider,
      avatar_url,
      bio,
      xp,
      created_at,
      updated_at
    `)
        .eq("id", userId)
        .maybeSingle();

    // =====================================================
    // STUDENT STATS
    // =====================================================

    const { data: studentStats } = await supabaseAdmin
        .from("student_stats")
        .select(`
      user_id,
      xp,
      level,
      current_streak,
      best_streak,
      last_activity_date,
      created_at,
      updated_at
    `)
        .eq("user_id", userId)
        .maybeSingle();

    // =====================================================
    // AI MEMORY
    // =====================================================

    const { data: aiMemory } = await supabaseAdmin
        .from("ai_memory")
        .select(`
      id,
      user_id,
      user_name,
      preferred_language,
      preferred_style,
      learning_level,
      preferences,
      important_notes,
      updated_at
    `)
        .eq("user_id", userId)
        .maybeSingle();

    // =====================================================
    // SUBJECTS
    // =====================================================

    let subjectsQuery = supabaseAdmin
        .from("subjects")
        .select(`
      id,
      name,
      code,
      semester,
      description,
      image_url,
      image,
      icon,
      instructor,
      level,
      display_order,
      is_published,
      is_active,
      created_at,
      updated_at
    `)
        .eq("is_active", true)
        .eq("is_published", true)
        .order("display_order", {
            ascending: true,
            nullsFirst: false,
        });

    if (subjectId) {
        subjectsQuery = subjectsQuery.eq(
            "id",
            subjectId
        );
    }

    const { data: subjects } =
        await subjectsQuery;

    const safeSubjects = subjects ?? [];

    const subjectIds = safeSubjects.map(
        (subject) => subject.id
    );

    // =====================================================
    // LESSONS
    // =====================================================

    let lessonsQuery = supabaseAdmin
        .from("lessons")
        .select(`
      id,
      subject_id,
      title,
      description,
      content,
      order_number,
      lesson_order,
      image,
      slug,
      video_url,
      pdf_url,
      thumbnail_url,
      duration_minutes,
      difficulty,
      is_published,
      updated_at,
      objectives,
      prerequisites,
      resources,
      estimated_minutes,
      views_count,
      is_free
    `)
        .order("lesson_order", {
            ascending: true,
            nullsFirst: false,
        })
        .order("order_number", {
            ascending: true,
            nullsFirst: false,
        })
        .limit(limitLessons);

    if (subjectIds.length > 0) {
        lessonsQuery = lessonsQuery.in(
            "subject_id",
            subjectIds
        );
    } else if (subjectId) {
        lessonsQuery = lessonsQuery.eq(
            "subject_id",
            subjectId
        );
    } else {
        // no subject filter
    }

    if (lessonId) {
        lessonsQuery = lessonsQuery.eq(
            "id",
            lessonId
        );
    }

    const { data: lessons } =
        await lessonsQuery;

    const safeLessons = lessons ?? [];

    const lessonIds = safeLessons.map(
        (lesson) => lesson.id
    );

    // =====================================================
    // LESSON PROGRESS
    // =====================================================

    let lessonProgress: any[] = [];

    if (lessonIds.length > 0) {
        const { data } =
            await supabaseAdmin
                .from("lesson_progress")
                .select(`
          id,
          user_id,
          lesson_id,
          completed_at,
          completed,
          updated_at
        `)
                .eq("user_id", userId)
                .in(
                    "lesson_id",
                    lessonIds
                );

        lessonProgress = data ?? [];
    }

    // =====================================================
    // LEGACY PROGRESS
    // =====================================================

    let legacyProgress: any[] = [];

    if (lessonIds.length > 0) {
        const { data } =
            await supabaseAdmin
                .from("progress")
                .select(`
          id,
          user_id,
          lesson_id,
          completed,
          created_at
        `)
                .eq("user_id", userId)
                .in(
                    "lesson_id",
                    lessonIds
                );

        legacyProgress = data ?? [];
    }

    // =====================================================
    // MERGED LESSON STATUS
    // =====================================================

    const progressMap = new Map<
        string,
        {
            completed: boolean;
            completedAt: string | null;
        }
    >();

    for (const item of legacyProgress) {
        progressMap.set(
            String(item.lesson_id),
            {
                completed:
                    item.completed === true,
                completedAt: null,
            }
        );
    }

    for (const item of lessonProgress) {
        const previous =
            progressMap.get(
                String(item.lesson_id)
            );

        progressMap.set(
            String(item.lesson_id),
            {
                completed:
                    item.completed === true ||
                    previous?.completed === true,
                completedAt:
                    item.completed_at ??
                    previous?.completedAt ??
                    null,
            }
        );
    }

    // =====================================================
    // QUIZZES
    // =====================================================

    let quizzesQuery = supabaseAdmin
        .from("quizzes")
        .select(`
      id,
      subject_id,
      lesson_id,
      title,
      total_questions,
      description,
      created_at
    `)
        .order("created_at", {
            ascending: false,
        })
        .limit(limitQuizzes);

    if (subjectIds.length > 0) {
        quizzesQuery = quizzesQuery.in(
            "subject_id",
            subjectIds
        );
    } else if (subjectId) {
        quizzesQuery = quizzesQuery.eq(
            "subject_id",
            subjectId
        );
    }

    if (lessonId) {
        quizzesQuery = quizzesQuery.eq(
            "lesson_id",
            lessonId
        );
    }

    if (quizId) {
        quizzesQuery = quizzesQuery.eq(
            "id",
            quizId
        );
    }

    const { data: quizzes } =
        await quizzesQuery;

    const safeQuizzes = quizzes ?? [];

    const quizIds = safeQuizzes.map(
        (quiz) => quiz.id
    );

    // =====================================================
    // QUIZ RESULTS
    // =====================================================

    let quizResultsQuery = supabaseAdmin
        .from("quiz_results")
        .select(`
      id,
      user_id,
      quiz_id,
      score,
      total_questions,
      completed_at
    `)
        .eq("user_id", userId)
        .order("completed_at", {
            ascending: false,
        })
        .limit(limitResults);

    if (quizIds.length > 0) {
        quizResultsQuery =
            quizResultsQuery.in(
                "quiz_id",
                quizIds
            );
    } else if (quizId) {
        quizResultsQuery =
            quizResultsQuery.eq(
                "quiz_id",
                quizId
            );
    }

    const { data: quizResults } =
        await quizResultsQuery;

    const safeQuizResults =
        quizResults ?? [];

    // =====================================================
    // QUIZ QUESTIONS
    // =====================================================

    let quizQuestions: any[] = [];

    if (quizIds.length > 0) {
        const { data } =
            await supabaseAdmin
                .from("quiz_questions")
                .select(`
          id,
          quiz_id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          question_order,
          created_at
        `)
                .in(
                    "quiz_id",
                    quizIds
                )
                .order("question_order", {
                    ascending: true,
                });

        quizQuestions = data ?? [];
    }

    // =====================================================
    // LEGACY QUESTIONS
    // =====================================================

    let legacyQuestions: any[] = [];

    if (quizIds.length > 0) {
        const { data } =
            await supabaseAdmin
                .from("questions")
                .select(`
          id,
          quiz_id,
          question,
          option1,
          option2,
          option3,
          option4,
          correct_answer
        `)
                .in(
                    "quiz_id",
                    quizIds
                );

        legacyQuestions = data ?? [];
    }

    // =====================================================
    // ACHIEVEMENTS
    // =====================================================

    const { data: achievements } =
        await supabaseAdmin
            .from("achievements")
            .select(`
        id,
        code,
        title,
        description,
        icon,
        xp_reward,
        category,
        requirement_type,
        requirement_value,
        display_order,
        active
      `)
            .eq("active", true)
            .order("display_order", {
                ascending: true,
            });

    const { data: userAchievements } =
        await supabaseAdmin
            .from("user_achievements")
            .select(`
        id,
        achievement_id,
        unlocked_at
      `)
            .eq(
                "user_id",
                userId
            );

    const unlockedIds = new Set(
        (userAchievements ?? []).map(
            (item) =>
                String(item.achievement_id)
        )
    );

    // =====================================================
    // SUBJECT ENRICHMENT
    // =====================================================

    const subjectMap = new Map<
        string,
        any
    >();

    for (const subject of safeSubjects) {
        subjectMap.set(
            String(subject.id),
            subject
        );
    }

    const lessonPayload =
        safeLessons.map((lesson) => {
            const progress =
                progressMap.get(
                    String(lesson.id)
                );

            const subject =
                subjectMap.get(
                    String(lesson.subject_id)
                );

            return {
                ...lesson,

                subject_name:
                    subject?.name ?? null,

                subject_code:
                    subject?.code ?? null,

                completed:
                    progress?.completed ??
                    false,

                completed_at:
                    progress?.completedAt ??
                    null,
            };
        });

    // =====================================================
    // QUIZ ENRICHMENT
    // =====================================================

    const quizMap = new Map<
        string,
        any
    >();

    for (const quiz of safeQuizzes) {
        quizMap.set(
            String(quiz.id),
            {
                ...quiz,
                subject:
                    subjectMap.get(
                        String(
                            quiz.subject_id
                        )
                    ) ?? null,
            }
        );
    }

    const quizPayload =
        safeQuizzes.map((quiz) => {
            const relatedResults =
                safeQuizResults.filter(
                    (result) =>
                        String(
                            result.quiz_id
                        ) === String(quiz.id)
                );

            return {
                ...quizMap.get(
                    String(quiz.id)
                ),

                attempts:
                    relatedResults.length,

                best_score:
                    relatedResults.length
                        ? Math.max(
                            ...relatedResults.map(
                                (result) =>
                                    Number(
                                        result.score
                                    )
                            )
                        )
                        : null,

                latest_result:
                    relatedResults[0] ??
                    null,
            };
        });

    // =====================================================
    // QUESTIONS PAYLOAD
    // =====================================================

    const normalizedQuizQuestions =
        quizQuestions.map(
            (item) => ({
                id: item.id,
                quiz_id: item.quiz_id,
                question: item.question,
                options: {
                    A: item.option_a,
                    B: item.option_b,
                    C: item.option_c,
                    D: item.option_d,
                },
                correct_answer:
                    item.correct_answer,
                question_order:
                    item.question_order,
            })
        );

    const normalizedLegacyQuestions =
        legacyQuestions.map(
            (item) => ({
                id: item.id,
                quiz_id: item.quiz_id,
                question: item.question,
                options: {
                    A: item.option1,
                    B: item.option2,
                    C: item.option3,
                    D: item.option4,
                },
                correct_answer:
                    item.correct_answer,
            })
        );

    // نفضل quiz_questions، ولو مفيش نستخدم questions
    const finalQuestions =
        normalizedQuizQuestions.length > 0
            ? normalizedQuizQuestions
            : normalizedLegacyQuestions;

    // =====================================================
    // ACHIEVEMENTS PAYLOAD
    // =====================================================

    const achievementPayload =
        (achievements ?? []).map(
            (achievement) => ({
                ...achievement,
                unlocked:
                    unlockedIds.has(
                        String(
                            achievement.id
                        )
                    ),
                unlocked_at:
                    (userAchievements ?? []).find(
                        (item) =>
                            String(
                                item.achievement_id
                            ) ===
                            String(
                                achievement.id
                            )
                    )?.unlocked_at ??
                    null,
            })
        );

    // =====================================================
    // SUMMARY
    // =====================================================

    const completedLessons =
        lessonPayload.filter(
            (lesson) =>
                lesson.completed
        ).length;

    const totalLessons =
        lessonPayload.length;

    const lessonCompletionPercentage =
        totalLessons > 0
            ? Math.round(
                (completedLessons /
                    totalLessons) *
                100
            )
            : 0;

    const totalQuizAttempts =
        safeQuizResults.length;

    const averageQuizPercentage =
        totalQuizAttempts > 0
            ? Math.round(
                safeQuizResults.reduce(
                    (sum, result) => {
                        const total =
                            Number(
                                result.total_questions
                            ) || 0;

                        const score =
                            Number(
                                result.score
                            ) || 0;

                        return (
                            sum +
                            (total > 0
                                ? (score / total) *
                                100
                                : 0)
                        );
                    },
                    0
                ) /
                totalQuizAttempts
            )
            : 0;

    const unlockedAchievements =
        achievementPayload.filter(
            (achievement) =>
                achievement.unlocked
        ).length;

    // =====================================================
    // FINAL CONTEXT
    // =====================================================

    return {
        generated_at:
            new Date().toISOString(),

        student: {
            profile:
                userProfile ?? null,

            stats:
                studentStats ?? null,

            memory:
                aiMemory ?? null,
        },

        subjects: safeSubjects,

        lessons: lessonPayload,

        progress: {
            completed_lessons:
                completedLessons,

            total_lessons:
                totalLessons,

            completion_percentage:
                lessonCompletionPercentage,

            lesson_progress:
                lessonProgress,

            legacy_progress:
                legacyProgress,
        },

        quizzes: {
            list:
                uniqueBy(
                    quizPayload,
                    (item) =>
                        String(item.id)
                ),

            questions:
                finalQuestions,

            results:
                safeQuizResults,

            total_attempts:
                totalQuizAttempts,

            average_percentage:
                averageQuizPercentage,
        },

        achievements: {
            list:
                achievementPayload,

            unlocked:
                unlockedAchievements,

            total:
                achievementPayload.length,
        },

        summary: {
            subjects:
                safeSubjects.length,

            lessons:
                totalLessons,

            completed_lessons:
                completedLessons,

            lesson_completion_percentage:
                lessonCompletionPercentage,

            quizzes:
                safeQuizzes.length,

            quiz_attempts:
                totalQuizAttempts,

            average_quiz_percentage:
                averageQuizPercentage,

            achievements_unlocked:
                unlockedAchievements,

            achievements_total:
                achievementPayload.length,

            xp:
                studentStats?.xp ??
                userProfile?.xp ??
                0,

            level:
                studentStats?.level ??
                userProfile?.level ??
                1,

            current_streak:
                studentStats?.current_streak ??
                0,

            best_streak:
                studentStats?.best_streak ??
                0,
        },
    };
}