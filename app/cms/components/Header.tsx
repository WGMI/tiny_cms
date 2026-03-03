import { LogoutButton } from "./LogoutButton";

interface HeaderProps {
  email: string;
  roles: string[];
}

export function Header({ email, roles }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-secondary-dark bg-beige-bg px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-zinc-800">CMS Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-zinc-700">
          {roles.join(", ")}
        </span>
        <span className="text-sm text-zinc-600">{email}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
