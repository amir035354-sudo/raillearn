import Link from "next/link";

const lessons = [
  {
    id: 1,
    title: "Introduction to Engineering Mathematics",
    duration: "25 min",
    completed: true,
  },
  {
    id: 2,
    title: "Functions and Their Graphs",
    duration: "30 min",
    completed: true,
  },
  {
    id: 3,
    title: "Limits and Continuity",
    duration: "35 min",
    completed: false,
  },
  {
    id: 4,
    title: "Differentiation",
    duration: "40 min",
    completed: false,
  },
  {
    id: 5,
    title: "Applications of Derivatives",
    duration: "35 min",
    completed: false,
  },
];

export default function MathematicsPage() {
  const completed = lessons.filter(
    (lesson) => lesson.completed
  ).length;

  const progress = Math.round(
    (completed / lessons.length) * 100
  );

  return (
    <main className="min-h-screen bg-zinc-950 p-10 text-white">

      <Link
        href="/subjects"
        className="text-sm text-purple-400 hover:text-purple-300"
      >
        ← Back to Subjects
      </Link>

      <div className="mt-8">

        <p className="text-sm font-semibold text-purple-400">
          MTH101
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Engineering Mathematics
        </h1>

        <p className="mt-3 text-zinc-400">
          Engineering mathematics concepts and applications.
        </p>

      </div>

      {/* Progress */}
      <div className="mt-10 rounded-3xl bg-zinc-900 p-6">

        <div className="flex justify-between">

          <div>
            <p className="text-zinc-400">
              Course Progress
            </p>

            <p className="mt-2 text-3xl font-bold">
              {progress}%
            </p>
          </div>

          <div className="text-right">
            <p className="text-zinc-400">
              Lessons
            </p>

            <p className="mt-2 text-3xl font-bold">
              {completed}/{lessons.length}
            </p>
          </div>

        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-700">
          <div
            className="h-full rounded-full bg-purple-600"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>

      {/* Lessons */}
      <div className="mt-10">

        <h2 className="mb-6 text-3xl font-bold">
          Lessons
        </h2>

        <div className="space-y-4">

          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between rounded-2xl bg-zinc-900 p-5 transition hover:bg-zinc-800"
            >

              <div>
                <p className="text-lg font-semibold">
                  {lesson.id}. {lesson.title}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  {lesson.duration}
                </p>
              </div>

              {lesson.completed ? (
                <span className="rounded-xl bg-green-500/10 px-4 py-2 text-sm text-green-400">
                  Completed
                </span>
              ) : (
                <Link
  href={`/subjects/mathematics/lesson-${lesson.id}`}
  className="rounded-xl bg-purple-600 px-5 py-2 font-semibold transition hover:bg-purple-700"
>
  Start Lesson
</Link>
              )}

            </div>
          ))}

        </div>

      </div>

    </main>
  );
}