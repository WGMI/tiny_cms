import type { Metadata } from "next";
import { getSession } from "@/lib/auth/get-session";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";

export const metadata: Metadata = {
  title: "CMS | End FGM/C Network Africa",
  description: "Content management for End FGM Africa",
};

export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-beige-bg">
      {session ? (
        <>
          <Sidebar />
          <div className="pl-56">
            <Header
              email={session.email}
              roles={session.roles.map((r) => r.name)}
            />
            <main className="min-h-[calc(100vh-3.5rem)] p-6">{children}</main>
          </div>
        </>
      ) : (
        <main className="min-h-screen">{children}</main>
      )}
    </div>
  );
}
