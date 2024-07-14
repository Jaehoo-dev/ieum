import { useState, type ReactNode } from "react";
import Head from "next/head";
import { isEmptyStringOrNil } from "@ieum/utils";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

import { Sidebar } from "./Sidebar";

interface Props {
  children: ReactNode;
  title: string;
}

export function Layout({ children, title }: Props) {
  return (
    <>
      <Head>
        <title>{isEmptyStringOrNil(title) ? "이음" : `${title} | 이음`}</title>
      </Head>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center shadow-xl">
        <Header title={title} />
        <main className="mt-14 w-full p-6">{children}</main>
      </div>
    </>
  );
}

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function toggleSidebar() {
    setIsSidebarOpen((prev) => !prev);
  }

  return (
    <>
      <header className="shadow-xs fixed top-0 z-10 flex h-14 w-full items-center justify-center border-b border-b-gray-200 bg-white">
        <div className="relative flex w-full max-w-lg items-center justify-center">
          <Hamburger onClick={toggleSidebar} />
          <h1 className="text-xl font-semibold text-gray-700">{title}</h1>
        </div>
      </header>
      <Sidebar
        open={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
        }}
      />
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
