import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-beige-bg font-sans">
      <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          End FGM/C Network Africa – CMS
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">
          This is the content management system for the End FGM Africa website (
          <a
            href="https://endfgmafrica.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            endfgmafrica.org
          </a>
          ). Use it to manage pages, events, media, and other site content.
        </p>
        <div className="mt-10">
          <Link
            href="/cms"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Open CMS dashboard
            <span aria-hidden>→</span>
          </Link>
        </div>
        <p className="mt-8 text-sm text-zinc-500">
          You must be logged in to access the dashboard. New users can register from the login page.
        </p>
      </main>
    </div>
  );
}
