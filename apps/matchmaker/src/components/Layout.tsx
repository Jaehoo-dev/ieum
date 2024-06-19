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
        <main className="mt-16 w-full p-6">{children}</main>
      </div>
    </>
  );
}

interface HeaderProps {
  title?: string;
}

function Header({ title }: HeaderProps) {
  return (
    <header className="shadow-xs fixed top-0 z-10 flex h-16 w-full items-center justify-center border-b border-b-gray-200 bg-white">
      <h1 className="text-3xl font-semibold text-gray-700">{title}</h1>
    </header>
  );
}
