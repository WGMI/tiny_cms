"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/cms/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-primary/30 bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
    >
      Log out
    </button>
  );
}
