import type { HTMLAttributes } from "react";
import type { Metadata } from "next";
import Image from "next/image";

import cafeImage from "../../public/karl-fredrickson-TYIzeCiZ_60-unsplash.jpg";
import { PlatformMergedDownloadButton } from "./_components/PlatformMergedDownloadButton";

export const metadata: Metadata = {
  title: "분위기 좋은 카페 찾기, 플랫화이트",
  description: "취향에 딱 맞는 카페를 찾으세요",
  keywords: [
    "카페",
    "커피",
    "스타벅스",
    "데이트",
    "핫플",
    "아메리카노",
    "카페라떼",
    "드립커피",
    "콜드브루",
    "에스프레소",
    "스페셜티 커피",
    "분위기 좋은 카페",
  ],
};

export default function Home() {
  return (
    <div className="relative h-screen w-screen">
      <Image
        src={cafeImage}
        alt="카페 이미지"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
      />
      <div className="absolute left-0 top-0 h-full w-full bg-black bg-opacity-30" />
      <Wrapper>
        <Title />
        <CatchPhrase />
        <PlatformMergedDownloadButton />
      </Wrapper>
    </div>
  );
}

type WrapperProps = HTMLAttributes<HTMLDivElement>;

function Wrapper(props: WrapperProps) {
  return (
    <div
      className="relative mx-auto h-full p-10 sm:p-14 md:max-w-3xl"
      {...props}
    />
  );
}

function Title() {
  return (
    <h1 className="py-4 text-3xl font-bold text-white sm:text-4xl">
      플랫화이트
    </h1>
  );
}

function CatchPhrase() {
  const variant = Math.random() > 0.5 ? "A" : "B";

  return (
    <div className="mt-8 font-bold text-white">
      <div className="sm:hidden">
        <p className="text-6xl leading-tight">
          {variant === "A" ? (
            <>
              분위기
              <br />
              좋은
            </>
          ) : (
            <>
              취향에
              <br />딱 맞는
            </>
          )}
          <br />
          카페 찾기
        </p>
      </div>
      <div className="hidden sm:block">
        <p className="text-7xl leading-tight">
          {variant === "A" ? "분위기 좋은" : "취향에 딱 맞는"}
          <br />
          카페를 찾으세요
        </p>
      </div>
    </div>
  );
}
