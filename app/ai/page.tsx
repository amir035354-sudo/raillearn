"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  Copy,
  GraduationCap,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "أهلاً بيك في RailLearn AI 👋\n\nأنا الـAI Tutor بتاعك. أقدر أشرحلك الدروس، أبسطلك أي مفهوم، أعملك ملخص، أو أختبرك في اللي ذاكرته.\n\nاسألني أي حاجة في دراستك وأنا معاك خطوة بخطوة.",
  },
];

const quickActions = [
  {
    icon: BookOpen,
    title: "اشرحلي درس",
    description: "شرح بسيط خطوة بخطوة",
    prompt:
      "اشرحلي الدرس بطريقة بسيطة وخطوة بخطوة.",
  },
  {
    icon: BrainCircuit,
    title: "لخصلي",
    description: "أهم النقاط بسرعة",
    prompt:
      "اعمللي ملخص لأهم النقاط اللي لازم أركز عليها.",
  },
  {
    icon: Target,
    title: "اختبرني",
    description: "اختبار تدريبي سريع",
    prompt:
      "اختبرني في الموضوع ده بأسئلة اختيار من متعدد، وما تقوليش الإجابة غير لما أجاوب.",
  },
  {
    icon: Sparkles,
    title: "بسطها",
    description: "شرح للمبتدئين",
    prompt:
      "بسطلي الموضوع ده جداً واديني أمثلة عليه كأني أول مرة أدرسه.",
  },
];

