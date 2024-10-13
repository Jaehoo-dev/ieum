import Link from "next/link";
import { PRODUCT_URL } from "@ieum/constants";

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
            설문 완료해주셔서 감사합니다!
          </h1>
          {/* TODO */}
          {/* <p className="text-gray-800">
            각종 인증을 진행하시면 성사율이 올라갑니다.
          </p> */}
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="text-center text-blind-500 underline hover:text-blind-700"
          >
            홈으로
          </Link>
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
    </div>
  );
}
