import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
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
  const phoneNumber = getValues("phoneNumber");
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    sendMessage({
      content: `${phoneNumber} - 이상형 설문 설명 페이지 진입`,
    });
  }, []);

  return (
    <div className="flex w-full flex-col">
      <img
        src="/heart.webp"
        alt="하트 이미지"
        className="h-2/5 w-full object-cover object-center"
      />
      <div className="mt-2 flex w-full flex-col gap-6 p-8">
        <BackTextButton
          onClick={() => {
            sendMessage({
              content: `${phoneNumber} - 이상형 설문 설명 페이지 이전 텍스트버튼 클릭`,
            });
            onBack();
          }}
        />
        <div className="flex flex-col gap-4">
          <p className="text-lg text-gray-800">
            이제는 {name} 님이 바라시는 이성상을 알아볼게요! 신경쓰지 않으시는
            조건은 비워두시면 됩니다.
          </p>
        </div>
        <div className="mt-2">
          <Buttons
            onBackClick={() => {
              sendMessage({
                content: `${phoneNumber} - 이상형 설문 설명 페이지 이전 버튼 클릭`,
              });
              onBack();
            }}
            onNextClick={() => {
              sendMessage({
                content: `${phoneNumber} - 이상형 설문 페이지 다음 버튼 클릭`,
              });
              onNext();
            }}
          />
        </div>
      </div>
    </div>
  );
}
