import { useFormContext } from "react-hook-form";

import { RegisterForm } from "../../RegisterForm";
import { BackTextButton } from "../BackTextButton";
import { Buttons } from "../Buttons";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function PreIdealTypeSurvey({ onBack, onNext }: Props) {
  const { getValues } = useFormContext<RegisterForm>();
  const name = getValues("name");

  return (
    <div className="flex w-full flex-col">
      <img
        src="/heart.webp"
        alt="하트 이미지"
        className="h-2/5 w-full object-cover object-center"
      />
      <div className="mt-2 flex w-full flex-col gap-6 p-8">
        <BackTextButton onClick={onBack} />
        <div className="flex flex-col gap-4">
          <p className="text-lg text-gray-800">
            이제는 {name} 님이 바라시는 이성상을 알아볼게요!
          </p>
          <p className="text-sm text-gray-500">
            신경쓰지 않는 조건은 비워두시면 됩니다.
          </p>
        </div>
        <div className="mt-2">
          <Buttons onBackClick={onBack} onNextClick={onNext} />
        </div>
      </div>
    </div>
  );
}
