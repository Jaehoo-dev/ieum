import type { ComponentProps } from "react";
import Link from "next/link";

type Props = Omit<ComponentProps<typeof Link>, "href">;

export function BlogLink({ target, rel, ...props }: Props) {
  return (
    <Link
      href={DEFAULT_BLOG_URL}
      className="text-lg text-gray-500 underline hover:text-gray-700"
      target={target ?? "_blank"}
      rel={rel ?? "noopener noreferrer"}
      {...props}
    >
      소개팅 꿀팁 보러 가기
    </Link>
  );
}

export const DEFAULT_BLOG_URL =
  "https://m.blog.naver.com/ieum-love/223459288593";
