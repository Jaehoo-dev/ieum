import Link from "next/link";

export function BlogLink() {
  return (
    <Link
      href={DEFAULT_BLOG_URL}
      className="text-lg text-gray-500 underline hover:text-gray-700"
      target="_blank"
      rel="noopener"
    >
      소개팅 꿀팁 보러 가기
    </Link>
  );
}

export const DEFAULT_BLOG_URL =
  "https://m.blog.naver.com/ieum-love/223459288593";
