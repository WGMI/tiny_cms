"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/cms", label: "Dashboard", icon: "◉" },
  { href: "/cms/pages", label: "Pages", icon: "▸" },
  { href: "/cms/events", label: "Events", icon: "◈" },
  { href: "/cms/media", label: "Media", icon: "◇" },
  { href: "/cms/users", label: "Users", icon: "◎" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col bg-sidebar-bg text-sidebar-text">
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        <Link href="/cms" className="flex items-center gap-2 font-semibold">
          <span className="text-primary">●</span>
          <span>End FGM Africa</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/cms" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-text/90 hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <span className="text-base opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <a
          href="https://endfgmafrica.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-text/70 hover:bg-sidebar-hover hover:text-sidebar-text"
        >
          ↗ View site
        </a>
      </div>
    </aside>
  );
}
