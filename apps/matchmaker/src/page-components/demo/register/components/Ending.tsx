import Link from "next/link";

interface Props {
  targetUrl: string;
}

export function Ending({ targetUrl }: Props) {
  return (
    <div className="flex w-full flex-col">
      <img
        src="/heart.webp"
        alt="안녕하세요"
        className="h-2/5 w-full object-cover object-center"
      />
      <div className="mt-2 flex w-full flex-col gap-8 p-8">
        <div className="flex flex-col gap-6">
          <h1 className="text-lg font-medium text-gray-800">
            설문을 완료했습니다.
          </h1>
          <p className="text-gray-700">
            더 꼼꼼한 설문을 기반으로 이상형을 만나보시는 건 어떨까요?
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href={targetUrl}
            className="rounded-lg bg-primary-500 py-2 text-center text-lg text-white hover:bg-primary-700"
          >
            소개받으러 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
