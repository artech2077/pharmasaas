import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold">PharmaSaaS Monorepo</h1>
      <p className="text-base text-muted-foreground max-w-xl text-center">
        This scaffolded Next.js application exposes API routes from the App Router, fulfilling the
        repository requirement for an `apps/api` workspace without a standalone package.
      </p>
      <Link className="text-blue-600 underline" href="/api/health">
        API health check
      </Link>
    </main>
  );
}
