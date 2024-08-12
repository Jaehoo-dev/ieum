interface Props {
  onNext: () => void;
}

export function Welcome({ onNext }: Props) {
  return (
    <div className="flex w-full flex-col">
      <img
        src="/hello.jpg"
        alt="안녕하세요"
        className="h-2/5 w-full object-cover object-center"
      />
      <div className="mt-2 flex w-full flex-col gap-8 p-8">
        <div className="flex flex-col gap-6">
          <h1 className="text-xl font-medium text-gray-800">
            안녕하세요! 이 설문은 이음💘 설문 체험판으로, 실제 설문의
            일부입니다.
          </h1>
          <h2 className="text-lg text-gray-700">
            개인을 특정할 수 있는 문항은 없으며, 답변을 저장하지도 않으니 편하게
            둘러보세요. 😊
          </h2>
        </div>
        <button
          onClick={onNext}
          className="w-full rounded-lg bg-primary-500 px-4 py-2 text-lg font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
        >
          다음
        </button>
      </div>
    </div>
  );
}
