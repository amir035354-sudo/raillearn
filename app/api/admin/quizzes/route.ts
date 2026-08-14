import { NextResponse } from "next/server";

import {
    getSupabaseServerClient,
} from "@/lib/supabase/auth";

import {
    supabaseAdmin,
} from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type QuizPayload = {
    subject_id?: string | null;
    lesson_id?: string | null;
    title?: string | null;
    total_questions?: number | string | null;
};

/* =========================================================
   HELPERS
========================================================= */

function cleanString(value: unknown) {
    if (typeof value !== "string") {
        return null;
    }

    const valueTrimmed = value.trim();

    return valueTrimmed || null;
}

function numberValue(value: unknown) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(number)
    );
}

function isAdminRole(value: unknown) {
    if (typeof value !== "string") {
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

/* =========================================================
   VERIFY ADMIN
========================================================= */

async function verifyAdmin() {
    const supabase =
        await getSupabaseServerClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        console.error(
            "ADMIN AUTH ERROR:",
            authError
        );
    }

    if (!user) {
        return {
            ok: false as const,
            status: 401,
            error: "Unauthorized.",
        };
    }

    /*
     * First check the users table.
     */
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
            "ADMIN PROFILE ERROR:",
            profileError
        );

        /*
         * Metadata fallback.
         */
        const metadataRole =
            user.user_metadata?.role ??
            user.app_metadata?.role;

        if (
            !isAdminRole(
                metadataRole
            )
        ) {
            return {
                ok: false as const,
                status: 500,
                error:
                    "Failed to verify administrator access.",
            };
        }
    }

    const profileIsAdmin =
        isAdminRole(
            profile?.role
        );

    const metadataIsAdmin =
        isAdminRole(
            user.user_metadata?.role
        ) ||
        isAdminRole(
            user.app_metadata?.role
        );

    if (
        !profileIsAdmin &&
        !metadataIsAdmin
    ) {
        return {
            ok: false as const,
            status: 403,
            error:
                "Forbidden. Administrator access is required.",
        };
    }

    return {
        ok: true as const,
        user,
    };
}

/* =========================================================
   GET
========================================================= */

