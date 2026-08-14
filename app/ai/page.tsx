"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Check,
  Copy,
  GraduationCap,
  History,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Sparkles,
  Target,
  Trash2,
  User,
  X,
  Zap,
  Paperclip,
  Mic,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import MiroBot, {
  type MiroMood,
} from "@/components/ai/MiroBot";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatHistoryItem = {
  id: string;
  title: string;
  preview: string;
  createdAt: number;
};

const starterMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: `أهلاً بيك يا صاحبي 👋

أنا ميرو 🤖💜

مساعدك في RailLearn.

هساعدك تفهم مش تحفظ، وهنمشي واحدة واحدة وبراحة 😎`,
  },
];

const quickActions = [
  {
    icon: BookOpen,
    title: "اشرحلي درس",
    description: "شرح بسيط خطوة بخطوة",
    prompt:
      "عايز أبدأ شرح درس. امشي معايا واحدة واحدة.",
  },
  {
    icon: BrainCircuit,
    title: "لخصلي",
    description: "أهم النقاط بسرعة",
    prompt:
      "لخصلي الموضوع ده بطريقة بسيطة ومنظمة.",
  },
  {
    icon: Target,
    title: "اختبرني",
    description: "اختبار تدريبي سريع",
    prompt:
      "اختبرني في الموضوع ده سؤال سؤال، ومتقوليش الإجابة غير لما أجاوب.",
  },
  {
    icon: Sparkles,
    title: "بسطها",
    description: "شرح للمبتدئين",
    prompt:
      "بسطلي الموضوع ده جداً وشرحهولي كأني أول مرة أدرسه.",
  },
  {
    icon: GraduationCap,
    title: "اعمل خطة مذاكرة",
    description: "نظم وقتك وخطتك",
    prompt:
      "اعمللي خطة مذاكرة منظمة للموضوع ده.",
  },
  {
    icon: Zap,
    title: "حل معايا",
    description: "نحل المسألة خطوة خطوة",
    prompt:
      "ساعدني أحل المسألة دي خطوة خطوة من غير ما تديني الإجابة مرة واحدة.",
  },
];

function detectMood(text: string): MiroMood {
  const value = text.toLowerCase().trim();

  if (
    value.includes("هههه") ||
    value.includes("😂") ||
    value.includes("🤣") ||
    value.includes("لول") ||
    value.includes("بهزر") ||
    value.includes("هزار") ||
    value.includes("جامد فشخ") ||
    value.includes("مضحك")
  ) {
    return "laughing";
  }

  if (
    value.includes("غضبان") ||
    value.includes("غاضب") ||
    value.includes("متضايق") ||
    value.includes("متنرفز") ||
    value.includes("عصبي") ||
    value.includes("عصبني") ||
    value.includes("زفت") ||
    value.includes("بكره") ||
    value.includes("كرهت")
  ) {
    return "angry";
  }

  if (
    value.includes("زعلان") ||
    value.includes("حزين") ||
    value.includes("حزينة") ||
    value.includes("مضايق") ||
    value.includes("مخنوق") ||
    value.includes("مكتئب") ||
    value.includes("عيط") ||
    value.includes("بعيط") ||
    value.includes("تعبت من الدنيا") ||
    value.includes("تعبت من الناس")
  ) {
    return "sad";
  }

  if (
    value.includes("متوتر") ||
    value.includes("توتر") ||
    value.includes("خايف") ||
    value.includes("قلقان") ||
    value.includes("قلق") ||
    value.includes("مرعوب") ||
    value.includes("امتحان") ||
    value.includes("الامتحان") ||
    value.includes("مش لاحق")
  ) {
    return "nervous";
  }

  if (
    value.includes("محبط") ||
    value.includes("فشلت") ||
    value.includes("فاشل") ||
    value.includes("مش نافع") ||
    value.includes("مش قادر") ||
    value.includes("مش قادرة") ||
    value.includes("مش عارف اعمل") ||
    value.includes("مش عارف أعمل") ||
    value.includes("مش هعرف")
  ) {
    return "frustrated";
  }

  if (
    value.includes("مش فاهم") ||
    value.includes("مش فاهمة") ||
    value.includes("مش فاهمه") ||
    value.includes("مش واضح") ||
    value.includes("مش واضحة") ||
    value.includes("مش مستوعب") ||
    value.includes("مش مستوعبة") ||
    value.includes("مش فاهم حاجة") ||
    value.includes("حاسس بالغباء") ||
    value.includes("حاسس اني غبي") ||
    value.includes("حاسس إني غبي") ||
    value.includes("حاسه بالغباء") ||
    value.includes("غبي")
  ) {
    return "confused";
  }

  if (
    value.includes("فهمت") ||
    value.includes("تمام") ||
    value.includes("حلو") ||
    value.includes("جامد") ||
    value.includes("شكرا") ||
    value.includes("شكراً") ||
    value.includes("ممتاز") ||
    value.includes("نجحت") ||
    value.includes("نجاح") ||
    value.includes("عرفت")
  ) {
    return "happy";
  }

  if (
    value.includes("يلا") ||
    value.includes("جاهز") ||
    value.includes("جاهزة") ||
    value.includes("اختبرني") ||
    value.includes("نبدأ") ||
    value.includes("ابدأ") ||
    value.includes("هات السؤال") ||
    value.includes("وريني")
  ) {
    return "excited";
  }

  if (
    value.includes("بجد؟") ||
    value.includes("بجد") ||
    value.includes("معقول") ||
    value.includes("ايه ده") ||
    value.includes("إيه ده") ||
    value.includes("مستحيل") ||
    value.includes("واو") ||
    value.includes("wow")
  ) {
    return "surprised";
  }

  if (
    value.includes("تعبان") ||
    value.includes("تعبانة") ||
    value.includes("مرهق") ||
    value.includes("مرهقة") ||
    value.includes("مش قادر أنام") ||
    value.includes("مش قادر انام") ||
    value.includes("نعسان") ||
    value.includes("نعسانة") ||
    value.includes("عايز أنام")
  ) {
    return "tired";
  }

  if (
    value.includes("واثق") ||
    value.includes("متأكد") ||
    value.includes("متأكدة") ||
    value.includes("عارف") ||
    value.includes("أنا فاهم") ||
    value.includes("انا فاهم")
  ) {
    return "confident";
  }

  return "thinking";
}

