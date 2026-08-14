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
// GET CONVERSATION
// =====================================================

export async function GET(
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
            error: authError,
        } = await supabase.auth.getUser();

        if (
            authError ||
            !user
        ) {
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

        const {
            data: conversation,
            error: conversationError,
        } =
            await supabaseAdmin
                .from(
                    "ai_conversations"
                )
                .select(
                    "id, title, created_at, updated_at"
                )
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
                        "Failed to load conversation.",
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
            data: messages,
            error: messagesError,
        } =
            await supabaseAdmin
                .from(
                    "ai_messages"
                )
                .select(
                    "id, role, content, created_at"
                )
                .eq(
                    "conversation_id",
                    conversationId
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            true,
                    }
                );

        if (
            messagesError
        ) {
            console.error(
                messagesError
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to load messages.",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            conversation,
            messages:
                messages ?? [],
        });
    } catch (error) {
        console.error(
            "OPEN CONVERSATION ERROR:",
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


// =====================================================
// DELETE CONVERSATION
// =====================================================

export async function DELETE(
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
        } = await supabase.auth.getUser();

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

        const {
            error,
        } =
            await supabaseAdmin
                .from(
                    "ai_conversations"
                )
                .delete()
                .eq(
                    "id",
                    conversationId
                )
                .eq(
                    "user_id",
                    user.id
                );

        if (error) {
            console.error(
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to delete conversation.",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            success:
                true,
        });
    } catch (error) {
        console.error(
            "DELETE CONVERSATION ERROR:",
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