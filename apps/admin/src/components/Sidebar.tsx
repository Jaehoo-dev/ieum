import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

export function Sidebar() {
  const router = useRouter();

  return (
    <aside className="fixed bottom-0 left-0 top-0 flex h-screen w-20 flex-col justify-between overflow-auto bg-gray-100 p-3">
      <div className="flex flex-col gap-3 text-sm">
        <Link href="/alimtalk" className="text-blue-600 hover:underline">
          알림톡
        </Link>
        <Link href="/messaging" className="text-blue-600 hover:underline">
          문자
        </Link>
        <Link href="/reviews" className="text-blue-600 hover:underline">
          후기
        </Link>
        <hr />
        <h2>베이직</h2>
        <Link
          href="/basic/draft-members"
          className="text-blue-600 hover:underline"
        >
          가입 신청
        </Link>
        <Link href="/basic/members" className="text-blue-600 hover:underline">
          회원 목록
        </Link>
        <Link
          href="/basic/members/search"
          className="text-blue-600 hover:underline"
        >
          회원 검색
        </Link>
        <Link href="/basic/matches" className="text-blue-600 hover:underline">
          매칭 이력
        </Link>
        <Link
          href="/basic/members/create"
          className="text-blue-600 hover:underline"
        >
          회원 생성
        </Link>
        <hr />
        <h2>블라인드</h2>
        <Link
          href="/blind/members/create"
          className="text-blue-600 hover:underline"
        >
          회원 생성
        </Link>
      </div>
      <button
        className="w-full rounded bg-gray-300 py-2 text-xs text-gray-900"
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
