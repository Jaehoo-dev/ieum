import Link from "next/link";

export function EndingSection() {
  return (
    <div className="flex w-full flex-col">
      <img
        src="/heart.webp"
        alt="하트 이미지"
        className="h-2/5 w-full object-cover object-center"
      />
      <div className="mt-4 flex w-full flex-col gap-8 p-8">
        <div className="flex flex-col gap-6">
          <h1 className="text-center text-lg font-medium text-gray-800">
            회원 가입을 완료했습니다!
          </h1>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="text-center text-blind-500 underline hover:text-blind-700"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
