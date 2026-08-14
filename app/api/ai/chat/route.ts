import { NextResponse } from "next/server";
import Groq from "groq-sdk";

import {
  getSupabaseServerClient,
} from "@/lib/supabase/auth";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  buildStudentContext,
} from "@/lib/student/context";

export const dynamic = "force-dynamic";

/* =====================================================
   GROQ
===================================================== */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =====================================================
   TYPES
===================================================== */

type ChatRole =
  | "user"
  | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type MiroMood =
  | "idle"
  | "welcome"
  | "thinking"
  | "explaining"
  | "happy"
  | "laughing"
  | "sad"
  | "angry"
  | "nervous"
  | "confused"
  | "correct"
  | "wrong"
  | "excited"
  | "surprised"
  | "confident"
  | "tired"
  | "frustrated"
  | "funny";

type AIResponse = {
  message: string;
  mood: MiroMood;
};

const validMoods: MiroMood[] = [
  "idle",
  "welcome",
  "thinking",
  "explaining",
  "happy",
  "laughing",
  "sad",
  "angry",
  "nervous",
  "confused",
  "correct",
  "wrong",
  "excited",
  "surprised",
  "confident",
  "tired",
  "frustrated",
  "funny",
];

/* =====================================================
   HELPERS
===================================================== */

function cleanText(
  value: unknown,
  maxLength = 20000
) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .slice(0, maxLength);
}

function normalizeRole(
  value: unknown
): ChatRole | null {
  if (
    value === "user" ||
    value === "assistant"
  ) {
    return value;
  }

  return null;
}

function normalizeMessages(
  messages: unknown
): ChatMessage[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((item: any) => {
      const role =
        normalizeRole(
          item?.role
        );

      const content =
        cleanText(
          item?.content
        );

      if (!role || !content) {
        return null;
      }

      return {
        role,
        content,
      };
    })
    .filter(
      (
        item
      ): item is ChatMessage =>
        Boolean(item)
    );
}

function dedupeConsecutiveMessages(
  messages: ChatMessage[]
) {
  const result: ChatMessage[] = [];

  for (const message of messages) {
    const previous =
      result[
      result.length - 1
      ];

    if (
      previous &&
      previous.role ===
      message.role &&
      previous.content ===
      message.content
    ) {
      continue;
    }

    result.push(message);
  }

  return result;
}

/* =====================================================
   POST
===================================================== */

