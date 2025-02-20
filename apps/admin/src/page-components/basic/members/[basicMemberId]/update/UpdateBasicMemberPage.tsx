import type { ReactElement } from "react";
import { Suspense, useState } from "react";
import { useRouter } from "next/router";
import { assert, calculateBmi } from "@ieum/utils";
import { FormProvider, useForm } from "react-hook-form";

import { Layout } from "~/components/Layout";
import type { BasicMemberWithBasicMatchesJoined } from "~/domains/basic/types";
import { ConditionPrioritiesField } from "~/page-components/basic/components/form/ConditionPrioritiesField";
import { IdealTypeFields } from "~/page-components/basic/components/form/IdealTypeFields";
import { MemoField } from "~/page-components/basic/components/form/MemoField";
import { ReferrerCodeField } from "~/page-components/basic/components/form/ReferrerCodeField";
import { SelfFields } from "~/page-components/basic/components/form/SelfFields";
import { api } from "~/utils/api";
import type { BasicMemberForm } from "../../BasicMemberForm";
import { AudiosField } from "./components/AudiosField";
import { ImagesField } from "./components/ImagesField";
import { ReferralsField } from "./components/ReferralsField";
import { VideosField } from "./components/VideosField";

interface BasicMemberUpdateForm {
  self: Omit<
    BasicMemberForm["self"],
    "imageBucketPaths" | "videoBucketPaths" | "audioBucketPaths"
  >;
  idealType: BasicMemberForm["idealType"];
}

export function UpdateBasicMemberPage() {
  return (
    <Suspense>
      <Resolved />
    </Suspense>
  );
}

function Resolved() {
  const [done, setDone] = useState(false);
  const router = useRouter();
  const [member] = api.basicMemberRouter.findById.useSuspenseQuery({
    id: router.query.basicMemberId as string,
  });
  const methods = useForm<BasicMemberUpdateForm>({
    defaultValues: memberToForm(member),
  });
  const { mutateAsync: update } = api.basicMemberRouter.update.useMutation();

  return (
    <div className="flex min-h-screen flex-col items-center gap-6">
      <h1 className="text-4xl font-semibold">베이직 회원 수정</h1>
      <FormProvider {...methods}>
        <form
          className="mt-4 flex flex-col gap-6"
          onSubmit={methods.handleSubmit(async (fields) => {
            if (!done) {
              return;
            }

            await update({
              id: member.id,
              data: formToPayload(fields),
            });

            alert("수정 완료!");
            setDone(false);
          })}
        >
          <div className="grid grid-cols-2 gap-12">
            <SelfFields />
            <div className="flex flex-col gap-16">
              <IdealTypeFields />
              <ConditionPrioritiesField />
            </div>
          </div>
          <ReferrerCodeField />
          <ReferralsField />
          <MemoField />
          <ImagesField memberId={member.id} />
          <VideosField memberId={member.id} />
          <AudiosField memberId={member.id} />
          <button
            type="button"
            className="w-full rounded bg-gray-300 py-2"
            onClick={() => {
              console.log(formToPayload(methods.getValues()));
            }}
          >
            콘솔에 확인
          </button>
          <button
            type="button"
            className="w-full rounded bg-primary-500 py-2 text-white"
            onClick={() => {
              router.push(
                `/basic/members/${member.id}/profile/${
                  member.profile == null ? "create" : "update"
                }`,
              );
            }}
          >
            {member.profile == null ? "프로필 생성" : "프로필 수정"}
          </button>
          <div className="flex justify-center gap-4">
            <input
              type="checkbox"
              checked={done}
              onChange={(e) => setDone(e.target.checked)}
            />
            <button
              type="submit"
              className="w-full rounded bg-blue-600 py-2 text-white"
              disabled={methods.formState.isSubmitting}
            >
              수정
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

function memberToForm({
  idealType,
  ...member
}: BasicMemberWithBasicMatchesJoined) {
  const { regionV2, ...self } = member;

  assert(idealType != null, "idealType must not be null");
  assert(regionV2 != null, "regionV2 must not be null");

  return {
    self: {
      ...self,
      regionV2,
      fashionStyles: member.fashionStyles.map((style) => {
        return { value: style };
      }),
    },
    idealType: {
      ...idealType,
      regionsV2: idealType.regionsV2.map((region) => {
        return { value: region };
      }),
      bodyShapes: idealType.bodyShapes.map((shape) => {
        return { value: shape };
      }),
      fashionStyles: idealType.fashionStyles.map((style) => {
        return { value: style };
      }),
      eyelids: idealType.eyelids.map((eyelid) => {
        return { value: eyelid };
      }),
      occupationStatuses: idealType.occupationStatuses.map((status) => {
        return { value: status };
      }),
      preferredMbtis: idealType.preferredMbtis.map((mbti) => {
        return { value: mbti };
      }),
      nonPreferredMbtis: idealType.nonPreferredMbtis.map((mbti) => {
        return { value: mbti };
      }),
      preferredReligions: idealType.preferredReligions.map((religion) => {
        return { value: religion };
      }),
      nonPreferredReligions: idealType.nonPreferredReligions.map((religion) => {
        return { value: religion };
      }),
      dealBreakers: idealType.dealBreakers.map((condition) => {
        return { value: condition };
      }),
      highPriorities: idealType.highPriorities.map((condition) => {
        return { value: condition };
      }),
      mediumPriorities: idealType.mediumPriorities.map((condition) => {
        return { value: condition };
      }),
      lowPriorities: idealType.lowPriorities.map((condition) => {
        return { value: condition };
      }),
    },
  };
}

function formToPayload({ self, idealType }: BasicMemberUpdateForm) {
  return {
    self: {
      ...self,
      bmi:
        self.weight == null
          ? null
          : Number(calculateBmi(self.height, self.weight).toFixed(2)),
      fashionStyles: self.fashionStyles.map((style) => style.value),
    },
    idealType: {
      ...idealType,
      regionsV2: idealType.regionsV2.map((region) => region.value),
      bodyShapes: idealType.bodyShapes.map((shape) => shape.value),
      fashionStyles: idealType.fashionStyles.map((style) => style.value),
      eyelids: idealType.eyelids.map((eyelid) => eyelid.value),
      occupationStatuses: idealType.occupationStatuses.map(
        (status) => status.value,
      ),
      preferredMbtis: idealType.preferredMbtis.map((mbti) => mbti.value),
      nonPreferredMbtis: idealType.nonPreferredMbtis.map((mbti) => mbti.value),
      preferredReligions: idealType.preferredReligions.map(
        (religion) => religion.value,
      ),
      nonPreferredReligions: idealType.nonPreferredReligions.map(
        (religion) => religion.value,
      ),
      dealBreakers: idealType.dealBreakers.map((condition) => condition.value),
      highPriorities: idealType.highPriorities.map(
        (condition) => condition.value,
      ),
      mediumPriorities: idealType.mediumPriorities.map(
        (condition) => condition.value,
      ),
      lowPriorities: idealType.lowPriorities.map(
        (condition) => condition.value,
      ),
    },
  };
}

UpdateBasicMemberPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
