import { NextResponse } from "next/server";

import {
    getSupabaseServerClient,
} from "@/lib/supabase/auth";

import {
    buildStudentContext,
} from "@/lib/student/context";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const supabase =
            await getSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                {
                    error:
                        "You must be logged in.",
                },
                {
                    status: 401,
                }
            );
        }

        const url = new URL(request.url);

        const subjectId =
            url.searchParams.get(
                "subjectId"
            );

        const lessonId =
            url.searchParams.get(
                "lessonId"
            );

        const quizId =
            url.searchParams.get(
                "quizId"
            );

        const context =
            await buildStudentContext({
                userId: user.id,
                subjectId,
                lessonId,
                quizId,
                limitLessons: 50,
                limitQuizzes: 50,
                limitResults: 30,
            });

        return NextResponse.json(
            {
                success: true,
                userId: user.id,
                context,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "STUDENT CONTEXT ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to build student context.",
            },
            {
                status: 500,
            }
        );
    }
}