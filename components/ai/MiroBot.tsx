"use client";

import {
  AlertCircle,
  Angry,
  BadgeCheck,
  Bot,
  Brain,
  CheckCircle2,
  CircleAlert,
  Frown,
  Laugh,
  MessageCircle,
  Moon,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

export type MiroMood =
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

type MiroBotProps = {
  mood?: MiroMood;
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  showName?: boolean;
  showStatus?: boolean;
  animate?: boolean;
  className?: string;
};

type MoodConfig = {
  icon: typeof Bot;
  label: string;
  color: string;
  glow: string;
  eyes: string;
  mouth: string;
  animation: string;
};

const moodConfig: Record<MiroMood, MoodConfig> = {
  idle: {
    icon: Bot,
    label: "جاهز",
    color: "text-purple-400",
    glow: "bg-purple-500/10",
    eyes: "•",
    mouth: "‿",
    animation: "animate-[miroFloat_4s_ease-in-out_infinite]",
  },

  welcome: {
    icon: Sparkles,
    label: "أهلاً بيك",
    color: "text-cyan-400",
    glow: "bg-cyan-500/10",
    eyes: "＾",
    mouth: "ᴗ",
    animation: "animate-[miroFloat_3s_ease-in-out_infinite]",
  },

  thinking: {
    icon: Brain,
    label: "بيفكر",
    color: "text-blue-400",
    glow: "bg-blue-500/10",
    eyes: "•",
    mouth: "﹏",
    animation: "animate-[miroFloat_2.5s_ease-in-out_infinite]",
  },

  explaining: {
    icon: MessageCircle,
    label: "بيشرح",
    color: "text-purple-400",
    glow: "bg-purple-500/10",
    eyes: "•",
    mouth: "◡",
    animation: "animate-[miroFloat_3s_ease-in-out_infinite]",
  },

  happy: {
    icon: Sparkles,
    label: "مبسوط",
    color: "text-emerald-400",
    glow: "bg-emerald-500/10",
    eyes: "＾",
    mouth: "ᴗ",
    animation: "animate-[miroBounce_1.8s_ease-in-out_infinite]",
  },

  laughing: {
    icon: Laugh,
    label: "بيضحك",
    color: "text-yellow-400",
    glow: "bg-yellow-500/10",
    eyes: "＾",
    mouth: "ω",
    animation: "animate-[miroBounce_0.8s_ease-in-out_infinite]",
  },

  sad: {
    icon: Frown,
    label: "زعلان",
    color: "text-blue-400",
    glow: "bg-blue-500/10",
    eyes: "•",
    mouth: "︵",
    animation: "animate-[miroFloat_5s_ease-in-out_infinite]",
  },

  angry: {
    icon: Angry,
    label: "غضبان",
    color: "text-red-500",
    glow: "bg-red-500/10",
    eyes: "╳",
    mouth: "︵",
    animation: "animate-[miroWiggle_0.7s_ease-in-out_infinite]",
  },

  nervous: {
    icon: AlertCircle,
    label: "متوتر",
    color: "text-orange-400",
    glow: "bg-orange-500/10",
    eyes: "•",
    mouth: "︿",
    animation: "animate-[miroWiggle_0.8s_ease-in-out_infinite]",
  },

  confused: {
    icon: CircleAlert,
    label: "مش فاهم",
    color: "text-yellow-400",
    glow: "bg-yellow-500/10",
    eyes: "•",
    mouth: "o",
    animation: "animate-[miroWiggle_1.5s_ease-in-out_infinite]",
  },

  correct: {
    icon: CheckCircle2,
    label: "إجابة صح",
    color: "text-green-400",
    glow: "bg-green-500/10",
    eyes: "＾",
    mouth: "ᴗ",
    animation: "animate-[miroBounce_1.2s_ease-in-out_infinite]",
  },

  wrong: {
    icon: Frown,
    label: "نجرب تاني",
    color: "text-orange-400",
    glow: "bg-orange-500/10",
    eyes: "•",
    mouth: "︵",
    animation: "animate-[miroWiggle_1.2s_ease-in-out_infinite]",
  },

  excited: {
    icon: Trophy,
    label: "متحمس",
    color: "text-fuchsia-400",
    glow: "bg-fuchsia-500/10",
    eyes: "★",
    mouth: "ᴗ",
    animation: "animate-[miroBounce_0.9s_ease-in-out_infinite]",
  },

  surprised: {
    icon: CircleAlert,
    label: "متفاجئ",
    color: "text-cyan-400",
    glow: "bg-cyan-500/10",
    eyes: "○",
    mouth: "O",
    animation: "animate-[miroBounce_1s_ease-in-out_infinite]",
  },

  confident: {
    icon: BadgeCheck,
    label: "واثق",
    color: "text-emerald-400",
    glow: "bg-emerald-500/10",
    eyes: "¬",
    mouth: "‿",
    animation: "animate-[miroFloat_3s_ease-in-out_infinite]",
  },

  tired: {
    icon: Moon,
    label: "تعبان",
    color: "text-indigo-400",
    glow: "bg-indigo-500/10",
    eyes: "−",
    mouth: "﹏",
    animation: "animate-[miroFloat_5s_ease-in-out_infinite]",
  },

  frustrated: {
    icon: Frown,
    label: "محبط",
    color: "text-rose-400",
    glow: "bg-rose-500/10",
    eyes: "•",
    mouth: "︶",
    animation: "animate-[miroWiggle_1s_ease-in-out_infinite]",
  },

  funny: {
    icon: Laugh,
    label: "بيهزر",
    color: "text-violet-400",
    glow: "bg-violet-500/10",
    eyes: "¬",
    mouth: "ω",
    animation: "animate-[miroWiggle_1s_ease-in-out_infinite]",
  },
};

const sizeConfig = {
  sm: {
    robot: "h-14 w-14",
    screen: "inset-[14%]",
    face: "text-[17px]",
    gap: "gap-2",
    antenna: "h-2 w-2",
    antennaLine: "h-2.5",
    status: "h-6 w-6",
    statusIcon: 11,
    name: "text-[10px]",
  },

  md: {
    robot: "h-20 w-20",
    screen: "inset-[14%]",
    face: "text-[24px]",
    gap: "gap-3",
    antenna: "h-2.5 w-2.5",
    antennaLine: "h-3",
    status: "h-7 w-7",
    statusIcon: 13,
    name: "text-xs",
  },

  lg: {
    robot: "h-28 w-28",
    screen: "inset-[13%]",
    face: "text-[34px]",
    gap: "gap-4",
    antenna: "h-3 w-3",
    antennaLine: "h-4",
    status: "h-8 w-8",
    statusIcon: 16,
    name: "text-sm",
  },

  xl: {
    robot: "h-40 w-40",
    screen: "inset-[12%]",
    face: "text-[48px]",
    gap: "gap-5",
    antenna: "h-3.5 w-3.5",
    antennaLine: "h-5",
    status: "h-10 w-10",
    statusIcon: 19,
    name: "text-base",
  },
};

export default function MiroBot({
  mood = "idle",
  size = "md",
  message,
  showName = true,
  showStatus = false,
  animate = true,
  className = "",
}: MiroBotProps) {
  const config = moodConfig[mood];
  const sizes = sizeConfig[size];
  const MoodIcon = config.icon;

  return (
    <>
      <style jsx global>{`
        @keyframes miroFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes miroBounce {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-7px) scale(1.03);
          }
        }

        @keyframes miroWiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }

          25% {
            transform: rotate(-3deg);
          }

          75% {
            transform: rotate(3deg);
          }
        }
      `}</style>

      <div
        className={`relative flex flex-col items-center ${className}`}
      >
        {/* Robot */}
        <div
          className={`relative ${
            animate ? config.animation : ""
          }`}
        >
          {/* Glow */}
          <div
            className={`absolute inset-[-25%] -z-10 rounded-full blur-3xl transition-all duration-700 ${config.glow}`}
          />

          {/* Antenna */}
          <div className="absolute left-1/2 top-[-18px] z-20 flex -translate-x-1/2 flex-col items-center">
            <div
              className={`${sizes.antenna} rounded-full bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.9)] ${
                mood === "thinking" || mood === "nervous"
                  ? "animate-pulse"
                  : ""
              }`}
            />

            <div
              className={`${sizes.antennaLine} w-px bg-purple-400/50`}
            />
          </div>

          {/* Head */}
          <div
            className={`relative ${sizes.robot} overflow-hidden rounded-[30%] border border-white/[0.08] bg-gradient-to-br from-[#1b1424] via-[#0c0c13] to-[#050507] shadow-[0_25px_70px_rgba(0,0,0,0.55)] transition-all duration-500`}
          >
            {/* Reflection */}
            <div className="absolute left-[17%] top-[8%] h-[8%] w-[30%] rounded-full bg-white/[0.06] blur-sm" />

            {/* Mood lights */}
            <div
              className={`absolute left-[4%] top-1/2 h-2 w-1 -translate-y-1/2 rounded-full ${config.color.replace(
                "text-",
                "bg-"
              )} opacity-70 shadow-[0_0_10px_currentColor]`}
            />

            <div
              className={`absolute right-[4%] top-1/2 h-2 w-1 -translate-y-1/2 rounded-full ${config.color.replace(
                "text-",
                "bg-"
              )} opacity-70 shadow-[0_0_10px_currentColor]`}
            />

            {/* Face screen */}
            <div
              className={`absolute ${sizes.screen} flex flex-col items-center justify-center overflow-hidden rounded-[25%] border border-purple-400/10 bg-[#020204] shadow-inner shadow-purple-950/40`}
            >
              {/* Scan line */}
              <div className="pointer-events-none absolute left-0 right-0 top-[15%] h-px bg-purple-400/[0.06]" />

              {/* Eyes */}
              <div
                className={`flex ${sizes.gap} ${sizes.face} font-black ${config.color} transition-all duration-500`}
              >
                <span
                  className={`inline-block transition-all duration-300 ${
                    mood === "confused"
                      ? "-rotate-12"
                      : mood === "angry"
                      ? "-rotate-6"
                      : ""
                  }`}
                >
                  {config.eyes}
                </span>

                <span
                  className={`inline-block transition-all duration-300 ${
                    mood === "confused"
                      ? "rotate-12"
                      : mood === "angry"
                      ? "rotate-6"
                      : ""
                  }`}
                >
                  {config.eyes}
                </span>
              </div>

              {/* Mouth */}
              <div
                className={`-mt-1 ${sizes.face} font-black ${config.color} transition-all duration-500`}
              >
                {config.mouth}
              </div>
            </div>

            {/* Bottom indicator */}
            <div className="absolute bottom-[7%] left-1/2 h-1 w-[18%] -translate-x-1/2 rounded-full bg-white/[0.05]" />
          </div>

          {/* Status */}
          {showStatus && (
            <div
              className={`absolute -bottom-2 -right-2 flex ${sizes.status} items-center justify-center rounded-xl border border-white/[0.08] bg-[#0b0b11] shadow-xl ${config.color}`}
              title={config.label}
            >
              <MoodIcon size={sizes.statusIcon} />
            </div>
          )}
        </div>

        {/* Name */}
        {showName && (
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span
                className={`${sizes.name} font-black text-white`}
              >
                Miro
              </span>

              <Zap size={10} className={config.color} />
            </div>

            <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-600">
              RailLearn AI
            </p>

            {showStatus && (
              <p
                className={`mt-1 text-[7px] font-bold ${config.color}`}
              >
                {config.label}
              </p>
            )}
          </div>
        )}

        {/* Speech */}
        {message && (
          <div className="relative mt-5 max-w-[300px] rounded-2xl border border-white/[0.07] bg-[#0b0c11] px-4 py-3 text-center text-xs leading-6 text-zinc-300 shadow-2xl">
            <div className="absolute left-1/2 top-[-5px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t border-white/[0.07] bg-[#0b0c11]" />

            {message}
          </div>
        )}
      </div>
    </>
  );
}