import { useFormContext } from "react-hook-form";

import { RegisterForm } from "../../RegisterForm";
import { BackTextButton } from "../BackTextButton";
import { Buttons } from "../Buttons";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function PreSelfSurvey({ onBack, onNext }: Props) {
  const { getValues } = useFormContext<RegisterForm>();
  const name = getValues("name");

  return (
    <div className="flex w-full flex-col">
      <img
        src="/heart.webp"
        alt="하트 이미지"
        className="h-2/5 w-full object-cover object-center"
      />
      <div className="mt-2 flex w-full flex-col gap-6 p-8 text-gray-800">
        <BackTextButton onClick={onBack} />
        <h1 className="text-xl font-medium">{name} 님 반갑습니다!</h1>
        <div className="flex flex-col gap-1 text-lg">
          <p>
            {name} 님과 잘 맞는 분을 찾아드릴 수 있도록 몇 가지 질문을 드릴게요.
          </p>
          <p>
            입력하신 내용을 프로필에 그대로 사용하지 않으니 솔직하고 구체적으로
            답변해주세요.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          별표(*)가 없는 문항은 선택사항으로, 답변을 하지 않으셔도 됩니다.
        </p>
        <div className="mt-2">
          <Buttons onBackClick={onBack} onNextClick={onNext} />
        </div>
      </div>
    </div>
  );
}