export default function AIPage() {
  const [messages, setMessages] =
    useState<Message[]>(starterMessages);

  const [input, setInput] = useState("");

  const [sending, setSending] =
    useState(false);

  const [copiedId, setCopiedId] =
    useState<string | null>(null);

  const [streamingMessageId, setStreamingMessageId] =
    useState<string | null>(null);

  const bottomRef =
    useRef<HTMLDivElement | null>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(null);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  // =====================================================
  // NEW CHAT
  // =====================================================

  function newChat() {
    if (sending) return;

    setMessages(starterMessages);
    setInput("");
    setCopiedId(null);
    setStreamingMessageId(null);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }

  // =====================================================
  // CLEAR CHAT
  // =====================================================

  function clearChat() {
    if (sending) return;

    setMessages([]);
    setInput("");
    setCopiedId(null);
    setStreamingMessageId(null);
  }

  // =====================================================
  // MARKDOWN RENDERER
  // =====================================================

  function renderContent(
    content: string
  ) {
    const lines = content.split("\n");

    return (
      <div className="space-y-1">
        {lines.map((line, index) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return (
              <div
                key={index}
                className="h-2"
              />
            );
          }

          // Heading
          if (
            trimmed.startsWith("### ")
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
            trimmed.startsWith("## ")
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
            trimmed.startsWith("# ")
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

          // Bullet
          if (
            trimmed.startsWith("- ") ||
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

          // Numbered list
          if (
            /^\d+\.\s/.test(trimmed)
          ) {
            const match =
              trimmed.match(
                /^(\d+)\.\s(.*)$/
              );

            if (match) {
              return (
                <div
                  key={index}
                  className="flex gap-2 pl-1"
                >
                  <span className="shrink-0 font-bold text-purple-400">
                    {match[1]}.
                  </span>

                  <div className="min-w-0">
                    {formatInline(
                      match[2]
                    )}
                  </div>
                </div>
              );
            }
          }

          return (
            <p key={index}>
              {formatInline(trimmed)}
            </p>
          );
        })}
      </div>
    );
  }

  // =====================================================
  // INLINE FORMAT
  // =====================================================

  function formatInline(
    text: string
  ) {
    const parts = text.split(
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
              className="rounded-md border border-white/[0.08] bg-black/50 px-1.5 py-0.5 font-mono text-[12px] text-purple-300"
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
      // Ignore clipboard errors
    }
  }

  // =====================================================
  // STREAM DISPLAY
  // =====================================================

  async function revealMessage(
    messageId: string,
    fullContent: string
  ) {
    setStreamingMessageId(
      messageId
    );

    const words =
      fullContent.split(/(\s+)/);

    let current = "";

    for (
      let index = 0;
      index < words.length;
      index++
    ) {
      current += words[index];

      setMessages((existing) =>
        existing.map((item) =>
          item.id === messageId
            ? {
                ...item,
                content: current,
              }
            : item
        )
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 12)
      );
    }

    setStreamingMessageId(null);
  }

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  async function sendMessage(
    text?: string
  ) {
    const message = (
      text ?? input
    ).trim();

    if (!message || sending) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    const nextMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const response = await fetch(
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

      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      await revealMessage(
        assistantId,
        data.message
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "حصل خطأ أثناء الاتصال بالـAI.";

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `### حصل خطأ\n\n${errorMessage}`,
        },
      ]);
    } finally {
      setSending(false);
      setStreamingMessageId(null);

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
    if (sending) return;

    const index =
      messages.findIndex(
        (item) =>
          item.id === messageId
      );

    if (index === -1) return;

    const assistantMessage =
      messages[index];

    if (
      assistantMessage.role !==
      "assistant"
    ) {
      return;
    }

    let userMessage:
      | Message
      | undefined;

    for (
      let i = index - 1;
      i >= 0;
      i--
    ) {
      if (
        messages[i].role ===
        "user"
      ) {
        userMessage = messages[i];
        break;
      }
    }

    if (!userMessage) return;

    const history =
      messages.slice(0, index);

    setMessages(history);
    setSending(true);

    try {
      const response = await fetch(
        "/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            messages:
              history.map(
                (item) => ({
                  role: item.role,
                  content:
                    item.content,
                })
              ),
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

      setMessages((current) => [
        ...current,
        {
          id: newId,
          role: "assistant",
          content: "",
        },
      ]);

      await revealMessage(
        newId,
        data.message
      );
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? `### حصل خطأ\n\n${error.message}`
              : "### حصل خطأ\n\nحصل خطأ أثناء إعادة إنشاء الرد.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();
    sendMessage();
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-[-20%] h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[150px]" />

        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-700/10 blur-[150px]" />
      </div>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050507]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-zinc-500 transition hover:border-purple-500/30 hover:text-white"
            >
              <ArrowLeft size={16} />
            </Link>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
                RailLearn Intelligence
              </p>

              <h1 className="text-sm font-black md:text-base">
                AI Tutor
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length >
              1 && (
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
              New Chat
            </button>
          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-[1500px]">
        {/* ================================================= */}
        {/* SIDEBAR */}
        {/* ================================================= */}

        <aside className="hidden w-[270px] shrink-0 border-r border-white/[0.06] p-6 lg:block">
          <div className="sticky top-24">
            <div className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/10 to-transparent p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400">
                <Bot size={24} />
              </div>

              <h2 className="mt-4 text-sm font-black">
                RailLearn AI
              </h2>

              <p className="mt-2 text-[11px] leading-5 text-zinc-500">
                مساعدك الذكي في رحلة دراسة
                تكنولوجيا السكك الحديدية
                والنقل الحديث.
              </p>

              <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                AI Tutor Online
              </div>
            </div>

            <div className="mt-7">
              <p className="mb-3 px-2 text-[8px] font-black uppercase tracking-[0.25em] text-zinc-700">
                Quick Access
              </p>

              <div className="space-y-1">
                <Link
                  href="/subjects"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[10px] font-bold text-zinc-500 transition hover:bg-white/[0.03] hover:text-white"
                >
                  <BookOpen size={15} />
                  Subjects
                </Link>

                <Link
                  href="/quizzes"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[10px] font-bold text-zinc-500 transition hover:bg-white/[0.03] hover:text-white"
                >
                  <Target size={15} />
                  Quizzes
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[10px] font-bold text-zinc-500 transition hover:bg-white/[0.03] hover:text-white"
                >
                  <GraduationCap size={15} />
                  My Learning
                </Link>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-purple-400">
                <Zap size={14} />

                <span className="text-[9px] font-black uppercase tracking-wider">
                  AI Powered
                </span>
              </div>

              <p className="mt-2 text-[10px] leading-5 text-zinc-600">
                اسأل، اتعلم، وراجع دروسك
                باستخدام RailLearn AI.
              </p>
            </div>
          </div>
        </aside>

        {/* ================================================= */}
        {/* CHAT AREA */}
        {/* ================================================= */}

        <section className="flex min-w-0 flex-1 flex-col">
          {/* CHAT HEADER */}

          <div className="border-b border-white/[0.06] px-4 py-5 md:px-8">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 shadow-lg shadow-purple-900/20">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-black">
                    How can I help you?
                  </h2>

                  <p className="mt-1 text-[10px] text-zinc-600">
                    اسأل عن أي حاجة في دراستك.
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5 text-[8px] font-bold text-emerald-400 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Online
              </div>
            </div>
          </div>

          {/* MESSAGES */}

          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="mx-auto max-w-4xl space-y-7">
              {messages.map(
                (message, index) => {
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
                      key={message.id}
                      className={`group flex gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-500/10 bg-purple-500/10 text-purple-400">
                          <Bot size={17} />
                        </div>
                      )}

                      <div
                        className={`flex max-w-[90%] flex-col md:max-w-[78%] ${
                          isUser
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3.5 text-sm leading-7 ${
                            isUser
                              ? "bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/10"
                              : "border border-white/[0.06] bg-[#0b0c11] text-zinc-300"
                          }`}
                        >
                          {isUser ? (
                            <div className="whitespace-pre-line">
                              {message.content}
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
                                  copyMessage(
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
                                    regenerate(
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
                          <User size={17} />
                        </div>
                      )}
                    </div>
                  );
                }
              )}

              {/* TYPING */}

              {sending &&
                !streamingMessageId && (
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                      <Bot size={17} />
                    </div>

                    <div className="rounded-2xl border border-white/[0.06] bg-[#0b0c11] px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400" />

                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:120ms]" />

                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:240ms]" />
                      </div>
                    </div>
                  </div>
                )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* ================================================= */}
          {/* QUICK ACTIONS */}
          {/* ================================================= */}

          {messages.length === 1 && (
            <div className="px-4 pb-4 md:px-8">
              <div className="mx-auto max-w-4xl">
                <p className="mb-3 text-[8px] font-black uppercase tracking-[0.25em] text-zinc-700">
                  Try asking
                </p>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
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
                            sendMessage(
                              action.prompt
                            )
                          }
                          disabled={
                            sending
                          }
                          className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:-translate-y-0.5 hover:border-purple-500/20 hover:bg-purple-500/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Icon
                            size={17}
                            className="text-purple-400"
                          />

                          <p className="mt-3 text-[10px] font-black text-zinc-300">
                            {action.title}
                          </p>

                          <p className="mt-1 text-[9px] leading-4 text-zinc-700 transition group-hover:text-zinc-500">
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
            </div>
          )}

          {/* ================================================= */}
          {/* INPUT */}
          {/* ================================================= */}

          <div className="border-t border-white/[0.06] bg-[#050507] px-4 py-4 md:px-8">
            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-4xl"
            >
              <div className="relative flex items-end rounded-2xl border border-white/[0.08] bg-[#0a0b10] p-2 shadow-2xl shadow-black/20 transition focus-within:border-purple-500/30 focus-within:shadow-purple-950/10">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                        "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      handleSubmit(
                        event as unknown as React.FormEvent
                      );
                    }
                  }}
                  rows={1}
                  disabled={sending}
                  placeholder="Ask your AI Tutor anything..."
                  className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-700 disabled:opacity-50"
                />

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
                  RailLearn AI can make
                  mistakes. Check important
                  information.
                </p>

                <div className="hidden items-center gap-1 text-[8px] text-zinc-800 sm:flex">
                  <Zap size={10} />
                  Powered by AI
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}