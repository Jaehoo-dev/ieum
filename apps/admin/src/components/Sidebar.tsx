import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

export function Sidebar() {
  const router = useRouter();

  return (
    <aside className="fixed bottom-0 left-0 top-0 flex h-screen w-40 flex-col justify-between  overflow-auto bg-gray-100 p-4">
      <div className="flex flex-col gap-4">
        <Link href="/basic/members" className="text-blue-600 hover:underline">
          베이직 회원 목록
        </Link>
        <Link
          href="/basic/members/search"
          className="text-blue-600 hover:underline"
        >
          베이직 회원 검색
        </Link>
        <Link href="/basic/matches" className="text-blue-600 hover:underline">
          베이직 매칭 이력
        </Link>
        <Link
          href="/basic/members/create"
          className="text-blue-600 hover:underline"
        >
          베이직 회원 생성
        </Link>
        <hr />
        <Link href="/blind/members" className="text-blue-600 hover:underline">
          블라인드 회원 목록
        </Link>
        <Link href="/blind/matches" className="text-blue-600 hover:underline">
          블라인드 매칭 이력
        </Link>
        <Link href="/blind/create" className="text-blue-600 hover:underline">
          블라인드 회원 생성
        </Link>
      </div>
      <button
        className="w-full rounded bg-gray-300 py-2 text-gray-900"
        onClick={async () => {
          await signOut();
          void router.push("/login");
        }}
      >
        로그아웃
      </button>
    </aside>
  );
}
