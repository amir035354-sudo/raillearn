export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-purple-950 flex items-center justify-center p-6">
      {children}
    </main>
  );
}