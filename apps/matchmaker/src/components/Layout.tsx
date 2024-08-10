import { useState, type ReactNode } from "react";
import Head from "next/head";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

import { Sidebar } from "./Sidebar";

interface Props {
  children: ReactNode;
  title: string;
  sidebar?: boolean;
  padding?: boolean;
}

export function Layout({
  children,
  title,
  sidebar = true,
  padding = true,
}: Props) {
  return (
    <>
      <Head>
        <title>{`${title} | 이음`}</title>
      </Head>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center shadow-xl">
        <Header title={title} sidebar={sidebar} />
        <main className={`mt-14 w-full ${padding ? "p-6" : ""}`}>
          {children}
        </main>
      </div>
    </>
  );
}

interface HeaderProps {
  title: string;
  sidebar?: boolean;
}

function Header({ title, sidebar = true }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function toggleSidebar() {
    setIsSidebarOpen((prev) => !prev);
  }

  return (
    <>
      <header className="shadow-xs fixed top-0 z-10 flex h-14 w-full items-center justify-center border-b border-b-gray-200 bg-white">
        <div className="relative flex w-full max-w-lg items-center justify-center">
          {sidebar ? <Hamburger onClick={toggleSidebar} /> : null}
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>
      </header>
      {sidebar ? (
        <Sidebar
          open={isSidebarOpen}
          onClose={() => {
            setIsSidebarOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function Hamburger({ onClick }: { onClick: () => void }) {
  return (
    <button className="absolute left-4" onClick={onClick} aria-label="메뉴">
      <MenuRoundedIcon className="text-gray-700" />
    </button>
  );
}
