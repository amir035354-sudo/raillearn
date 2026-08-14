import { supabaseAdmin } from "@/lib/supabase/admin";

const LESSON_XP = 25;
const QUIZ_XP_PER_CORRECT = 50;

type ActivityResult = {
    success: boolean;
    xpAdded: number;
    achievementsUnlocked: Array<{
        id: string;
        code: string;
        title: string;
        description: string;
        icon: string;
        xp_reward: number;
    }>;
};

function normalizeRequirementType(
    value: string | null | undefined
) {
    return (value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
}

async function getOrCreateStudentStats(
    userId: string
) {
    const { data: existing, error: loadError } =
        await supabaseAdmin
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

    if (loadError) {
        throw loadError;
    }

    if (existing) {
        return existing;
    }

    const { data: created, error: createError } =
        await supabaseAdmin
            .from("student_stats")
            .insert({
                user_id: userId,
                xp: 0,
                level: 1,
                current_streak: 0,
                best_streak: 0,
                last_activity_date: null,
            })
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
            .single();

    if (createError) {
        throw createError;
    }

    return created;
}

async function updateStudentStats(
    userId: string,
    xpToAdd: number
) {
    const stats =
        await getOrCreateStudentStats(userId);

    const today = new Date();
    const todayString =
        today.toISOString().slice(0, 10);

    const oldLastActivity =
        stats.last_activity_date
            ? String(stats.last_activity_date)
            : null;

    let currentStreak =
        Number(stats.current_streak ?? 0);

    let bestStreak =
        Number(stats.best_streak ?? 0);

    if (!oldLastActivity) {
        currentStreak = 1;
    } else if (
        oldLastActivity !== todayString
    ) {
        const previous =
            new Date(
                `${oldLastActivity}T00:00:00Z`
            );

        const current =
            new Date(
                `${todayString}T00:00:00Z`
            );

        const difference =
            Math.round(
                (current.getTime() -
                    previous.getTime()) /
                86400000
            );

        if (difference === 1) {
            currentStreak += 1;
        } else if (difference > 1) {
            currentStreak = 1;
        }
    }

    bestStreak = Math.max(
        bestStreak,
        currentStreak
    );

    const newXP =
        Math.max(
            0,
            Number(stats.xp ?? 0) +
            Math.max(0, xpToAdd)
        );

    const newLevel =
        Math.max(
            1,
            Math.floor(newXP / 500) + 1
        );

    const { data: updated, error } =
        await supabaseAdmin
            .from("student_stats")
            .update({
                xp: newXP,
                level: newLevel,
                current_streak: currentStreak,
                best_streak: bestStreak,
                last_activity_date: todayString,
                updated_at:
                    new Date().toISOString(),
            })
            .eq("user_id", userId)
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
            .single();

    if (error) {
        throw error;
    }

    // Keep users table synchronized too.
    await supabaseAdmin
        .from("users")
        .update({
            xp: newXP,
            updated_at:
                new Date().toISOString(),
        })
        .eq("id", userId);

    return updated;
}

async function countCompletedLessons(
    userId: string
) {
    const { data: directProgress } =
        await supabaseAdmin
            .from("lesson_progress")
            .select("lesson_id, completed")
            .eq("user_id", userId)
            .eq("completed", true);

    const { data: legacyProgress } =
        await supabaseAdmin
            .from("progress")
            .select("lesson_id, completed")
            .eq("user_id", userId)
            .eq("completed", true);

    const ids = new Set<string>();

    for (const item of directProgress ?? []) {
        ids.add(String(item.lesson_id));
    }

    for (const item of legacyProgress ?? []) {
        ids.add(String(item.lesson_id));
    }

    return ids.size;
}

async function countQuizAttempts(
    userId: string
) {
    const { count, error } =
        await supabaseAdmin
            .from("quiz_results")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("user_id", userId);

    if (error) {
        throw error;
    }

    return count ?? 0;
}

async function unlockEligibleAchievements(
    userId: string
): Promise<ActivityResult["achievementsUnlocked"]> {
    const { data: achievements, error: achievementsError } =
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

    if (achievementsError) {
        throw achievementsError;
    }

    if (!achievements?.length) {
        return [];
    }

    const { data: unlocked, error: unlockedError } =
        await supabaseAdmin
            .from("user_achievements")
            .select(
                "achievement_id"
            )
            .eq("user_id", userId);

    if (unlockedError) {
        throw unlockedError;
    }

    const unlockedSet = new Set(
        (unlocked ?? []).map((item) =>
            String(item.achievement_id)
        )
    );

    const completedLessons =
        await countCompletedLessons(userId);

    const quizAttempts =
        await countQuizAttempts(userId);

    const stats =
        await getOrCreateStudentStats(userId);

    const currentXP =
        Number(stats.xp ?? 0);

    const currentLevel =
        Number(stats.level ?? 1);

    const currentStreak =
        Number(stats.current_streak ?? 0);

    const unlockedNow:
        ActivityResult["achievementsUnlocked"] = [];

    for (const achievement of achievements) {
        if (
            unlockedSet.has(
                String(achievement.id)
            )
        ) {
            continue;
        }

        const type =
            normalizeRequirementType(
                achievement.requirement_type
            );

        const requirement =
            Number(
                achievement.requirement_value ?? 1
            );

        let currentValue = 0;

        switch (type) {
            case "lesson":
            case "lessons":
            case "lesson_completed":
            case "lessons_completed":
            case "completed_lessons":
                currentValue =
                    completedLessons;
                break;

            case "quiz":
            case "quizzes":
            case "quiz_completed":
            case "quizzes_completed":
            case "quiz_attempt":
            case "quiz_attempts":
            case "quizzes_taken":
                currentValue =
                    quizAttempts;
                break;

            case "xp":
            case "total_xp":
                currentValue =
                    currentXP;
                break;

            case "level":
                currentValue =
                    currentLevel;
                break;

            case "streak":
            case "current_streak":
                currentValue =
                    currentStreak;
                break;

            default:
                continue;
        }

        if (
            currentValue < requirement
        ) {
            continue;
        }

        const { data: inserted, error } =
            await supabaseAdmin
                .from("user_achievements")
                .insert({
                    user_id: userId,
                    achievement_id:
                        achievement.id,
                })
                .select(
                    "achievement_id"
                )
                .maybeSingle();

        if (error) {
            // Already unlocked / unique constraint:
            // don't break the activity request.
            console.error(
                "ACHIEVEMENT UNLOCK ERROR:",
                error
            );
            continue;
        }

        if (!inserted) {
            continue;
        }

        const reward =
            Number(
                achievement.xp_reward ?? 0
            );

        if (reward > 0) {
            await supabaseAdmin
                .from("student_stats")
                .update({
                    xp:
                        Number(stats.xp ?? 0) +
                        reward,
                    updated_at:
                        new Date().toISOString(),
                })
                .eq("user_id", userId);

            stats.xp =
                Number(stats.xp ?? 0) +
                reward;

            await supabaseAdmin
                .from("users")
                .update({
                    xp:
                        Number(stats.xp ?? 0),
                    updated_at:
                        new Date().toISOString(),
                })
                .eq("id", userId);
        }

        unlockedNow.push({
            id: achievement.id,
            code: achievement.code,
            title: achievement.title,
            description:
                achievement.description,
            icon:
                achievement.icon ??
                "trophy",
            xp_reward: reward,
        });
    }

    return unlockedNow;
}

export async function completeLessonForStudent(
    userId: string,
    lessonId: string
): Promise<ActivityResult> {
    const { data: lesson, error: lessonError } =
        await supabaseAdmin
            .from("lessons")
            .select("id")
            .eq("id", lessonId)
            .maybeSingle();

    if (lessonError) {
        throw lessonError;
    }

    if (!lesson) {
        throw new Error(
            "Lesson not found."
        );
    }

    const { data: existing } =
        await supabaseAdmin
            .from("lesson_progress")
            .select(
                "id, completed"
            )
            .eq("user_id", userId)
            .eq("lesson_id", lessonId)
            .maybeSingle();

    let xpAdded = 0;

    if (!existing?.completed) {
        if (existing) {
            const { error } =
                await supabaseAdmin
                    .from("lesson_progress")
                    .update({
                        completed: true,
                        completed_at:
                            new Date().toISOString(),
                        updated_at:
                            new Date().toISOString(),
                    })
                    .eq(
                        "id",
                        existing.id
                    );

            if (error) {
                throw error;
            }
        } else {
            const { error } =
                await supabaseAdmin
                    .from("lesson_progress")
                    .insert({
                        user_id: userId,
                        lesson_id: lessonId,
                        completed: true,
                        completed_at:
                            new Date().toISOString(),
                        updated_at:
                            new Date().toISOString(),
                    });

            if (error) {
                throw error;
            }
        }

        // Keep legacy progress synchronized.
        const { data: legacyExisting } =
            await supabaseAdmin
                .from("progress")
                .select("id")
                .eq("user_id", userId)
                .eq("lesson_id", lessonId)
                .maybeSingle();

        if (legacyExisting) {
            await supabaseAdmin
                .from("progress")
                .update({
                    completed: true,
                })
                .eq(
                    "id",
                    legacyExisting.id
                );
        } else {
            await supabaseAdmin
                .from("progress")
                .insert({
                    user_id: userId,
                    lesson_id: lessonId,
                    completed: true,
                });
        }

        xpAdded = LESSON_XP;
    }

    await updateStudentStats(
        userId,
        xpAdded
    );

    const achievementsUnlocked =
        await unlockEligibleAchievements(
            userId
        );

    return {
        success: true,
        xpAdded,
        achievementsUnlocked,
    };
}

export async function recordQuizResultForStudent(
    userId: string,
    quizId: string,
    score: number,
    totalQuestions: number
): Promise<ActivityResult> {
    const safeScore = Math.max(
        0,
        Math.min(
            Number(score) || 0,
            Number(totalQuestions) || 0
        )
    );

    const safeTotal = Math.max(
        0,
        Number(totalQuestions) || 0
    );

    const { data: quiz, error: quizError } =
        await supabaseAdmin
            .from("quizzes")
            .select(
                "id, total_questions"
            )
            .eq("id", quizId)
            .maybeSingle();

    if (quizError) {
        throw quizError;
    }

    if (!quiz) {
        throw new Error(
            "Quiz not found."
        );
    }

    const actualTotal =
        safeTotal ||
        Number(
            quiz.total_questions ?? 0
        );

    const { error: resultError } =
        await supabaseAdmin
            .from("quiz_results")
            .insert({
                user_id: userId,
                quiz_id: quizId,
                score: safeScore,
                total_questions:
                    actualTotal,
                completed_at:
                    new Date().toISOString(),
            });

    if (resultError) {
        throw resultError;
    }

    const xpAdded =
        safeScore *
        QUIZ_XP_PER_CORRECT;

    await updateStudentStats(
        userId,
        xpAdded
    );

    const achievementsUnlocked =
        await unlockEligibleAchievements(
            userId
        );

    return {
        success: true,
        xpAdded,
        achievementsUnlocked,
    };
}