import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

/* =========================================================
   CONFIG
========================================================= */

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type AdminCheck =
    | {
        ok: true;
        userId: string;
    }
    | {
        ok: false;
        status: number;
        error: string;
    };

type UserRow = {
    id: string;

    name: string | null;
    full_name: string | null;

    email: string | null;
    phone: string | null;

    university_id: string | null;
    faculty: string | null;
    department: string | null;

    level: number | null;
    role: string | null;

    avatar_url: string | null;
    bio: string | null;

    auth_provider: string | null;

    xp: number | null;

    created_at: string | null;
    updated_at: string | null;
};

type StudentStatsRow = {
    user_id: string;

    xp: number | null;
    level: number | null;

    current_streak: number | null;
    best_streak: number | null;

    last_activity_date: string | null;
};

type LessonProgressRow = {
    lesson_id: string | null;
    completed: boolean | null;
};

type QuizResultRow = {
    quiz_id: string;
    score: number | null;
    total_questions: number | null;
    completed_at: string | null;
};

/* =========================================================
   HELPERS
========================================================= */

function isAdminRole(
    value: unknown
): boolean {
    if (
        typeof value !== "string"
    ) {
        return false;
    }

    return [
        "admin",
        "administrator",
        "super_admin",
        "superadmin",
    ].includes(
        value.trim().toLowerCase()
    );
}

function cleanString(
    value: unknown
): string | null {
    if (
        typeof value !== "string"
    ) {
        return null;
    }

    const result = value.trim();

    return result.length > 0
        ? result
        : null;
}

function numberValue(
    value: unknown,
    fallback = 0
): number {
    const result = Number(value);

    if (
        !Number.isFinite(result)
    ) {
        return fallback;
    }

    return result;
}

function positiveInteger(
    value: unknown,
    fallback = 0
): number {
    return Math.max(
        0,
        Math.floor(
            numberValue(
                value,
                fallback
            )
        )
    );
}

/* =========================================================
   ADMIN AUTHORIZATION
========================================================= */

async function verifyAdmin(): Promise<AdminCheck> {
    const supabase =
        await getSupabaseServerClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        console.error(
            "ADMIN AUTH ERROR:",
            error
        );
    }

    if (!user) {
        return {
            ok: false,
            status: 401,
            error: "Unauthorized.",
        };
    }

    let databaseRole:
        | string
        | null = null;

    const {
        data: profile,
        error: profileError,
    } = await supabaseAdmin
        .from("users")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
        console.error(
            "ADMIN ROLE ERROR:",
            profileError
        );
    }

    if (
        typeof profile?.role ===
        "string"
    ) {
        databaseRole =
            profile.role;
    }

    const metadataRole =
        user.app_metadata?.role ??
        user.user_metadata?.role;

    const isAdmin =
        isAdminRole(databaseRole) ||
        isAdminRole(metadataRole);

    if (!isAdmin) {
        return {
            ok: false,
            status: 403,
            error:
                "Forbidden. Administrator access is required.",
        };
    }

    return {
        ok: true,
        userId: user.id,
    };
}

/* =========================================================
   LOAD STUDENT
========================================================= */