export async function GET(
    request: Request
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

        const url =
            new URL(request.url);

        const search =
            url.searchParams
                .get("search")
                ?.trim();

        const subjectId =
            url.searchParams.get(
                "subjectId"
            );

        const lessonId =
            url.searchParams.get(
                "lessonId"
            );

        /*
         * IMPORTANT:
         * Only use columns that are already known
         * to exist in the current project.
         */
        let quizQuery =
            supabaseAdmin
                .from("quizzes")
                .select(
                    "id, subject_id, lesson_id, title, total_questions"
                )
                .order(
                    "title",
                    {
                        ascending:
                            true,
                    }
                );

        if (subjectId) {
            quizQuery =
                quizQuery.eq(
                    "subject_id",
                    subjectId
                );
        }

        if (lessonId) {
            quizQuery =
                quizQuery.eq(
                    "lesson_id",
                    lessonId
                );
        }

        if (search) {
            quizQuery =
                quizQuery.ilike(
                    "title",
                    `%${search}%`
                );
        }

        const {
            data: quizzes,
            error: quizError,
        } =
            await quizQuery;

        if (quizError) {
            console.error(
                "ADMIN QUIZZES GET ERROR:",
                quizError
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to load quizzes.",
                    details:
                        quizError.message,
                    code:
                        quizError.code ??
                        null,
                },
                {
                    status: 500,
                }
            );
        }

        const quizList =
            quizzes ?? [];

        /* =====================================================
           SUBJECTS
        ===================================================== */

        const subjectIds: string[] = [];

        for (
            const quiz of
            quizList
        ) {
            if (
                quiz.subject_id &&
                !subjectIds.includes(
                    String(
                        quiz.subject_id
                    )
                )
            ) {
                subjectIds.push(
                    String(
                        quiz.subject_id
                    )
                );
            }
        }

        const subjectLookup:
            Record<
                string,
                {
                    id: string;
                    name: string | null;
                    code: string | null;
                }
            > = {};

        if (
            subjectIds.length >
            0
        ) {
            const {
                data:
                subjectRows,
                error:
                subjectError,
            } =
                await supabaseAdmin
                    .from(
                        "subjects"
                    )
                    .select(
                        "id, name, code"
                    )
                    .in(
                        "id",
                        subjectIds
                    );

            if (
                subjectError
            ) {
                console.error(
                    "ADMIN QUIZ SUBJECT LOOKUP ERROR:",
                    subjectError
                );
            } else {
                for (
                    const subject of
                    subjectRows ??
                    []
                ) {
                    subjectLookup[
                        String(
                            subject.id
                        )
                    ] =
                        subject;
                }
            }
        }

        /* =====================================================
           LESSONS
        ===================================================== */

        const lessonIds: string[] = [];

        for (
            const quiz of
            quizList
        ) {
            if (
                quiz.lesson_id &&
                !lessonIds.includes(
                    String(
                        quiz.lesson_id
                    )
                )
            ) {
                lessonIds.push(
                    String(
                        quiz.lesson_id
                    )
                );
            }
        }

        const lessonLookup:
            Record<
                string,
                {
                    id: string;
                    subject_id:
                    | string
                    | null;
                    title:
                    | string
                    | null;
                }
            > = {};

        if (
            lessonIds.length >
            0
        ) {
            const {
                data:
                lessonRows,
                error:
                lessonError,
            } =
                await supabaseAdmin
                    .from(
                        "lessons"
                    )
                    .select(
                        "id, subject_id, title"
                    )
                    .in(
                        "id",
                        lessonIds
                    );

            if (
                lessonError
            ) {
                console.error(
                    "ADMIN QUIZ LESSON LOOKUP ERROR:",
                    lessonError
                );
            } else {
                for (
                    const lesson of
                    lessonRows ??
                    []
                ) {
                    lessonLookup[
                        String(
                            lesson.id
                        )
                    ] =
                        lesson;
                }
            }
        }

        /* =====================================================
           QUESTION COUNTS
        ===================================================== */

        const questionCountLookup:
            Record<
                string,
                number
            > = {};

        for (
            const quiz of
            quizList
        ) {
            questionCountLookup[
                String(
                    quiz.id
                )
            ] = 0;
        }

        if (
            quizList.length >
            0
        ) {
            const quizIds =
                quizList.map(
                    (
                        quiz
                    ) =>
                        String(
                            quiz.id
                        )
                );

            const {
                data:
                questionRows,
                error:
                questionError,
            } =
                await supabaseAdmin
                    .from(
                        "quiz_questions"
                    )
                    .select(
                        "id, quiz_id"
                    )
                    .in(
                        "quiz_id",
                        quizIds
                    );

            if (
                questionError
            ) {
                console.error(
                    "ADMIN QUIZ QUESTIONS COUNT ERROR:",
                    questionError
                );
            } else {
                for (
                    const row of
                    questionRows ??
                    []
                ) {
                    const key =
                        String(
                            row.quiz_id
                        );

                    questionCountLookup[
                        key
                    ] =
                        (
                            questionCountLookup[
                            key
                            ] ??
                            0
                        ) + 1;
                }
            }
        }

        /* =====================================================
           RESULT COUNTS
        ===================================================== */

        const resultCountLookup:
            Record<
                string,
                number
            > = {};

        for (
            const quiz of
            quizList
        ) {
            resultCountLookup[
                String(
                    quiz.id
                )
            ] = 0;
        }

        if (
            quizList.length >
            0
        ) {
            const quizIds =
                quizList.map(
                    (
                        quiz
                    ) =>
                        String(
                            quiz.id
                        )
                );

            const {
                data:
                resultRows,
                error:
                resultError,
            } =
                await supabaseAdmin
                    .from(
                        "quiz_results"
                    )
                    .select(
                        "id, quiz_id"
                    )
                    .in(
                        "quiz_id",
                        quizIds
                    );

            if (
                resultError
            ) {
                console.error(
                    "ADMIN QUIZ RESULT COUNT ERROR:",
                    resultError
                );
            } else {
                for (
                    const row of
                    resultRows ??
                    []
                ) {
                    const key =
                        String(
                            row.quiz_id
                        );

                    resultCountLookup[
                        key
                    ] =
                        (
                            resultCountLookup[
                            key
                            ] ??
                            0
                        ) + 1;
                }
            }
        }

        /* =====================================================
           FINAL
        ===================================================== */

        const enrichedQuizzes =
            quizList.map(
                (
                    quiz
                ) => {
                    const key =
                        String(
                            quiz.id
                        );

                    return {
                        ...quiz,

                        subject:
                            quiz.subject_id
                                ? subjectLookup[
                                String(
                                    quiz.subject_id
                                )
                                ] ??
                                null
                                : null,

                        lesson:
                            quiz.lesson_id
                                ? lessonLookup[
                                String(
                                    quiz.lesson_id
                                )
                                ] ??
                                null
                                : null,

                        questionCount:
                            questionCountLookup[
                            key
                            ] ??
                            0,

                        resultCount:
                            resultCountLookup[
                            key
                            ] ??
                            0,
                    };
                }
            );

        return NextResponse.json(
            {
                success: true,

                quizzes:
                    enrichedQuizzes,

                count:
                    enrichedQuizzes.length,

                stats: {
                    total:
                        enrichedQuizzes.length,

                    linkedToLessons:
                        enrichedQuizzes.filter(
                            (
                                quiz
                            ) =>
                                Boolean(
                                    quiz.lesson_id
                                )
                        ).length,

                    withQuestions:
                        enrichedQuizzes.filter(
                            (
                                quiz
                            ) =>
                                Number(
                                    quiz.questionCount
                                ) >
                                0
                        ).length,

                    totalQuestions:
                        enrichedQuizzes.reduce(
                            (
                                total,
                                quiz
                            ) =>
                                total +
                                Number(
                                    quiz.questionCount ??
                                    0
                                ),
                            0
                        ),

                    totalAttempts:
                        enrichedQuizzes.reduce(
                            (
                                total,
                                quiz
                            ) =>
                                total +
                                Number(
                                    quiz.resultCount ??
                                    0
                                ),
                            0
                        ),
                },
            }
        );
    } catch (error) {
        console.error(
            "ADMIN QUIZZES GET EXCEPTION:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Internal server error.",
            },
            {
                status: 500,
            }
        );
    }
}

