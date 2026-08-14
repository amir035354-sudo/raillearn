import { NextResponse } from "next/server";
import {
    getSupabaseServerClient,
} from "@/lib/supabase/auth";
import {
    completeLessonForStudent,
} from "@/lib/student/activity";

export const dynamic = "force-dynamic";

export async function POST(
    request: Request
) {
    try {
        const supabase =
            await getSupabaseServerClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
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

        const body =
            await request.json();

        const lessonId =
            typeof body?.lessonId ===
                "string"
                ? body.lessonId
                : "";

        if (!lessonId) {
            return NextResponse.json(
                {
                    error:
                        "lessonId is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const result =
            await completeLessonForStudent(
                user.id,
                lessonId
            );

        return NextResponse.json(result);
    } catch (error) {
        console.error(
            "LESSON COMPLETE ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to complete lesson.",
            },
            {
                status: 500,
            }
        );
    }
}