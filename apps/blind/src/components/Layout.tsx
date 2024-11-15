import { useState, type ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import RecentActorsRoundedIcon from "@mui/icons-material/RecentActorsRounded";
import SettingsIcon from "@mui/icons-material/Settings";

import { Sidebar } from "./Sidebar";
import { Spacing } from "./Spacing";

type Width = "sm" | "lg";

interface Props {
  children: ReactNode;
  title: string;
  sidebar?: boolean;
  bottomNav?: boolean;
  width?: Width;
  padding?: boolean;
}

export function Layout({
  children,
  title,
  sidebar = true,
  bottomNav = false,
  width = "sm",
  padding = true,
}: Props) {
  return (
    <>
      <Head>
        <title>{`${title} | 이음`}</title>
      </Head>
      <div
        className={`mx-auto flex min-h-screen ${
          width === "lg" ? "max-w-2xl" : "max-w-lg"
        } flex-col items-center shadow-xl`}
      >
        <Header title={title} width={width} sidebar={sidebar} />
        <main className={`mt-14 w-full ${padding ? "p-6" : ""}`}>
          {children}
        </main>
        {bottomNav ? (
          <>
            <Spacing size={40} />
            <BottomNav width={width} />
          </>
        ) : null}
      </div>
    </>
  );
}

interface HeaderProps {
  title: string;
  width: Width;
  sidebar?: boolean;
}

function Header({ title, width, sidebar = true }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function toggleSidebar() {
    setIsSidebarOpen((prev) => !prev);
  }

  return (
    <>
      <header className="shadow-xs fixed top-0 z-10 flex h-14 w-full items-center justify-center border-b border-b-gray-200 bg-white">
        <div
          className={`relative flex w-full ${
            width === "lg" ? "max-w-2xl" : "max-w-lg"
          } items-center justify-center`}
        >
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

function BottomNav({ width }: { width: Width }) {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 z-10 flex w-full justify-around border-t border-t-gray-200 bg-white p-2 md:px-4">
      <div
        className={`flex w-full ${
          width === "lg" ? "max-w-2xl" : "max-w-lg"
        } items-center justify-center`}
      >
        <NavItem
          to="/members"
          icon={<PeopleAltRoundedIcon />}
          isActive={router.pathname === "/members"}
        />
        <NavItem
          to="/matches"
          icon={<RecentActorsRoundedIcon />}
          isActive={router.pathname === "/matches"}
        />
        <NavItem
          to="/settings"
          icon={<SettingsIcon />}
          isActive={router.pathname === "/settings"}
        />
      </div>
    </nav>
  );
}

function NavItem({
  to,
  icon,
  isActive,
}: {
  to: string;
  icon: ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={to}
      className={`flex-1 py-2 text-center ${
        isActive ? "text-blind-500" : "text-gray-500"
      }`}
    >
      {icon}
    </Link>
  );
}