async function loadStudent(
    studentId: string
) {
    /* -------------------------------------------------------
       USERS
    ------------------------------------------------------- */

    const {
        data: profile,
        error: profileError,
    } = await supabaseAdmin
        .from("users")
        .select(
            `
                id,
                name,
                full_name,
                email,
                phone,
                university_id,
                faculty,
                department,
                level,
                role,
                avatar_url,
                bio,
                auth_provider,
                xp,
                created_at,
                updated_at
            `
        )
        .eq("id", studentId)
        .maybeSingle();

    if (profileError) {
        throw profileError;
    }

    if (!profile) {
        return null;
    }

    const user =
        profile as UserRow;

    /* -------------------------------------------------------
       AUTH
    ------------------------------------------------------- */

    const {
        data: authData,
        error: authError,
    } =
        await supabaseAdmin.auth.admin.getUserById(
            studentId
        );

    if (authError) {
        throw authError;
    }

    const authUser =
        authData.user;

    if (!authUser) {
        return null;
    }

    /* -------------------------------------------------------
       STUDENT STATS
    ------------------------------------------------------- */

    const {
        data: statsData,
        error: statsError,
    } =
        await supabaseAdmin
            .from("student_stats")
            .select(
                `
                    user_id,
                    xp,
                    level,
                    current_streak,
                    best_streak,
                    last_activity_date
                `
            )
            .eq("user_id", studentId)
            .maybeSingle();

    if (statsError) {
        console.error(
            "STUDENT STATS ERROR:",
            statsError
        );
    }

    const stats =
        (statsData ??
            null) as StudentStatsRow | null;

    /* -------------------------------------------------------
       TOTAL LESSONS
    ------------------------------------------------------- */

    const {
        count: lessonCount,
        error: lessonCountError,
    } =
        await supabaseAdmin
            .from("lessons")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq(
                "is_published",
                true
            );

    if (lessonCountError) {
        console.error(
            "LESSON COUNT ERROR:",
            lessonCountError
        );
    }

    const totalLessons =
        Number(
            lessonCount ?? 0
        );

    /* -------------------------------------------------------
       LESSON PROGRESS
    ------------------------------------------------------- */

    const {
        data: progressData,
        error: progressError,
    } =
        await supabaseAdmin
            .from("lesson_progress")
            .select(
                "lesson_id, completed"
            )
            .eq("user_id", studentId);

    if (progressError) {
        console.error(
            "LESSON PROGRESS ERROR:",
            progressError
        );
    }

    const completedLessonIds =
        new Set<string>();

    for (
        const row of
        (progressData ??
            []) as LessonProgressRow[]
    ) {
        if (
            row.lesson_id &&
            row.completed === true
        ) {
            completedLessonIds.add(
                String(
                    row.lesson_id
                )
            );
        }
    }

    /* -------------------------------------------------------
       LEGACY PROGRESS
    ------------------------------------------------------- */

    const {
        data: legacyData,
        error: legacyError,
    } =
        await supabaseAdmin
            .from("progress")
            .select(
                "lesson_id, completed"
            )
            .eq("user_id", studentId);

    if (legacyError) {
        console.error(
            "LEGACY PROGRESS ERROR:",
            legacyError
        );
    }

    for (
        const row of
        (legacyData ??
            []) as LessonProgressRow[]
    ) {
        if (
            row.lesson_id &&
            row.completed === true
        ) {
            completedLessonIds.add(
                String(
                    row.lesson_id
                )
            );
        }
    }

    const completedLessons =
        completedLessonIds.size;

    const progressPercentage =
        totalLessons > 0
            ? Math.min(
                100,
                Math.round(
                    (completedLessons /
                        totalLessons) *
                    100
                )
            )
            : 0;

    /* -------------------------------------------------------
       TOTAL QUIZZES
    ------------------------------------------------------- */

    const {
        count: quizCount,
        error: quizCountError,
    } =
        await supabaseAdmin
            .from("quizzes")
            .select("id", {
                count: "exact",
                head: true,
            });

    if (quizCountError) {
        console.error(
            "QUIZ COUNT ERROR:",
            quizCountError
        );
    }

    const totalQuizzes =
        Number(
            quizCount ?? 0
        );

    /* -------------------------------------------------------
       QUIZ RESULTS
    ------------------------------------------------------- */

    const {
        data: quizData,
        error: quizError,
    } =
        await supabaseAdmin
            .from("quiz_results")
            .select(
                `
                    quiz_id,
                    score,
                    total_questions,
                    completed_at
                `
            )
            .eq("user_id", studentId)
            .order(
                "completed_at",
                {
                    ascending:
                        false,
                }
            );

    if (quizError) {
        console.error(
            "QUIZ RESULTS ERROR:",
            quizError
        );
    }

    const quizResults =
        (quizData ??
            []) as QuizResultRow[];

    /* -------------------------------------------------------
       LATEST RESULT PER QUIZ
    ------------------------------------------------------- */

    const latestResults: Record<
        string,
        QuizResultRow
    > = {};

    for (
        const result of
        quizResults
    ) {
        const quizId =
            String(
                result.quiz_id
            );

        if (
            !latestResults[
            quizId
            ]
        ) {
            latestResults[
                quizId
            ] = result;
        }
    }

    const latestQuizResults =
        Object.values(
            latestResults
        );

    /* -------------------------------------------------------
       QUIZ STATISTICS
    ------------------------------------------------------- */

    const percentages: number[] =
        [];

    let perfectQuizzes = 0;

    for (
        const result of
        latestQuizResults
    ) {
        const score =
            numberValue(
                result.score,
                0
            );

        const total =
            numberValue(
                result.total_questions,
                0
            );

        if (total <= 0) {
            continue;
        }

        const percentage =
            Math.min(
                100,
                Math.max(
                    0,
                    (score /
                        total) *
                    100
                )
            );

        percentages.push(
            percentage
        );

        if (
            score ===
            total
        ) {
            perfectQuizzes++;
        }
    }

    const quizAverage =
        percentages.length > 0
            ? Math.round(
                percentages.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum + value,
                    0
                ) /
                percentages.length
            )
            : 0;

    /* -------------------------------------------------------
       RESULT
    ------------------------------------------------------- */

    return {
        id: user.id,

        name:
            user.full_name ??
            user.name ??
            authUser.user_metadata
                ?.name ??
            authUser.email?.split(
                "@"
            )[0] ??
            "Railway Student",

        full_name:
            user.full_name,

        email:
            user.email ??
            authUser.email ??
            null,

        phone:
            user.phone,

        university_id:
            user.university_id,

        faculty:
            user.faculty,

        department:
            user.department,

        level:
            stats?.level ??
            user.level ??
            null,

        role:
            user.role ??
            "student",

        avatar_url:
            user.avatar_url ??
            authUser.user_metadata
                ?.avatar_url ??
            null,

        bio:
            user.bio,

        auth_provider:
            user.auth_provider,

        xp:
            stats?.xp ??
            user.xp ??
            0,

        created_at:
            user.created_at ??
            authUser.created_at,

        updated_at:
            user.updated_at,

        auth: {
            id:
                authUser.id,

            email:
                authUser.email ??
                null,

            created_at:
                authUser.created_at,

            updated_at:
                authUser.updated_at,

            last_sign_in_at:
                authUser.last_sign_in_at,

            banned_until:
                authUser.banned_until,

            confirmed_at:
                authUser.confirmed_at,

            email_confirmed_at:
                authUser.email_confirmed_at,

            phone_confirmed_at:
                authUser.phone_confirmed_at,
        },

        stats: stats
            ? {
                user_id:
                    stats.user_id,

                xp:
                    stats.xp,

                level:
                    stats.level,

                current_streak:
                    stats.current_streak,

                best_streak:
                    stats.best_streak,

                last_activity_date:
                    stats.last_activity_date,
            }
            : null,

        progress: {
            total:
                totalLessons,

            completed:
                completedLessons,

            percentage:
                progressPercentage,

            lessons: [],
        },

        quizzes: {
            total:
                totalQuizzes,

            attempts:
                quizResults.length,

            completed:
                latestQuizResults.length,

            average:
                quizAverage,

            perfect:
                perfectQuizzes,

            results:
                latestQuizResults,
        },
    };
}

