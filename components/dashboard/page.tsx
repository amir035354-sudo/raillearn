import SubjectCard from "@/components/dashboard/subject-card";
import Navbar from "@/components/dashboard/navbar";
import Sidebar from "@/components/dashboard/sidebar";
import StatCard from "@/components/dashboard/stat-card";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">

      <Sidebar />

      <section className="flex-1">

        <Navbar />

        <div className="p-10">

          <h1 className="text-4xl font-bold">
            Welcome 👋
          </h1>

          <p className="mt-3 text-zinc-400">
            Railway & Modern Transportation Technology
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

            <StatCard
              title="Subjects"
              value="12"
              color="text-purple-500"
            />

            <StatCard
              title="Lessons"
              value="84"
              color="text-green-500"
            />

            <StatCard
              title="Progress"
              value="0%"
              color="text-blue-500"
            />

          </div>

          <div className="mt-14">

            <h2 className="mb-6 text-3xl font-bold">
              Subjects
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

              <SubjectCard
                title="Engineering Mathematics"
                code="MTH101"
                lessons={15}
                progress={80}
              />

              <SubjectCard
                title="Railway Systems"
                code="RST202"
                lessons={21}
                progress={45}
              />

              <SubjectCard
                title="Mechanics"
                code="MEC103"
                lessons={18}
                progress={60}
              />

              <SubjectCard
                title="Electrical Engineering"
                code="ELE105"
                lessons={24}
                progress={20}
              />

              <SubjectCard
                title="Signals"
                code="SIG201"
                lessons={14}
                progress={70}
              />

              <SubjectCard
                title="Programming"
                code="CSC110"
                lessons={28}
                progress={95}
              />

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}