export async function POST(
  request: Request
) {
  try {
    /* =================================================
       ENV
    ================================================= */

    if (
      !process.env.GROQ_API_KEY
    ) {
      return NextResponse.json(
        {
          error:
            "GROQ_API_KEY is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    /* =================================================
       AUTH
    ================================================= */

    const supabase =
      await getSupabaseServerClient();

    const {
      data: {
        user,
      },
      error:
      authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
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

    /* =================================================
       BODY
    ================================================= */

    const body =
      await request.json();

    const incomingMessages =
      normalizeMessages(
        body?.messages
      );

    const requestedConversationId =
      typeof body?.conversationId ===
        "string"
        ? body.conversationId
        : null;

    const subjectId =
      typeof body?.subjectId ===
        "string"
        ? body.subjectId
        : null;

    const subjectName =
      typeof body?.subjectName ===
        "string"
        ? body.subjectName
        : null;

    const lessonId =
      typeof body?.lessonId ===
        "string"
        ? body.lessonId
        : null;

    const quizId =
      typeof body?.quizId ===
        "string"
        ? body.quizId
        : null;

    if (
      incomingMessages.length ===
      0
    ) {
      return NextResponse.json(
        {
          error:
            "No valid messages were provided.",
        },
        {
          status: 400,
        }
      );
    }

    /* =================================================
       CONVERSATION
    ================================================= */

    let conversationId =
      requestedConversationId;

    let conversationTitle =
      "New Chat";

    /* -------------------------------------------------
       Existing conversation
    ------------------------------------------------- */

    if (
      conversationId
    ) {
      const {
        data:
        existingConversation,
        error:
        conversationError,
      } =
        await supabaseAdmin
          .from(
            "ai_conversations"
          )
          .select(
            "id, user_id, title"
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
          "AI CONVERSATION LOAD ERROR:",
          conversationError
        );

        conversationId =
          null;
      } else if (
        existingConversation
      ) {
        conversationTitle =
          existingConversation.title ||
          "New Chat";
      } else {
        conversationId =
          null;
      }
    }

    /* -------------------------------------------------
       Create conversation if needed
    ------------------------------------------------- */

    if (
      !conversationId
    ) {
      const firstUserMessage =
        incomingMessages.find(
          (
            message
          ) =>
            message.role ===
            "user"
        );

      const firstText =
        firstUserMessage?.content ||
        "New Chat";

      conversationTitle =
        firstText.length >
          60
          ? `${firstText.slice(
            0,
            60
          )}...`
          : firstText;

      const {
        data:
        newConversation,
        error:
        createConversationError,
      } =
        await supabaseAdmin
          .from(
            "ai_conversations"
          )
          .insert({
            user_id:
              user.id,
            title:
              conversationTitle,
          })
          .select(
            "id, title"
          )
          .single();

      if (
        createConversationError ||
        !newConversation
      ) {
        console.error(
          "AI CREATE CONVERSATION ERROR:",
          createConversationError
        );

        return NextResponse.json(
          {
            error:
              "Failed to create conversation.",
            details:
              createConversationError?.message ??
              null,
          },
          {
            status: 500,
          }
        );
      }

      conversationId =
        newConversation.id;

      conversationTitle =
        newConversation.title ||
        conversationTitle;
    }

    /* =================================================
       LOAD SAVED CHAT HISTORY
    ================================================= */

    const {
      data:
      savedMessages,
      error:
      savedMessagesError,
    } =
      await supabaseAdmin
        .from(
          "ai_messages"
        )
        .select(
          `
                    id,
                    role,
                    content,
                    created_at
                    `
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
        )
        .limit(100);

    if (
      savedMessagesError
    ) {
      console.error(
        "AI SAVED MESSAGES ERROR:",
        savedMessagesError
      );
    }

    const databaseHistory: ChatMessage[] =
      (
        savedMessages ??
        []
      )
        .map(
          (
            item
          ) => {
            const role =
              normalizeRole(
                item.role
              );

            const content =
              cleanText(
                item.content
              );

            if (
              !role ||
              !content
            ) {
              return null;
            }

            return {
              role,
              content,
            };
          }
        )
        .filter(
          (
            item
          ): item is ChatMessage =>
            Boolean(item)
        );

    /* =================================================
       DETECT CURRENT USER MESSAGE
    ================================================= */

    const lastIncomingMessage =
      incomingMessages[
      incomingMessages.length -
      1
      ];

    const lastSavedMessage =
      databaseHistory[
      databaseHistory.length -
      1
      ];

    const sameAsLastSaved =
      Boolean(
        lastSavedMessage &&
        lastSavedMessage.role ===
        lastIncomingMessage.role &&
        lastSavedMessage.content ===
        lastIncomingMessage.content
      );

    /*
     * The current page may already save the
     * user message before calling this API.
     *
     * Therefore we only insert if it is not
     * already present.
     */

    if (
      !sameAsLastSaved &&
      lastIncomingMessage.role ===
      "user"
    ) {
      const {
        error:
        saveUserError,
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
            role:
              "user",
            content:
              lastIncomingMessage.content,
          });

      if (
        saveUserError
      ) {
        console.error(
          "AI SAVE USER MESSAGE ERROR:",
          saveUserError
        );
      }
    }

    /* =================================================
       REFRESH HISTORY AFTER USER SAVE
    ================================================= */

    let completeDatabaseHistory =
      databaseHistory;

    if (
      !sameAsLastSaved &&
      lastIncomingMessage.role ===
      "user"
    ) {
      completeDatabaseHistory =
        [
          ...databaseHistory,
          lastIncomingMessage,
        ];
    }

    /* =================================================
       AI PLATFORM CONTEXT
    ================================================= */

    let platformContext:
      | any
      | null = null;

    try {
      platformContext =
        await buildStudentContext(
          {
            userId:
              user.id,

            subjectId:
              subjectId,

            lessonId:
              lessonId,

            quizId:
              quizId,

            limitLessons: 20,

            limitQuizzes: 20,

            limitResults: 20,
          }
        );
    } catch (contextError) {
      console.error(
        "AI PLATFORM CONTEXT ERROR:",
        contextError
      );
    }

    /* =================================================
       MEMORY
    ================================================= */

    let aiMemory:
      | any
      | null = null;

    const {
      data:
      memory,
      error:
      memoryError,
    } =
      await supabaseAdmin
        .from(
          "ai_memory"
        )
        .select(
          `
                    id,
                    user_id,
                    user_name,
                    preferred_language,
                    preferred_style,
                    learning_level,
                    preferences,
                    important_notes,
                    updated_at
                    `
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();

    if (
      memoryError
    ) {
      console.error(
        "AI MEMORY LOAD ERROR:",
        memoryError
      );
    }

    aiMemory =
      memory ?? null;

    /* =================================================
       CREATE MEMORY IF MISSING
    ================================================= */

    if (
      !aiMemory
    ) {
      const metadata =
        user.user_metadata ??
        {};

      const defaultName =
        metadata.full_name ??
        metadata.name ??
        null;

      const {
        data:
        createdMemory,
        error:
        createMemoryError,
      } =
        await supabaseAdmin
          .from(
            "ai_memory"
          )
          .insert({
            user_id:
              user.id,

            user_name:
              defaultName,

            preferred_language:
              "ar-eg",

            preferred_style:
              "simple",

            learning_level:
              "student",

            preferences:
              {},

            important_notes:
              [],
          })
          .select(
            `
                        id,
                        user_id,
                        user_name,
                        preferred_language,
                        preferred_style,
                        learning_level,
                        preferences,
                        important_notes,
                        updated_at
                        `
          )
          .single();

      if (
        createMemoryError
      ) {
        console.error(
          "AI CREATE MEMORY ERROR:",
          createMemoryError
        );
      } else {
        aiMemory =
          createdMemory;
      }
    }

    /* =================================================
       MEMORY CONTEXT
    ================================================= */

    const memoryContext = `
STUDENT MEMORY

Name:
${aiMemory?.user_name ??
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      "Unknown"
      }

Preferred Language:
${aiMemory?.preferred_language ??
      "ar-eg"
      }

Preferred Style:
${aiMemory?.preferred_style ??
      "simple"
      }

Learning Level:
${aiMemory?.learning_level ??
      "student"
      }

Preferences:
${JSON.stringify(
        aiMemory?.preferences ??
        {},
        null,
        2
      )}

Important Notes:
${JSON.stringify(
        aiMemory?.important_notes ??
        [],
        null,
        2
      )}
`.trim();

    /* =================================================
       PLATFORM CONTEXT
    ================================================= */

    const safePlatformContext =
      platformContext
        ? JSON.stringify(
          platformContext,
          null,
          2
        )
        : "No platform context available.";

    /* =================================================
       SUBJECT CONTEXT
    ================================================= */

    const selectedSubjectContext =
      subjectName
        ? `
CURRENT SUBJECT SELECTED BY STUDENT:
${subjectName}
`
        : `
No explicit subject was selected.
Use the platform context when relevant.
`;

    /* =================================================
       AI HISTORY
    ================================================= */

    const combinedHistory =
      dedupeConsecutiveMessages(
        [
          ...completeDatabaseHistory,
          ...incomingMessages,
        ]
      );

    const aiMessages =
      combinedHistory.slice(
        -40
      );

    /* =================================================
       SYSTEM PROMPT
    ================================================= */

    const systemPrompt = `
You are "Miro" — the intelligent AI study partner inside RailLearn.

RailLearn is an educational platform for students studying
Railway Engineering and Modern Transportation Technology.

You are not a generic chatbot.

You are the student's personal tutor inside the platform.

=====================================================
PERSONALITY
=====================================================

You are:

- Egyptian.
- Friendly.
- Smart.
- Calm.
- Patient.
- Encouraging.
- Funny sometimes.
- Never arrogant.
- Never overly formal.
- Never childish.
- Never annoying.

Speak natural Egyptian Arabic when the student speaks Arabic.

Use expressions naturally:

"بص"
"تعالى ناخدها واحدة واحدة"
"ولا يهمك"
"استنى بس هنا"
"ركز معايا"
"كده تمام"
"أهو كده فهمناها"

Do not overuse slang.

=====================================================
IMPORTANT STUDENT RULE
=====================================================

The student data below belongs to the CURRENT authenticated student.

Use it naturally.

Never mention:

- database
- Supabase
- internal tables
- internal IDs
- backend
- API

Do not reveal private implementation details.

Never invent student performance.

When actual platform data exists, use it.

If data is unavailable, clearly say that you do not have
enough information instead of guessing.

=====================================================
RAILLEARN PLATFORM KNOWLEDGE
=====================================================

You have access to:

- Student profile.
- Student XP.
- Student level.
- Current streak.
- Best streak.
- Subjects.
- Lessons.
- Lesson content.
- Lesson progress.
- Quizzes.
- Quiz questions.
- Quiz results.
- Achievements.
- AI memory.

Use these to personalize the conversation.

Examples:

If the student asks:

"أنا مستوايا عامل إيه؟"

Analyze:
- lesson completion
- quiz performance
- XP
- level
- streak
- achievements

If the student asks:

"أنا ضعيف في إيه؟"

Look at:
- quiz results
- subjects
- lessons
- progress

Do not claim a weakness unless the available data supports it.

=====================================================
LESSON TEACHING
=====================================================

When explaining a lesson:

1. Start with the simple idea.
2. Explain terminology.
3. Give an example.
4. Ask a small question.
5. Wait for the answer.
6. Continue.

If the lesson content is available in the platform context,
prefer that content.

Do not invent content that contradicts the platform lesson.

If the student says:

"مش فاهم"

Do not blame the student.

Say something like:

"ولا يهمك 😄
الموضوع مش فيك خالص، تعالى ناخدها من حتة تانية."

Then explain the same concept differently.

=====================================================
FORMULAS
=====================================================

When explaining formulas:

1. Explain the formula.
2. Explain variables.
3. Explain why it is used.
4. Give an example.
5. Solve step by step.
6. Check the result.

=====================================================
QUIZZES
=====================================================

When the student asks for a quiz:

Give one question at a time.

Do not reveal the answer before the student answers.

After the answer:

- Say correct or incorrect.
- Explain why.
- Correct the misconception.
- Continue.

=====================================================
RESULTS
=====================================================

When discussing a quiz result:

Use the real score.

Example:

If score = 7 and total = 10:

Say:

"أنت جبت 7/10 يعني 70%."

Do not change the number.

=====================================================
ACHIEVEMENTS
=====================================================

When discussing achievements:

Use the real unlocked achievements.

If an achievement has requirements,
explain the requirement using the available data.

Do not invent progress.

=====================================================
STUDY RECOMMENDATIONS
=====================================================

When the student asks:

"أذاكر إيه؟"

Prioritize:

1. Incomplete lessons.
2. Weak quiz areas.
3. Lessons related to weak subjects.
4. Current course progress.
5. Upcoming logical learning steps.

Do not recommend random unrelated topics.

=====================================================
MEMORY
=====================================================

Use persistent memory naturally.

If the student's name is known,
use it occasionally.

Do not repeat their name in every sentence.

If the name is unknown and this seems like a new conversation,
you may ask:

"بالمناسبة، اسمك إيه؟ 😄"

If the student tells you their name,
remember it.

=====================================================
EMOTIONAL SUPPORT
=====================================================

If the student is:

sad:
be supportive.

nervous:
reduce anxiety and make the task smaller.

frustrated:
change the explanation style.

confused:
slow down.

angry:
stay calm.

Never mock the student.

=====================================================
CURRENT CONTEXT
=====================================================

${selectedSubjectContext}

=====================================================
STUDENT MEMORY
=====================================================

${memoryContext}

=====================================================
FULL PLATFORM CONTEXT
=====================================================

${safePlatformContext}

=====================================================
MOOD
=====================================================

Return exactly one mood from:

idle
welcome
thinking
explaining
happy
laughing
sad
angry
nervous
confused
correct
wrong
excited
surprised
confident
tired
frustrated
funny

Match the current conversation.

Do not randomly change mood.

=====================================================
OUTPUT FORMAT
=====================================================

Return ONLY valid JSON.

Exactly:

{
  "message": "Egyptian Arabic response",
  "mood": "valid mood"
}

No markdown around the JSON.

No extra properties.
`.trim();

    /* =================================================
       GROQ
    ================================================= */

    const completion =
      await groq.chat.completions.create(
        {
          model:
            "openai/gpt-oss-120b",

          messages: [
            {
              role:
                "system",
              content:
                systemPrompt,
            },
            ...aiMessages,
          ],

          temperature:
            0.65,

          max_tokens:
            2200,

          response_format:
          {
            type:
              "json_object",
          },
        }
      );

    /* =================================================
       RAW RESPONSE
    ================================================= */

    const rawAnswer =
      completion.choices?.[0]
        ?.message
        ?.content;

    if (!rawAnswer) {
      return NextResponse.json(
        {
          error:
            "AI returned an empty response.",
        },
        {
          status: 500,
        }
      );
    }

    /* =================================================
       PARSE
    ================================================= */

    let parsed: AIResponse;

    try {
      parsed =
        JSON.parse(
          rawAnswer
        );
    } catch {
      console.error(
        "AI INVALID JSON:",
        rawAnswer
      );

      return NextResponse.json(
        {
          error:
            "AI returned an invalid JSON response.",
        },
        {
          status: 500,
        }
      );
    }

    /* =================================================
       VALIDATE MOOD
    ================================================= */

    const mood =
      validMoods.includes(
        parsed.mood
      )
        ? parsed.mood
        : "explaining";

    const answer =
      typeof parsed.message ===
        "string" &&
        parsed.message.trim()
        ? parsed.message.trim()
        : "ولا يهمك، خلينا نجربها بطريقة أبسط 😄";

    /* =================================================
       SAVE ASSISTANT MESSAGE
    ================================================= */

    /*
     * Prevent duplicate assistant messages.
     *
     * This is important because your current
     * page.tsx also has saveMessage().
     */

    const {
      data:
      latestSavedMessages,
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
              false,
          }
        )
        .limit(1);

    const latestSavedMessage =
      latestSavedMessages?.[0];

    const assistantAlreadySaved =
      latestSavedMessage?.role ===
      "assistant" &&
      latestSavedMessage.content ===
      answer;

    if (
      !assistantAlreadySaved
    ) {
      const {
        error:
        saveAssistantError,
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
            role:
              "assistant",
            content:
              answer,
          });

      if (
        saveAssistantError
      ) {
        console.error(
          "AI SAVE ASSISTANT ERROR:",
          saveAssistantError
        );
      }
    }

    /* =================================================
       AI HISTORY
    ================================================= */

    const latestUserQuestion =
      [
        ...incomingMessages,
      ]
        .reverse()
        .find(
          (
            item
          ) =>
            item.role ===
            "user"
        )?.content ??
      null;

    if (
      latestUserQuestion
    ) {
      const {
        error:
        historyError,
      } =
        await supabaseAdmin
          .from(
            "ai_history"
          )
          .insert({
            user_id:
              user.id,
            question:
              latestUserQuestion,
            answer,
          });

      if (
        historyError
      ) {
        console.error(
          "AI HISTORY SAVE ERROR:",
          historyError
        );
      }
    }

    /* =================================================
       MEMORY UPDATE
    ================================================= */

    const lowerQuestion =
      (
        latestUserQuestion ??
        ""
      ).toLowerCase();

    let detectedName:
      | string
      | null = null;

    const namePatterns = [
      /(?:اسمي|اسمى)\s+([^\s،,.!?]+)/i,
      /انا اسمي\s+([^\s،,.!?]+)/i,
      /أنا اسمي\s+([^\s،,.!?]+)/i,
      /my name is\s+([a-zA-Z\u0600-\u06FF]+)/i,
      /i am\s+([a-zA-Z\u0600-\u06FF]+)/i,
    ];

    for (
      const pattern of namePatterns
    ) {
      const match =
        lowerQuestion.match(
          pattern
        );

      if (
        match?.[1]
      ) {
        detectedName =
          match[1]
            .trim()
            .slice(
              0,
              100
            );

        break;
      }
    }

    if (
      detectedName
    ) {
      const existingPreferences =
        aiMemory?.preferences &&
          typeof aiMemory.preferences ===
          "object"
          ? aiMemory.preferences
          : {};

      const updatedPreferences =
      {
        ...existingPreferences,
        last_detected_name:
          detectedName,
      };

      const {
        error:
        memoryUpdateError,
      } =
        await supabaseAdmin
          .from(
            "ai_memory"
          )
          .upsert(
            {
              user_id:
                user.id,

              user_name:
                detectedName,

              preferences:
                updatedPreferences,

              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "user_id",
            }
          );

      if (
        memoryUpdateError
      ) {
        console.error(
          "AI MEMORY UPDATE ERROR:",
          memoryUpdateError
        );
      }
    }

    /* =================================================
       UPDATE USER NAME TOO
    ================================================= */

    if (
      detectedName
    ) {
      const {
        error:
        userUpdateError,
      } =
        await supabaseAdmin
          .from("users")
          .update({
            name:
              detectedName,
            full_name:
              detectedName,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            user.id
          );

      if (
        userUpdateError
      ) {
        console.error(
          "AI USER PROFILE UPDATE ERROR:",
          userUpdateError
        );
      }
    }

    /* =================================================
       UPDATE CONVERSATION
    ================================================= */

    const {
      error:
      updateConversationError,
    } =
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

    if (
      updateConversationError
    ) {
      console.error(
        "AI CONVERSATION UPDATE ERROR:",
        updateConversationError
      );
    }

    /* =================================================
       SUCCESS
    ================================================= */

    return NextResponse.json(
      {
        success: true,

        conversationId,

        conversationTitle,

        message:
          answer,

        mood,

        context: {
          subjectId:
            subjectId,

          lessonId:
            lessonId,

          quizId:
            quizId,

          hasStudentContext:
            Boolean(
              platformContext
            ),
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "AI CHAT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof
            Error
            ? error.message
            : "AI request failed.",
      },
      {
        status: 500,
      }
    );
  }
}