/* =========================================================
   GET /api/admin/students/[id]
========================================================= */

export async function GET(
    _request: Request,
    context: RouteContext
) {
    try {
        const admin =
            await verifyAdmin();

        if (!admin.ok) {
            return NextResponse.json(
                {
                    error:
                        admin.error,
                },
                {
                    status:
                        admin.status,
                }
            );
        }

        const {
            id: studentId,
        } =
            await context.params;

        if (!studentId) {
            return NextResponse.json(
                {
                    error:
                        "Student ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const student =
            await loadStudent(
                studentId
            );

        if (!student) {
            return NextResponse.json(
                {
                    error:
                        "Student not found.",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            student,
        });
    } catch (error) {
        console.error(
            "ADMIN STUDENT GET ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load student.",
            },
            {
                status: 500,
            }
        );
    }
}

/* =========================================================
   PATCH /api/admin/students/[id]
========================================================= */

export async function PATCH(
    request: Request,
    context: RouteContext
) {
    try {
        const admin =
            await verifyAdmin();

        if (!admin.ok) {
            return NextResponse.json(
                {
                    error:
                        admin.error,
                },
                {
                    status:
                        admin.status,
                }
            );
        }

        const {
            id: studentId,
        } =
            await context.params;

        if (!studentId) {
            return NextResponse.json(
                {
                    error:
                        "Student ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            studentId ===
            admin.userId
        ) {
            return NextResponse.json(
                {
                    error:
                        "You cannot manage your own administrator account here.",
                },
                {
                    status: 400,
                }
            );
        }

        let body: Record<
            string,
            unknown
        >;

        try {
            body =
                (await request.json()) as Record<
                    string,
                    unknown
                >;
        } catch {
            return NextResponse.json(
                {
                    error:
                        "Invalid JSON body.",
                },
                {
                    status: 400,
                }
            );
        }

        const target =
            await loadStudent(
                studentId
            );

        if (!target) {
            return NextResponse.json(
                {
                    error:
                        "Student not found.",
                },
                {
                    status: 404,
                }
            );
        }

        if (
            isAdminRole(
                target.role
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Administrator accounts cannot be managed from the student manager.",
                },
                {
                    status: 403,
                }
            );
        }

        const action =
            typeof body.action ===
                "string"
                ? body.action
                : "update_profile";

        /* =====================================================
           UPDATE PROFILE
        ===================================================== */

        if (
            action ===
            "update_profile"
        ) {
            const updates: Record<
                string,
                unknown
            > = {};

            if (
                body.full_name !==
                undefined
            ) {
                const fullName =
                    cleanString(
                        body.full_name
                    );

                if (
                    !fullName ||
                    fullName.length <
                    2
                ) {
                    return NextResponse.json(
                        {
                            error:
                                "Full name must contain at least 2 characters.",
                        },
                        {
                            status: 400,
                        }
                    );
                }

                updates.full_name =
                    fullName;

                /*
                 * Keep name synchronized because
                 * some existing parts of the project
                 * may still use users.name.
                 */
                updates.name =
                    fullName;
            }

            if (
                body.phone !==
                undefined
            ) {
                updates.phone =
                    cleanString(
                        body.phone
                    );
            }

            if (
                body.university_id !==
                undefined
            ) {
                updates.university_id =
                    cleanString(
                        body.university_id
                    );
            }

            if (
                body.faculty !==
                undefined
            ) {
                updates.faculty =
                    cleanString(
                        body.faculty
                    );
            }

            if (
                body.department !==
                undefined
            ) {
                updates.department =
                    cleanString(
                        body.department
                    );
            }

            if (
                body.avatar_url !==
                undefined
            ) {
                const avatar =
                    cleanString(
                        body.avatar_url
                    );

                if (
                    avatar &&
                    avatar.length >
                    2000
                ) {
                    return NextResponse.json(
                        {
                            error:
                                "Avatar URL is too long.",
                        },
                        {
                            status: 400,
                        }
                    );
                }

                updates.avatar_url =
                    avatar;
            }

            if (
                body.bio !==
                undefined
            ) {
                const bio =
                    cleanString(
                        body.bio
                    );

                if (
                    bio &&
                    bio.length >
                    1000
                ) {
                    return NextResponse.json(
                        {
                            error:
                                "Bio is too long.",
                        },
                        {
                            status: 400,
                        }
                    );
                }

                updates.bio =
                    bio;
            }

            if (
                body.level !==
                undefined
            ) {
                updates.level =
                    Math.max(
                        1,
                        positiveInteger(
                            body.level,
                            target.level ??
                            1
                        )
                    );
            }

            if (
                Object.keys(
                    updates
                ).length >
                0
            ) {
                const {
                    error,
                } =
                    await supabaseAdmin
                        .from(
                            "users"
                        )
                        .update(
                            updates
                        )
                        .eq(
                            "id",
                            studentId
                        );

                if (error) {
                    return NextResponse.json(
                        {
                            error:
                                error.message,
                        },
                        {
                            status: 400,
                        }
                    );
                }
            }
        }

        /* =====================================================
           UPDATE XP
        ===================================================== */

        if (
            action ===
            "update_xp"
        ) {
            const xp =
                positiveInteger(
                    body.xp,
                    target.xp
                );

            const {
                error:
                usersError,
            } =
                await supabaseAdmin
                    .from(
                        "users"
                    )
                    .update({
                        xp,
                    })
                    .eq(
                        "id",
                        studentId
                    );

            if (usersError) {
                return NextResponse.json(
                    {
                        error:
                            usersError.message,
                    },
                    {
                        status: 400,
                    }
                );
            }

            const {
                error:
                statsError,
            } =
                await supabaseAdmin
                    .from(
                        "student_stats"
                    )
                    .upsert(
                        {
                            user_id:
                                studentId,
                            xp,
                        },
                        {
                            onConflict:
                                "user_id",
                        }
                    );

            if (statsError) {
                return NextResponse.json(
                    {
                        error:
                            statsError.message,
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        /* =====================================================
           UPDATE LEVEL
        ===================================================== */

        if (
            action ===
            "update_level"
        ) {
            const level =
                Math.max(
                    1,
                    positiveInteger(
                        body.level,
                        target.level ??
                        1
                    )
                );

            const {
                error:
                usersError,
            } =
                await supabaseAdmin
                    .from(
                        "users"
                    )
                    .update({
                        level,
                    })
                    .eq(
                        "id",
                        studentId
                    );

            if (usersError) {
                return NextResponse.json(
                    {
                        error:
                            usersError.message,
                    },
                    {
                        status: 400,
                    }
                );
            }

            const {
                error:
                statsError,
            } =
                await supabaseAdmin
                    .from(
                        "student_stats"
                    )
                    .upsert(
                        {
                            user_id:
                                studentId,
                            level,
                        },
                        {
                            onConflict:
                                "user_id",
                        }
                    );

            if (statsError) {
                return NextResponse.json(
                    {
                        error:
                            statsError.message,
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        /* =====================================================
           UPDATE STREAK
        ===================================================== */

        if (
            action ===
            "update_streak"
        ) {
            const currentStreak =
                positiveInteger(
                    body.current_streak,
                    0
                );

            const bestStreak =
                Math.max(
                    currentStreak,
                    positiveInteger(
                        body.best_streak,
                        currentStreak
                    )
                );

            const {
                error,
            } =
                await supabaseAdmin
                    .from(
                        "student_stats"
                    )
                    .upsert(
                        {
                            user_id:
                                studentId,
                            current_streak:
                                currentStreak,
                            best_streak:
                                bestStreak,
                        },
                        {
                            onConflict:
                                "user_id",
                        }
                    );

            if (error) {
                return NextResponse.json(
                    {
                        error:
                            error.message,
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        /* =====================================================
           RESET STREAK
        ===================================================== */

        if (
            action ===
            "reset_streak"
        ) {
            const {
                error,
            } =
                await supabaseAdmin
                    .from(
                        "student_stats"
                    )
                    .upsert(
                        {
                            user_id:
                                studentId,
                            current_streak:
                                0,
                            best_streak:
                                0,
                            last_activity_date:
                                null,
                        },
                        {
                            onConflict:
                                "user_id",
                        }
                    );

            if (error) {
                return NextResponse.json(
                    {
                        error:
                            error.message,
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        /* =====================================================
           UPDATE EMAIL
        ===================================================== */

        if (
            action ===
            "update_email"
        ) {
            const email =
                cleanString(
                    body.email
                );

            if (!email) {
                return NextResponse.json(
                    {
                        error:
                            "Email is required.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const emailIsValid =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    email
                );

            if (!emailIsValid) {
                return NextResponse.json(
                    {
                        error:
                            "Invalid email address.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const {
                error:
                authError,
            } =
                await supabaseAdmin.auth.admin.updateUserById(
                    studentId,
                    {
                        email,
                    }
                );

            if (authError) {
                return NextResponse.json(
                    {
                        error:
                            authError.message,
                    },
                    {
                        status: 400,
                    }
                );
            }

            const {
                error:
                databaseError,
            } =
                await supabaseAdmin
                    .from(
                        "users"
                    )
                    .update({
                        email,
                    })
                    .eq(
                        "id",
                        studentId
                    );

            if (
                databaseError
            ) {
                return NextResponse.json(
                    {
                        error:
                            databaseError.message,
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        /* =====================================================
           BAN
        ===================================================== */

        if (
            action ===
            "ban"
        ) {
            const {
                error,
            } =
                await supabaseAdmin.auth.admin.updateUserById(
                    studentId,
                    {
                        ban_duration:
                            "876000h",
                    }
                );

            if (error) {
                return NextResponse.json(
                    {
                        error:
                            error.message,
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        /* =====================================================
           UNBAN
        ===================================================== */

        if (
            action ===
            "unban"
        ) {
            const {
                error,
            } =
                await supabaseAdmin.auth.admin.updateUserById(
                    studentId,
                    {
                        ban_duration:
                            "none",
                    }
                );

            if (error) {
                return NextResponse.json(
                    {
                        error:
                            error.message,
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        /* =====================================================
           DELETE
        ===================================================== */

        if (
            action ===
            "delete"
        ) {
            const relatedTables = [
                "quiz_results",
                "lesson_progress",
                "progress",
                "student_stats",
            ];

            /*
             * Best-effort cleanup.
             * Auth deletion remains the final operation.
             */
            for (
                const table of
                relatedTables
            ) {
                try {
                    const {
                        error,
                    } =
                        await supabaseAdmin
                            .from(
                                table
                            )
                            .delete()
                            .eq(
                                "user_id",
                                studentId
                            );

                    if (error) {
                        console.error(
                            `DELETE ${table} ERROR:`,
                            error
                        );
                    }
                } catch (
                error
                ) {
                    console.error(
                        `DELETE ${table} EXCEPTION:`,
                        error
                    );
                }
            }

            const {
                error:
                profileDeleteError,
            } =
                await supabaseAdmin
                    .from(
                        "users"
                    )
                    .delete()
                    .eq(
                        "id",
                        studentId
                    );

            if (
                profileDeleteError
            ) {
                return NextResponse.json(
                    {
                        error:
                            profileDeleteError.message,
                    },
                    {
                        status: 400,
                    }
                );
            }

            const {
                error:
                authDeleteError,
            } =
                await supabaseAdmin.auth.admin.deleteUser(
                    studentId
                );

            if (
                authDeleteError
            ) {
                return NextResponse.json(
                    {
                        error:
                            authDeleteError.message,
                    },
                    {
                        status: 400,
                    }
                );
            }

            return NextResponse.json({
                success: true,
                message:
                    "Student deleted successfully.",
                student_id:
                    studentId,
            });
        }

        /* =====================================================
           LOAD UPDATED DATA
        ===================================================== */

        const updatedStudent =
            await loadStudent(
                studentId
            );

        if (!updatedStudent) {
            return NextResponse.json(
                {
                    error:
                        "Student was updated but could not be loaded again.",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Student updated successfully.",
            student:
                updatedStudent,
        });
    } catch (error) {
        console.error(
            "ADMIN STUDENT PATCH ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update student.",
            },
            {
                status: 500,
            }
        );
    }
}

/* =========================================================
   DELETE /api/admin/students/[id]
========================================================= */

export async function DELETE(
    _request: Request,
    context: RouteContext
) {
    try {
        const admin =
            await verifyAdmin();

        if (!admin.ok) {
            return NextResponse.json(
                {
                    error:
                        admin.error,
                },
                {
                    status:
                        admin.status,
                }
            );
        }

        const {
            id: studentId,
        } =
            await context.params;

        if (!studentId) {
            return NextResponse.json(
                {
                    error:
                        "Student ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            studentId ===
            admin.userId
        ) {
            return NextResponse.json(
                {
                    error:
                        "You cannot delete your own administrator account.",
                },
                {
                    status: 400,
                }
            );
        }

        const target =
            await loadStudent(
                studentId
            );

        if (!target) {
            return NextResponse.json(
                {
                    error:
                        "Student not found.",
                },
                {
                    status: 404,
                }
            );
        }

        if (
            isAdminRole(
                target.role
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Administrator accounts cannot be deleted.",
                },
                {
                    status: 403,
                }
            );
        }

        const relatedTables = [
            "quiz_results",
            "lesson_progress",
            "progress",
            "student_stats",
        ];

        for (
            const table of
            relatedTables
        ) {
            try {
                const {
                    error,
                } =
                    await supabaseAdmin
                        .from(
                            table
                        )
                        .delete()
                        .eq(
                            "user_id",
                            studentId
                        );

                if (error) {
                    console.error(
                        `DELETE ${table} ERROR:`,
                        error
                    );
                }
            } catch (
            error
            ) {
                console.error(
                    `DELETE ${table} EXCEPTION:`,
                    error
                );
            }
        }

        const {
            error:
            profileDeleteError,
        } =
            await supabaseAdmin
                .from("users")
                .delete()
                .eq(
                    "id",
                    studentId
                );

        if (
            profileDeleteError
        ) {
            return NextResponse.json(
                {
                    error:
                        profileDeleteError.message,
                },
                {
                    status: 400,
                }
            );
        }

        const {
            error:
            authDeleteError,
        } =
            await supabaseAdmin.auth.admin.deleteUser(
                studentId
            );

        if (
            authDeleteError
        ) {
            return NextResponse.json(
                {
                    error:
                        authDeleteError.message,
                },
                {
                    status: 400,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Student deleted successfully.",
        });
    } catch (error) {
        console.error(
            "ADMIN STUDENT DELETE ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete student.",
            },
            {
                status: 500,
            }
        );
    }
}