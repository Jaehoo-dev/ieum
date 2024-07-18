import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="ml-20 flex-1 overflow-auto p-4">{children}</main>
    </div>
  );
}
