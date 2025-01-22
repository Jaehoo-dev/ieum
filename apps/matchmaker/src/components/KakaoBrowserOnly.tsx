import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

export function KakaoBrowserOnly({ children, fallback }: Props) {
  const isKakaoBrowser = navigator.userAgent.includes("KAKAOTALK");

  if (!isKakaoBrowser) {
    return fallback;
  }

  return <>{children}</>;
}
