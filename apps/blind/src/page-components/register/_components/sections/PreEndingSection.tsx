import Link from "next/link";
import { PRODUCT_URL } from "@ieum/constants";

export function PreEndingSection() {
  return (
    <div className="flex w-full flex-col">
      <img
        src="/heart.webp"
        alt="하트 이미지"
        className="h-2/5 w-full object-cover object-center"
      />
      <div className="mt-2 flex w-full flex-col gap-8 p-8">
        <div className="flex flex-col items-center text-lg font-medium text-gray-700">
          <h1>설문 완료해주셔서 감사합니다.</h1>
          <p>10월 14일에 만나요!</p>
        </div>
        <Link
          href={PRODUCT_URL}
          className="text-center text-primary-500 underline hover:text-primary-700"
          target="blank"
          rel="noopener"
        >
          이음 베이직도 알아보기
        </Link>
      </div>
    </div>
  );
}