/* =========================================================
   POST
========================================================= */

export async function POST(
    request: Request
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

        const body =
            (await request.json()) as QuizPayload;

        const subjectId =
            cleanString(
                body.subject_id
            );

        const lessonId =
            cleanString(
                body.lesson_id
            );

        const title =
            cleanString(
                body.title
            );

        if (!subjectId) {
            return NextResponse.json(
                {
                    error:
                        "subject_id is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!title) {
            return NextResponse.json(
                {
                    error:
                        "Quiz title is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const {
            data: subject,
            error:
            subjectError,
        } =
            await supabaseAdmin
                .from("subjects")
                .select(
                    "id, name, code"
                )
                .eq(
                    "id",
                    subjectId
                )
                .maybeSingle();

        if (
            subjectError
        ) {
            throw subjectError;
        }

        if (!subject) {
            return NextResponse.json(
                {
                    error:
                        "Subject not found.",
                },
                {
                    status: 404,
                }
            );
        }

        if (lessonId) {
            const {
                data: lesson,
                error:
                lessonError,
            } =
                await supabaseAdmin
                    .from(
                        "lessons"
                    )
                    .select(
                        "id, subject_id"
                    )
                    .eq(
                        "id",
                        lessonId
                    )
                    .maybeSingle();

            if (
                lessonError
            ) {
                throw lessonError;
            }

            if (!lesson) {
                return NextResponse.json(
                    {
                        error:
                            "Lesson not found.",
                    },
                    {
                        status: 404,
                    }
                );
            }

            if (
                lesson.subject_id !==
                subjectId
            ) {
                return NextResponse.json(
                    {
                        error:
                            "The selected lesson does not belong to this subject.",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        const {
            data: quiz,
            error:
            createError,
        } =
            await supabaseAdmin
                .from("quizzes")
                .insert({
                    subject_id:
                        subjectId,

                    lesson_id:
                        lessonId,

                    title,

                    total_questions:
                        numberValue(
                            body.total_questions
                        ),
                })
                .select(
                    "id, subject_id, lesson_id, title, total_questions"
                )
                .single();

        if (
            createError
        ) {
            console.error(
                "ADMIN CREATE QUIZ ERROR:",
                createError
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to create quiz.",
                    details:
                        createError.message,
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,

                message:
                    "Quiz created successfully.",

                quiz,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "ADMIN QUIZ POST EXCEPTION:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create quiz.",
            },
            {
                status: 500,
            }
        );
    }
}

/* =========================================================
   PATCH
========================================================= */

export async function PATCH(
    request: Request
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

        const url =
            new URL(
                request.url
            );

        const id =
            url.searchParams.get(
                "id"
            );

        if (!id) {
            return NextResponse.json(
                {
                    error:
                        "Quiz ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const body =
            (await request.json()) as QuizPayload;

        const updateData:
            Record<
                string,
                unknown
            > = {};

        if (
            Object.prototype.hasOwnProperty.call(
                body,
                "subject_id"
            )
        ) {
            const subjectId =
                cleanString(
                    body.subject_id
                );

            if (!subjectId) {
                return NextResponse.json(
                    {
                        error:
                            "subject_id cannot be empty.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const {
                data:
                subject,
                error:
                subjectError,
            } =
                await supabaseAdmin
                    .from(
                        "subjects"
                    )
                    .select(
                        "id"
                    )
                    .eq(
                        "id",
                        subjectId
                    )
                    .maybeSingle();

            if (
                subjectError
            ) {
                throw subjectError;
            }

            if (!subject) {
                return NextResponse.json(
                    {
                        error:
                            "Subject not found.",
                    },
                    {
                        status: 404,
                    }
                );
            }

            updateData.subject_id =
                subjectId;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                body,
                "lesson_id"
            )
        ) {
            const lessonId =
                cleanString(
                    body.lesson_id
                );

            const targetSubjectId =
                String(
                    body.subject_id ??
                    ""
                );

            if (
                lessonId
            ) {
                const {
                    data:
                    lesson,
                    error:
                    lessonError,
                } =
                    await supabaseAdmin
                        .from(
                            "lessons"
                        )
                        .select(
                            "id, subject_id"
                        )
                        .eq(
                            "id",
                            lessonId
                        )
                        .maybeSingle();

                if (
                    lessonError
                ) {
                    throw lessonError;
                }

                if (!lesson) {
                    return NextResponse.json(
                        {
                            error:
                                "Lesson not found.",
                        },
                        {
                            status: 404,
                        }
                    );
                }

                if (
                    targetSubjectId &&
                    lesson.subject_id !==
                    targetSubjectId
                ) {
                    return NextResponse.json(
                        {
                            error:
                                "The selected lesson does not belong to the selected subject.",
                        },
                        {
                            status: 400,
                        }
                    );
                }
            }

            updateData.lesson_id =
                lessonId;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                body,
                "title"
            )
        ) {
            const title =
                cleanString(
                    body.title
                );

            if (!title) {
                return NextResponse.json(
                    {
                        error:
                            "Quiz title cannot be empty.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            updateData.title =
                title;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                body,
                "total_questions"
            )
        ) {
            updateData.total_questions =
                numberValue(
                    body.total_questions
                );
        }

        const {
            data: quiz,
            error:
            updateError,
        } =
            await supabaseAdmin
                .from("quizzes")
                .update(
                    updateData
                )
                .eq(
                    "id",
                    id
                )
                .select(
                    "id, subject_id, lesson_id, title, total_questions"
                )
                .single();

        if (
            updateError
        ) {
            console.error(
                "ADMIN UPDATE QUIZ ERROR:",
                updateError
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to update quiz.",
                    details:
                        updateError.message,
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,

                message:
                    "Quiz updated successfully.",

                quiz,
            }
        );
    } catch (error) {
        console.error(
            "ADMIN QUIZ PATCH EXCEPTION:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update quiz.",
            },
            {
                status: 500,
            }
        );
    }
}

/* =========================================================
   DELETE
========================================================= */

export async function DELETE(
    request: Request
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

        const url =
            new URL(
                request.url
            );

        const id =
            url.searchParams.get(
                "id"
            );

        const force =
            url.searchParams.get(
                "force"
            ) ===
            "true";

        if (!id) {
            return NextResponse.json(
                {
                    error:
                        "Quiz ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const {
            data: quiz,
            error:
            quizError,
        } =
            await supabaseAdmin
                .from("quizzes")
                .select(
                    "id, title"
                )
                .eq(
                    "id",
                    id
                )
                .maybeSingle();

        if (
            quizError
        ) {
            throw quizError;
        }

        if (!quiz) {
            return NextResponse.json(
                {
                    error:
                        "Quiz not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const {
            count:
            questionCount,
        } =
            await supabaseAdmin
                .from(
                    "quiz_questions"
                )
                .select(
                    "id",
                    {
                        count:
                            "exact",
                        head: true,
                    }
                )
                .eq(
                    "quiz_id",
                    id
                );

        const {
            count:
            resultCount,
        } =
            await supabaseAdmin
                .from(
                    "quiz_results"
                )
                .select(
                    "id",
                    {
                        count:
                            "exact",
                        head: true,
                    }
                )
                .eq(
                    "quiz_id",
                    id
                );

        if (
            !force &&
            (
                Number(
                    questionCount ??
                    0
                ) > 0 ||
                Number(
                    resultCount ??
                    0
                ) > 0
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "This quiz has questions or student results.",
                    requiresConfirmation:
                        true,

                    questionCount:
                        Number(
                            questionCount ??
                            0
                        ),

                    resultCount:
                        Number(
                            resultCount ??
                            0
                        ),
                },
                {
                    status: 409,
                }
            );
        }

        if (force) {
            await supabaseAdmin
                .from(
                    "quiz_results"
                )
                .delete()
                .eq(
                    "quiz_id",
                    id
                );

            await supabaseAdmin
                .from(
                    "quiz_questions"
                )
                .delete()
                .eq(
                    "quiz_id",
                    id
                );
        }

        const {
            error:
            deleteError,
        } =
            await supabaseAdmin
                .from("quizzes")
                .delete()
                .eq(
                    "id",
                    id
                );

        if (
            deleteError
        ) {
            console.error(
                "ADMIN DELETE QUIZ ERROR:",
                deleteError
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to delete quiz.",
                    details:
                        deleteError.message,
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,

                message:
                    "Quiz deleted successfully.",

                deletedQuizId:
                    id,
            }
        );
    } catch (error) {
        console.error(
            "ADMIN QUIZ DELETE EXCEPTION:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete quiz.",
            },
            {
                status: 500,
            }
        );
    }
}