function detectAssistantMood(
  userText: string,
  assistantText: string
): MiroMood {
  const userMood = detectMood(userText);

  if (
    userMood === "sad" ||
    userMood === "angry" ||
    userMood === "nervous" ||
    userMood === "frustrated"
  ) {
    return "explaining";
  }

  const response = assistantText.toLowerCase();

  if (
    response.includes("أحسنت") ||
    response.includes("ممتاز") ||
    response.includes("صح") ||
    response.includes("بالظبط") ||
    response.includes("بالضبط") ||
    response.includes("برافو")
  ) {
    return "correct";
  }

  if (
    response.includes("غلط") ||
    response.includes("خطأ") ||
    response.includes("مش صحيح")
  ) {
    return "wrong";
  }

  if (
    response.includes("😂") ||
    response.includes("🤣") ||
    response.includes("هههه")
  ) {
    return "laughing";
  }

  if (
    response.includes("مبروك") ||
    response.includes("نجحت") ||
    response.includes("رائع") ||
    response.includes("ممتاز")
  ) {
    return "happy";
  }

  return "explaining";
}

export default function AIPage() {
  const [messages, setMessages] =
    useState<Message[]>(starterMessages);

  const [input, setInput] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [copiedId, setCopiedId] =
    useState<string | null>(null);

  const [
    streamingMessageId,
    setStreamingMessageId,
  ] = useState<string | null>(null);

  const [miroMood, setMiroMood] =
    useState<MiroMood>("welcome");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [history, setHistory] =
    useState<ChatHistoryItem[]>([]);

  const [currentConversationId, setCurrentConversationId] =
    useState<string | null>(null);

  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [loadingConversation, setLoadingConversation] =
    useState(false);

  const messagesRef =
    useRef<HTMLDivElement | null>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(null);

  const hasConversation =
    messages.some(
      (message) =>
        message.role === "user"
    );

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const container =
      messagesRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  // =====================================================
  // LOAD CONVERSATIONS
  // =====================================================

  useEffect(() => {
    void loadConversations();
  }, []);

  async function loadConversations() {
    try {
      setLoadingHistory(true);

      const response =
        await fetch(
          "/api/ai/conversations",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load conversations."
        );
      }

      const data =
        await response.json();

      const conversations =
        Array.isArray(
          data.conversations
        )
          ? data.conversations
          : [];

      setHistory(
        conversations.map(
          (chat: any) => ({
            id: chat.id,
            title:
              chat.title ||
              "New Chat",
            preview:
              chat.preview || "",
            createdAt:
              new Date(
                chat.updated_at ||
                chat.created_at
              ).getTime(),
          })
        )
      );
    } catch (error) {
      console.error(
        "LOAD CONVERSATIONS ERROR:",
        error
      );
    } finally {
      setLoadingHistory(false);
    }
  }

  // =====================================================
  // OPEN CONVERSATION
  // =====================================================

  async function openConversation(
    conversationId: string
  ) {
    if (
      sending ||
      loadingConversation
    ) {
      return;
    }

    try {
      setLoadingConversation(true);

      setSidebarOpen(false);

      const response =
        await fetch(
          `/api/ai/conversations/${conversationId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to open conversation."
        );
      }

      const loadedMessages =
        Array.isArray(
          data.messages
        )
          ? data.messages
          : [];

      const formattedMessages: Message[] =
        loadedMessages.map(
          (message: any) => ({
            id:
              message.id ||
              crypto.randomUUID(),
            role:
              message.role ===
                "user"
                ? "user"
                : "assistant",
            content:
              message.content || "",
          })
        );

      if (
        formattedMessages.length >
        0
      ) {
        setMessages(
          formattedMessages
        );
      } else {
        setMessages(
          starterMessages
        );
      }

      setCurrentConversationId(
        conversationId
      );

      setCopiedId(null);
      setStreamingMessageId(null);
      setMiroMood("welcome");

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error(
        "OPEN CONVERSATION ERROR:",
        error
      );
    } finally {
      setLoadingConversation(false);
    }
  }

  // =====================================================
  // CREATE CONVERSATION
  // =====================================================

  async function createConversation(
    firstMessage?: string
  ) {
    try {
      const response =
        await fetch(
          "/api/ai/conversations",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title:
                firstMessage &&
                  firstMessage.trim()
                  ? firstMessage
                    .trim()
                    .slice(0, 50)
                  : "New Chat",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to create conversation."
        );
      }

      const id =
        data.conversation?.id ||
        data.id;

      if (!id) {
        throw new Error(
          "Conversation ID was not returned."
        );
      }

      setCurrentConversationId(
        id
      );

      await loadConversations();

      return id as string;
    } catch (error) {
      console.error(
        "CREATE CONVERSATION ERROR:",
        error
      );

      return null;
    }
  }

  // =====================================================
  // SAVE MESSAGE
  // =====================================================

  async function saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ) {
    try {
      const response =
        await fetch(
          `/api/ai/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              role,
              content,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to save message."
        );
      }

      return true;
    } catch (error) {
      console.error(
        "SAVE MESSAGE ERROR:",
        error
      );

      return false;
    }
  }

  // =====================================================
  // NEW CHAT
  // =====================================================

  function newChat() {
    if (
      sending ||
      loadingConversation
    ) {
      return;
    }

    setMessages(
      starterMessages
    );

    setCurrentConversationId(
      null
    );

    setInput("");
    setCopiedId(null);
    setStreamingMessageId(null);
    setMiroMood("welcome");
    setSidebarOpen(false);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }

  // =====================================================
  // CLEAR CHAT
  // =====================================================

  function clearChat() {
    if (sending) return;

    setMessages(
      starterMessages
    );

    setInput("");
    setCopiedId(null);
    setStreamingMessageId(null);
    setMiroMood("welcome");
  }

  // =====================================================
  // FORMAT INLINE
  // =====================================================

  function formatInline(
    text: string
  ) {
    const parts =
      text.split(
        /(`[^`]+`|\*\*[^*]+\*\*)/g
      );

    return parts.map(
      (part, index) => {
        if (
          part.startsWith("`") &&
          part.endsWith("`")
        ) {
          return (
            <code
              key={index}
              className="rounded-md border border-white/10 bg-black/50 px-1.5 py-0.5 font-mono text-xs text-purple-300"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        if (
          part.startsWith("**") &&
          part.endsWith("**")
        ) {
          return (
            <strong
              key={index}
              className="font-black text-white"
            >
              {part.slice(2, -2)}
            </strong>
          );
        }

        return (
          <span key={index}>
            {part}
          </span>
        );
      }
    );
  }

  // =====================================================
  // RENDER CONTENT
  // =====================================================

  function renderContent(
    content: string
  ) {
    const lines =
      content.split("\n");

    return (
      <div className="space-y-1">
        {lines.map(
          (line, index) => {
            const trimmed =
              line.trim();

            if (!trimmed) {
              return (
                <div
                  key={index}
                  className="h-2"
                />
              );
            }

            if (
              trimmed.startsWith(
                "### "
              )
            ) {
              return (
                <h3
                  key={index}
                  className="mt-4 text-sm font-black text-white"
                >
                  {formatInline(
                    trimmed.slice(4)
                  )}
                </h3>
              );
            }

            if (
              trimmed.startsWith(
                "## "
              )
            ) {
              return (
                <h2
                  key={index}
                  className="mt-5 text-base font-black text-white"
                >
                  {formatInline(
                    trimmed.slice(3)
                  )}
                </h2>
              );
            }

            if (
              trimmed.startsWith(
                "# "
              )
            ) {
              return (
                <h1
                  key={index}
                  className="mt-5 text-lg font-black text-white"
                >
                  {formatInline(
                    trimmed.slice(2)
                  )}
                </h1>
              );
            }

            if (
              trimmed.startsWith(
                "- "
              ) ||
              trimmed.startsWith("* ")
            ) {
              return (
                <div
                  key={index}
                  className="flex gap-2 pl-1"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />

                  <div className="min-w-0">
                    {formatInline(
                      trimmed.slice(2)
                    )}
                  </div>
                </div>
              );
            }

            const numbered =
              trimmed.match(
                /^(\d+)\.\s(.+)$/
              );

            if (numbered) {
              return (
                <div
                  key={index}
                  className="flex gap-2 pl-1"
                >
                  <span className="shrink-0 font-bold text-purple-400">
                    {numbered[1]}.
                  </span>

                  <div className="min-w-0">
                    {formatInline(
                      numbered[2]
                    )}
                  </div>
                </div>
              );
            }

            return (
              <p key={index}>
                {formatInline(
                  trimmed
                )}
              </p>
            );
          }
        )}
      </div>
    );
  }

  // =====================================================
  // COPY
  // =====================================================

  async function copyMessage(
    message: Message
  ) {
    try {
      await navigator.clipboard.writeText(
        message.content
      );

      setCopiedId(message.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1800);
    } catch {
      // Clipboard unavailable.
    }
  }

  // =====================================================
  // REVEAL
  // =====================================================

  async function revealMessage(
    messageId: string,
    content: string,
    userText: string
  ) {
    setStreamingMessageId(
      messageId
    );

    setMiroMood("thinking");

    const chunks =
      content.split(/(\s+)/);

    let current = "";

    for (const chunk of chunks) {
      current += chunk;

      setMessages(
        (previous) =>
          previous.map(
            (message) =>
              message.id ===
                messageId
                ? {
                  ...message,
                  content:
                    current,
                }
                : message
          )
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            14
          )
      );
    }

    setStreamingMessageId(
      null
    );

    setMiroMood(
      detectAssistantMood(
        userText,
        content
      )
    );
  }

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  async function sendMessage(
    text?: string
  ) {
    const message =
      (text ?? input).trim();

    if (
      !message ||
      sending ||
      loadingConversation
    ) {
      return;
    }

    const userMood =
      detectMood(message);

    setMiroMood(userMood);

    let conversationId =
      currentConversationId;

    // إنشاء Chat حقيقي في Supabase
    // لو مفيش Chat مفتوح.
    if (!conversationId) {
      conversationId =
        await createConversation(
          message
        );

      if (!conversationId) {
        setMiroMood(
          "confused"
        );

        setMessages(
          (previous) => [
            ...previous,
            {
              id:
                crypto.randomUUID(),
              role: "assistant",
              content:
                "مش قادر أعمل محادثة جديدة دلوقتي 😅\n\nاتأكد إن API الخاصة بالمحادثات شغالة.",
            },
          ]
        );

        return;
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    const nextMessages = [
      ...messages.filter(
        (item) =>
          item.id !== "welcome"
      ),
      userMessage,
    ];

    setMessages(
      (previous) => [
        ...previous.filter(
          (item) =>
            item.id !== "welcome"
        ),
        userMessage,
      ]
    );

    setInput("");
    setSending(true);
    setSidebarOpen(false);

    // حفظ رسالة المستخدم
    await saveMessage(
      conversationId,
      "user",
      message
    );

    try {
      const response =
        await fetch(
          "/api/ai/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              messages:
                nextMessages.map(
                  (item) => ({
                    role: item.role,
                    content:
                      item.content,
                  })
                ),

              conversationId,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to get AI response."
        );
      }

      const assistantId =
        crypto.randomUUID();

      setMessages(
        (previous) => [
          ...previous,
          {
            id: assistantId,
            role: "assistant",
            content: "",
          },
        ]
      );

      await revealMessage(
        assistantId,
        data.message,
        message
      );

      // حفظ رد ميرو
      await saveMessage(
        conversationId,
        "assistant",
        data.message
      );

      // تحديث التاريخ
      await loadConversations();
    } catch (error) {
      setMiroMood(
        "confused"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "حصل خطأ أثناء الاتصال بالـAI.";

      setMessages(
        (previous) => [
          ...previous,
          {
            id:
              crypto.randomUUID(),
            role: "assistant",
            content: `### حصلت مشكلة 😅

${errorMessage}

جرب تبعت الرسالة تاني.`,
          },
        ]
      );
    } finally {
      setSending(false);

      setStreamingMessageId(
        null
      );

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }

  // =====================================================
  // REGENERATE
  // =====================================================

  async function regenerate(
    messageId: string
  ) {
    if (
      sending ||
      !currentConversationId
    ) {
      return;
    }

    const index =
      messages.findIndex(
        (message) =>
          message.id ===
          messageId
      );

    if (index === -1) return;

    if (
      messages[index].role !==
      "assistant"
    ) {
      return;
    }

    const historyMessages =
      messages.slice(0, index);

    const lastUserMessage =
      [...historyMessages]
        .reverse()
        .find(
          (message) =>
            message.role ===
            "user"
        );

    setMessages(
      historyMessages
    );

    setSending(true);
    setMiroMood("thinking");

    try {
      const response =
        await fetch(
          "/api/ai/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              messages:
                historyMessages.map(
                  (item) => ({
                    role: item.role,
                    content:
                      item.content,
                  })
                ),

              conversationId:
                currentConversationId,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to regenerate response."
        );
      }

      const newId =
        crypto.randomUUID();

      setMessages(
        (previous) => [
          ...previous,
          {
            id: newId,
            role: "assistant",
            content: "",
          },
        ]
      );

      await revealMessage(
        newId,
        data.message,
        lastUserMessage?.content ??
        ""
      );

      await saveMessage(
        currentConversationId,
        "assistant",
        data.message
      );

      await loadConversations();
    } catch (error) {
      setMiroMood(
        "confused"
      );

      setMessages(
        (previous) => [
          ...previous,
          {
            id:
              crypto.randomUUID(),
            role: "assistant",
            content:
              error instanceof
                Error
                ? `### حصل خطأ 😅

${error.message}`
                : `### حصل خطأ

حصل خطأ أثناء إعادة إنشاء الرد.`,
          },
        ]
      );
    } finally {
      setSending(false);

      setStreamingMessageId(
        null
      );
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    void sendMessage();
  }

  return (
    <main className="relative h-screen overflow-hidden bg-[#050507] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[650px] w-[650px] rounded-full bg-purple-700/[0.10] blur-[170px]" />

        <div className="absolute right-[-15%] top-[25%] h-[600px] w-[600px] rounded-full bg-violet-700/[0.08] blur-[170px]" />

        <div className="absolute bottom-[-25%] left-[30%] h-[550px] w-[550px] rounded-full bg-fuchsia-700/[0.05] blur-[170px]" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[100] flex h-full w-[290px] flex-col border-r border-white/[0.06] bg-[#08080d]/95 p-5 backdrop-blur-2xl transition-transform duration-300 lg:relative lg:z-20 lg:translate-x-0 ${sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
              <Sparkles size={19} />
            </div>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-400">
                RailLearn
              </p>

              <p className="text-sm font-black">
                Miro AI
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-white/[0.04] hover:text-white lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* New Chat */}
        <button
          type="button"
          onClick={newChat}
          disabled={sending}
          className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3 text-xs font-black shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40"
        >
          <Plus size={15} />
          New Chat
        </button>

        {/* Navigation */}
        <div className="mt-7">
          <p className="mb-2 px-2 text-[8px] font-black uppercase tracking-[0.25em] text-zinc-700">
            RailLearn
          </p>

          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-[10px] font-bold text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
            >
              <GraduationCap
                size={15}
              />
              My Learning
            </Link>

            <Link
              href="/subjects"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-[10px] font-bold text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
            >
              <BookOpen size={15} />
              Subjects
            </Link>

            <Link
              href="/quizzes"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-[10px] font-bold text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
            >
              <Target size={15} />
              Quizzes
            </Link>
          </div>
        </div>

        {/* History */}
        <div className="mt-8 min-h-0 flex-1">
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-700">
              Recent Chats
            </p>

            <History
              size={12}
              className="text-zinc-700"
            />
          </div>

          <div className="space-y-1 overflow-y-auto">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw
                  size={15}
                  className="animate-spin text-purple-400"
                />
              </div>
            ) : history.length > 0 ? (
              history.map(
                (chat) => {
                  const active =
                    currentConversationId ===
                    chat.id;

                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() =>
                        void openConversation(
                          chat.id
                        )
                      }
                      disabled={
                        loadingConversation
                      }
                      className={`group relative w-full rounded-xl px-3 py-3 text-left transition ${active
                          ? "border border-purple-500/20 bg-purple-500/[0.08]"
                          : "hover:bg-white/[0.04]"
                        } disabled:cursor-wait disabled:opacity-60`}
                    >
                      {active && (
                        <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-purple-400" />
                      )}

                      <p
                        className={`truncate pr-3 text-[10px] font-bold ${active
                            ? "text-purple-300"
                            : "text-zinc-400"
                          }`}
                      >
                        {chat.title}
                      </p>

                      <p className="mt-1 truncate text-[8px] text-zinc-700">
                        {chat.preview}
                      </p>
                    </button>
                  );
                }
              )
            ) : (
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4 text-center">
                <MessageCircle
                  size={18}
                  className="mx-auto text-zinc-800"
                />

                <p className="mt-2 text-[9px] text-zinc-700">
                  No recent chats
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AI Card */}
        <div className="rounded-2xl border border-purple-500/10 bg-gradient-to-br from-purple-500/[0.08] to-transparent p-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Zap size={13} />

            <span className="text-[8px] font-black uppercase tracking-wider">
              AI Powered
            </span>
          </div>

          <p className="mt-2 text-[9px] leading-5 text-zinc-600">
            ميرو بيساعدك تفهم،
            تراجع، وتحل مش تحفظ
            وخلاص.
          </p>
        </div>
      </aside>

      {/* Main */}
      <section className="absolute inset-0 flex min-w-0 flex-col lg:left-[290px]">
        {/* Top Bar */}
        <header className="relative z-50 h-16 shrink-0 border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between px-4 md:px-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-zinc-500 transition hover:text-white lg:hidden"
              >
                <History size={16} />
              </button>

              <Link
                href="/dashboard"
                className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-zinc-500 transition hover:border-purple-500/30 hover:text-white lg:flex"
              >
                <ArrowLeft size={16} />
              </Link>

              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
                  RailLearn Intelligence
                </p>

                <h1 className="text-sm font-black md:text-base">
                  Miro AI Tutor
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasConversation && (
                <button
                  type="button"
                  onClick={clearChat}
                  disabled={sending}
                  className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[9px] font-black text-zinc-500 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400 disabled:opacity-40 sm:flex"
                >
                  <Trash2 size={13} />
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={newChat}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[9px] font-black text-zinc-400 transition hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-white disabled:opacity-40"
              >
                <Plus size={14} />

                <span className="hidden sm:inline">
                  New Chat
                </span>
              </button>

              <Link
                href="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-zinc-600 transition hover:text-white"
              >
                <Settings size={15} />
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        {!hasConversation ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center px-4 pb-8 pt-8 md:px-8 md:pt-12">
              {/* Miro */}
              <div className="relative flex flex-col items-center text-center">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/[0.12] blur-[90px]" />

                <div className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full border border-purple-500/10 bg-gradient-to-b from-purple-500/[0.08] to-transparent shadow-[0_0_100px_rgba(124,58,237,0.08)]">
                  <div className="absolute inset-3 rounded-full border border-white/[0.04]" />

                  <div className="relative scale-[1.35]">
                    <MiroBot
                      mood={miroMood}
                      size="lg"
                      showName={false}
                      showStatus={false}
                      animate={true}
                    />
                  </div>

                  <div className="absolute bottom-2 right-5 flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-[#09090d]/90 px-2.5 py-1.5 shadow-xl">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                    <span className="text-[7px] font-black text-emerald-400">
                      ONLINE
                    </span>
                  </div>
                </div>

                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-center gap-2">
                    <span className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500/40" />

                    <span className="text-[8px] font-black uppercase tracking-[0.35em] text-purple-400">
                      RailLearn AI
                    </span>

                    <span className="h-px w-8 bg-gradient-to-l from-transparent to-purple-500/40" />
                  </div>

                  <h2 className="text-4xl font-black tracking-tight md:text-5xl">
                    اتكلم مع{" "}
                    <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                      ميرو
                    </span>
                  </h2>

                  <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500 md:text-base">
                    صاحبك في المذاكرة.
                    <br />
                    هيساعدك تفهم، تراجع،
                    وتحل واحدة واحدة
                    وبراحة.
                  </p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-10 w-full">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <Sparkles
                    size={12}
                    className="text-purple-400"
                  />

                  <p className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-600">
                    ابدأ من هنا
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {quickActions.map(
                    (action) => {
                      const Icon =
                        action.icon;

                      return (
                        <button
                          key={
                            action.title
                          }
                          type="button"
                          onClick={() =>
                            void sendMessage(
                              action.prompt
                            )
                          }
                          disabled={
                            sending
                          }
                          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-purple-500/25 hover:bg-purple-500/[0.04] hover:shadow-xl hover:shadow-purple-950/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="absolute right-[-25px] top-[-25px] h-20 w-20 rounded-full bg-purple-500/[0.06] blur-2xl transition group-hover:bg-purple-500/[0.12]" />

                          <div className="relative flex items-start justify-between">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                              <Icon size={17} />
                            </div>

                            <ArrowLeft
                              size={13}
                              className="rotate-180 text-zinc-800 transition group-hover:text-purple-400"
                            />
                          </div>

                          <p className="relative mt-4 text-[11px] font-black text-zinc-300">
                            {
                              action.title
                            }
                          </p>

                          <p className="relative mt-1 text-[9px] leading-4 text-zinc-700">
                            {
                              action.description
                            }
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Welcome input */}
              <div className="mt-8 w-full">
                <form
                  onSubmit={
                    handleSubmit
                  }
                >
                  <div className="group relative flex items-end rounded-2xl border border-white/[0.08] bg-[#0a0b10]/90 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl transition focus-within:border-purple-500/30">
                    <button
                      type="button"
                      disabled
                      className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-700 sm:flex"
                    >
                      <Paperclip
                        size={17}
                      />
                    </button>

                    <textarea
                      ref={
                        textareaRef
                      }
                      value={input}
                      onChange={(
                        event
                      ) =>
                        setInput(
                          event.target
                            .value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                          "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();

                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      rows={1}
                      disabled={sending}
                      placeholder="اسأل ميرو أي حاجة..."
                      className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-700 disabled:opacity-50"
                    />

                    <button
                      type="button"
                      disabled
                      className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-700 sm:flex"
                    >
                      <Mic size={17} />
                    </button>

                    <button
                      type="submit"
                      disabled={
                        !input.trim() ||
                        sending
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {sending ? (
                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Send size={17} />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between px-1">
                    <p className="text-[8px] text-zinc-800">
                      ميرو ممكن يغلط
                      أحيانًا، فراجع
                      المعلومات المهمة.
                    </p>

                    <p className="hidden text-[8px] text-zinc-800 sm:block">
                      Shift + Enter
                      لسطر جديد
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <section className="flex min-h-0 flex-1 flex-col">
            {/* Chat identity */}
            <div className="shrink-0 border-b border-white/[0.04] bg-[#050507]/60 px-4 py-3 backdrop-blur-xl md:px-8">
              <div className="mx-auto flex max-w-4xl items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/10 bg-purple-500/[0.06]">
                  <div className="scale-[0.55]">
                    <MiroBot
                      mood={miroMood}
                      size="lg"
                      showName={false}
                      showStatus={false}
                      animate={true}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-black">
                      ميرو
                    </p>

                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[7px] font-black text-purple-400">
                      AI
                    </span>
                  </div>

                  <p className="text-[8px] text-zinc-700">
                    {streamingMessageId
                      ? "ميرو بيفكر..."
                      : "جاهز يساعدك"}
                  </p>
                </div>

                <div className="ml-auto flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                  <span className="hidden text-[8px] font-bold text-emerald-400 sm:block">
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              className="min-h-0 flex-1 overflow-y-auto px-4 py-7 md:px-8"
            >
              <div className="mx-auto max-w-4xl space-y-7">
                {messages.map(
                  (
                    message,
                    index
                  ) => {
                    const isUser =
                      message.role ===
                      "user";

                    const isStreaming =
                      streamingMessageId ===
                      message.id;

                    const canRegenerate =
                      !isUser &&
                      index > 0 &&
                      !isStreaming &&
                      message.id !==
                      "welcome";

                    return (
                      <div
                        key={
                          message.id
                        }
                        className={`group flex gap-3 ${isUser
                            ? "justify-end"
                            : "justify-start"
                          }`}
                      >
                        {!isUser && (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-500/10 bg-purple-500/10 text-purple-400">
                            <Sparkles
                              size={17}
                            />
                          </div>
                        )}

                        <div
                          className={`flex max-w-[90%] flex-col md:max-w-[78%] ${isUser
                              ? "items-end"
                              : "items-start"
                            }`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-3.5 text-sm leading-7 ${isUser
                                ? "rounded-br-md bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/10"
                                : "rounded-bl-md border border-white/[0.06] bg-[#0b0c11] text-zinc-300"
                              }`}
                          >
                            {isUser ? (
                              <div className="whitespace-pre-line">
                                {
                                  message.content
                                }
                              </div>
                            ) : (
                              renderContent(
                                message.content
                              )
                            )}

                            {isStreaming && (
                              <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded-full bg-purple-400 align-middle" />
                            )}
                          </div>

                          {!isUser &&
                            !isStreaming &&
                            message.content && (
                              <div className="mt-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void copyMessage(
                                      message
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[8px] font-bold text-zinc-700 transition hover:bg-white/[0.04] hover:text-zinc-300"
                                >
                                  {copiedId ===
                                    message.id ? (
                                    <>
                                      <Check
                                        size={
                                          11
                                        }
                                      />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy
                                        size={
                                          11
                                        }
                                      />
                                      Copy
                                    </>
                                  )}
                                </button>

                                {canRegenerate && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void regenerate(
                                        message.id
                                      )
                                    }
                                    disabled={
                                      sending
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[8px] font-bold text-zinc-700 transition hover:bg-white/[0.04] hover:text-zinc-300 disabled:opacity-30"
                                  >
                                    <RefreshCw
                                      size={
                                        11
                                      }
                                    />
                                    Regenerate
                                  </button>
                                )}
                              </div>
                            )}
                        </div>

                        {isUser && (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.05] text-zinc-500">
                            <User
                              size={17}
                            />
                          </div>
                        )}
                      </div>
                    );
                  }
                )}

                {sending &&
                  !streamingMessageId && (
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                        <Sparkles
                          size={17}
                        />
                      </div>

                      <div className="rounded-2xl rounded-bl-md border border-white/[0.06] bg-[#0b0c11] px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400" />

                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:120ms]" />

                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:240ms]" />
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-white/[0.06] bg-[#050507]/95 px-4 py-4 backdrop-blur-xl md:px-8">
              <form
                onSubmit={
                  handleSubmit
                }
                className="mx-auto max-w-4xl"
              >
                <div className="relative flex items-end rounded-2xl border border-white/[0.08] bg-[#0a0b10] p-2 shadow-2xl shadow-black/20 transition focus-within:border-purple-500/30">
                  <button
                    type="button"
                    disabled
                    className="hidden h-11 w-11 shrink-0 items-center justify-center text-zinc-700 sm:flex"
                  >
                    <Paperclip
                      size={17}
                    />
                  </button>

                  <textarea
                    ref={
                      textareaRef
                    }
                    value={input}
                    onChange={(
                      event
                    ) =>
                      setInput(
                        event.target
                          .value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                        "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();

                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    rows={1}
                    disabled={sending}
                    placeholder="اكتب لميرو أي حاجة..."
                    className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-700 disabled:opacity-50"
                  />

                  <button
                    type="button"
                    disabled
                    className="hidden h-11 w-11 shrink-0 items-center justify-center text-zinc-700 sm:flex"
                  >
                    <Mic size={17} />
                  </button>

                  <button
                    type="submit"
                    disabled={
                      !input.trim() ||
                      sending
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {sending ? (
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={17} />
                    )}
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between px-1">
                  <p className="text-[8px] text-zinc-800">
                    ميرو ممكن يغلط
                    أحيانًا، فراجع
                    المعلومات المهمة.
                  </p>

                  <div className="hidden items-center gap-1 text-[8px] text-zinc-800 sm:flex">
                    <Zap size={10} />
                    Powered by AI
                  </div>
                </div>
              </form>
            </div>
          </section>
        )}
      </section>

      {/* Loading conversation overlay */}
      {loadingConversation && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0b0c11]/95 px-5 py-4 shadow-2xl">
            <RefreshCw
              size={17}
              className="animate-spin text-purple-400"
            />

            <span className="text-xs font-bold text-zinc-400">
              بفتح المحادثة...
            </span>
          </div>
        </div>
      )}
    </main>
  );
}