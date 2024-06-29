import type { ReactNode } from "react";
import Head from "next/head";
import { isEmptyStringOrNil } from "@ieum/utils";

interface Props {
  children: ReactNode;
  title?: string;
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
  title?: string;
}

function Header({ title }: HeaderProps) {
  return (
    <header className="shadow-xs fixed top-0 z-10 flex h-14 w-full items-center justify-center border-b border-b-gray-200 bg-white">
      <h1 className="text-2xl font-semibold text-gray-700 md:text-3xl">
        {title}
      </h1>
    </header>
  );
}
