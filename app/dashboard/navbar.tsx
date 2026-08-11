import { Bell, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-8 py-5">

      <div className="relative w-[400px]">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          size={18}
        />

        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-11 pr-4 outline-none focus:border-purple-500"
        />
      </div>

      <div className="flex items-center gap-5">

        <button className="rounded-xl bg-zinc-900 p-3 hover:bg-zinc-800 transition">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/100"
            alt="User"
            className="h-11 w-11 rounded-full"
          />

          <div>
            <h4 className="font-semibold">
              Amir Mohamed
            </h4>

            <p className="text-sm text-zinc-400">
              Student
            </p>
          </div>
        </div>

      </div>

    </header>
  );
}