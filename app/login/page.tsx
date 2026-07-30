export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-purple-950">
      <div className="w-full max-w-md rounded-3xl border border-purple-500/30 bg-zinc-900/70 backdrop-blur-xl p-8 shadow-2xl">

        <h1 className="text-5xl font-bold text-center text-purple-500">
          RailLearn
        </h1>

        <p className="mt-3 text-center text-zinc-400">
          Railway and Modern Transportation Technology
        </p>

        <div className="mt-10 space-y-5">

          <input
            type="email"
            placeholder="University Email"
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-4 text-white outline-none focus:border-purple-500 transition"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-4 text-white outline-none focus:border-purple-500 transition"
          />

          <button className="w-full rounded-xl bg-purple-600 py-4 font-bold hover:bg-purple-700 transition">
            Login
          </button>

        </div>

      </div>
    </main>
  );
}