import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";

const cards = [
  {
    href: "/cms/pages",
    label: "Pages",
    description: "Manage site pages and content",
    permission: "pages",
    icon: "▸",
  },
  {
    href: "/cms/events",
    label: "Events",
    description: "Manage events and calendar",
    permission: "events",
    icon: "◈",
  },
  {
    href: "/cms/media",
    label: "Media",
    description: "Media library and assets",
    permission: "media",
    icon: "◇",
  },
  {
    href: "/cms/users",
    label: "Users",
    description: "Users and roles",
    permission: "users",
    icon: "◎",
  },
];

export default async function CmsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/cms/login");
  }

  const visibleCards = cards.filter((card) =>
    session.permissions.some((p) => p.startsWith(`${card.permission}:`))
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-800">
          Welcome, {session.name || session.email}
        </h1>
        <p className="mt-1 text-zinc-600">
          Manage content for End FGM/C Network Africa from this dashboard.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-secondary-dark bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Your role</p>
          <p className="mt-1 text-lg font-semibold capitalize text-primary">
            {session.roles.map((r) => r.name).join(", ")}
          </p>
        </div>
        <div className="rounded-xl border border-secondary-dark bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Permissions</p>
          <p className="mt-1 text-lg font-semibold text-zinc-800">
            {session.permissions.length} granted
          </p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-zinc-800">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex items-start gap-4 rounded-xl border border-secondary-dark bg-white p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-lg text-primary">
              {card.icon}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-zinc-800 group-hover:text-primary">
                {card.label}
              </h3>
              <p className="mt-0.5 text-sm text-zinc-500">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {visibleCards.length === 0 && (
        <div className="rounded-xl border border-secondary-dark bg-secondary/30 p-8 text-center text-zinc-600">
          You don’t have access to any sections yet. Ask an admin to assign a
          role.
        </div>
      )}
    </div>
  );
}
