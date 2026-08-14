import { NextResponse } from "next/server";

import {
    getSupabaseServerClient,
} from "@/lib/supabase/auth";

import {
    supabaseAdmin,
} from "@/lib/supabase/admin";


type Params = {
    params: Promise<{
        conversationId: string;
    }>;
};


// =====================================================
// POST MESSAGE
// =====================================================

export async function POST(
    request: Request,
    context: Params
) {
    try {
        const {
            conversationId,
        } = await context.params;

        const supabase =
            await getSupabaseServerClient();

        const {
            data: {
                user,
            },
        } =
            await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                {
                    error:
                        "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const body =
            await request.json();

        const role =
            body.role;

        const content =
            typeof body.content ===
                "string"
                ? body.content.trim()
                : "";

        if (
            role !== "user" &&
            role !== "assistant"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid message role.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!content) {
            return NextResponse.json(
                {
                    error:
                        "Message content is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            content.length >
            20000
        ) {
            return NextResponse.json(
                {
                    error:
                        "Message is too long.",
                },
                {
                    status: 400,
                }
            );
        }

        // التأكد إن المحادثة ملك المستخدم
        const {
            data: conversation,
            error:
            conversationError,
        } =
            await supabaseAdmin
                .from(
                    "ai_conversations"
                )
                .select("id")
                .eq(
                    "id",
                    conversationId
                )
                .eq(
                    "user_id",
                    user.id
                )
                .maybeSingle();

        if (
            conversationError
        ) {
            console.error(
                conversationError
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to verify conversation.",
                },
                {
                    status: 500,
                }
            );
        }

        if (!conversation) {
            return NextResponse.json(
                {
                    error:
                        "Conversation not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const {
            data: message,
            error,
        } =
            await supabaseAdmin
                .from(
                    "ai_messages"
                )
                .insert({
                    conversation_id:
                        conversationId,

                    user_id:
                        user.id,

                    role,

                    content,
                })
                .select(
                    "id, role, content, created_at"
                )
                .single();

        if (error) {
            console.error(
                "SAVE MESSAGE:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to save message.",
                },
                {
                    status: 500,
                }
            );
        }

        // تحديث وقت المحادثة
        await supabaseAdmin
            .from(
                "ai_conversations"
            )
            .update({
                updated_at:
                    new Date().toISOString(),
            })
            .eq(
                "id",
                conversationId
            )
            .eq(
                "user_id",
                user.id
            );

        return NextResponse.json({
            message,
        });
    } catch (error) {
        console.error(
            "MESSAGE API ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Internal server error.",
            },
            {
                status: 500,
            }
        );
    }
}