import { NextResponse } from "next/server";

import {
    getSupabaseServerClient,
} from "@/lib/supabase/auth";

import {
    supabaseAdmin,
} from "@/lib/supabase/admin";


// =====================================================
// GET
// Get user's conversations
// =====================================================

export async function GET() {
    try {
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
            data,
            error,
        } =
            await supabaseAdmin
                .from(
                    "ai_conversations"
                )
                .select(
                    `
          id,
          title,
          created_at,
          updated_at,
          ai_messages (
            content,
            role,
            created_at
          )
        `
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "updated_at",
                    {
                        ascending:
                            false,
                    }
                );

        if (error) {
            console.error(
                "GET CONVERSATIONS:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to load conversations.",
                },
                {
                    status: 500,
                }
            );
        }

        const conversations =
            (data ?? []).map(
                (
                    conversation: any
                ) => {
                    const messages =
                        Array.isArray(
                            conversation.ai_messages
                        )
                            ? conversation.ai_messages
                            : [];

                    const sortedMessages =
                        [
                            ...messages,
                        ].sort(
                            (
                                a,
                                b
                            ) =>
                                new Date(
                                    a.created_at
                                ).getTime() -
                                new Date(
                                    b.created_at
                                ).getTime()
                        );

                    const lastMessage =
                        sortedMessages[
                        sortedMessages.length -
                        1
                        ];

                    return {
                        id:
                            conversation.id,

                        title:
                            conversation.title ||
                            "New Chat",

                        preview:
                            lastMessage?.content ||
                            "",

                        created_at:
                            conversation.created_at,

                        updated_at:
                            conversation.updated_at,
                    };
                }
            );

        return NextResponse.json({
            conversations,
        });
    } catch (error) {
        console.error(
            "CONVERSATIONS GET ERROR:",
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
// POST
// Create conversation
// =====================================================

export async function POST(
    request: Request
) {
    try {
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

        const body =
            await request.json();

        const title =
            typeof body.title ===
                "string"
                ? body.title
                    .trim()
                    .slice(0, 100)
                : "New Chat";

        const {
            data,
            error,
        } =
            await supabaseAdmin
                .from(
                    "ai_conversations"
                )
                .insert({
                    user_id:
                        user.id,

                    title:
                        title ||
                        "New Chat",
                })
                .select(
                    "id, title, created_at, updated_at"
                )
                .single();

        if (error) {
            console.error(
                "CREATE CONVERSATION:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to create conversation.",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json(
            {
                conversation:
                    data,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "CONVERSATIONS POST ERROR:",
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