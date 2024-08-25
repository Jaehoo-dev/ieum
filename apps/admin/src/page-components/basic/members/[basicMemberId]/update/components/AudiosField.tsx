import { useState } from "react";
import { BasicMemberV2, MemberAudio } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";
import { assert } from "@ieum/utils";
import { nanoid } from "nanoid";

import { AudioInput } from "~/components/AudioInput";
import { TextInput } from "~/components/TextInput";
import { AudioPreview } from "~/page-components/basic/components/AudioPreview";
import { api } from "~/utils/api";

interface Props {
  memberId: BasicMemberV2["id"];
}

export function AudiosField({ memberId }: Props) {
  const [newAudioIndex, setNewAudioIndex] = useState(0);
  const [audioFile, setAudioFile] = useState<File>();
  const utils = api.useUtils();
  const { data: audios = [] } =
    api.basicMemberAudioRouter.findByMemberId.useQuery({
      memberId,
    });
  const { mutateAsync: create } = api.basicMemberAudioRouter.create.useMutation(
    {
      onSuccess: () => {
        return utils.basicMemberAudioRouter.findByMemberId.invalidate();
      },
    },
  );
  const { mutateAsync: remove } = api.basicMemberAudioRouter.delete.useMutation(
    {
      onSuccess: () => {
        return utils.basicMemberAudioRouter.findByMemberId.invalidate();
      },
    },
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <p className="text-gray-500">
          ※ 음성은 최종 수정 버튼을 누르지 않아도 바로 반영됨
        </p>
        <div className="flex flex-row gap-4">
          {audios.map((audio) => {
            return (
              <div key={audio.id} className="flex flex-col gap-2">
                <AudioPreview bucketPath={audio.bucketPath} />
                <AudioIndexField audio={audio} />
                <button
                  className="rounded bg-red-500 py-1 text-white"
                  onClick={async () => {
                    await remove({ id: audio.id });
                    await supabase.storage
                      .from(
                        process.env
                          .NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_AUDIOS_BUCKET_NAME!,
                      )
                      .remove([audio.bucketPath]);
                  }}
                >
                  삭제
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-row items-end gap-2">
        <TextInput
          label="순서"
          type="number"
          value={newAudioIndex}
          onChange={(e) => {
            setNewAudioIndex(Number(e.target.value));
          }}
        />
        <AudioInput
          label="음성"
          onChange={(file) => {
            setAudioFile(file);
          }}
          onRegister={async () => {
            if (audioFile == null) {
              return;
            }

            const { data, error } = await supabase.storage
              .from(
                process.env
                  .NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_AUDIOS_BUCKET_NAME!,
              )
              .upload(nanoid(), audioFile);

            assert(error == null, error?.message);

            await create({
              memberId: memberId,
              bucketPath: data.path,
              index: newAudioIndex,
            });
          }}
        />
      </div>
    </div>
  );
}

function AudioIndexField({ audio }: { audio: MemberAudio }) {
  const [value, setValue] = useState(audio.index);
  const { mutateAsync: updateIndex, isPending } =
    api.basicMemberAudioRouter.updateIndex.useMutation();

  return (
    <div className="flex flex-row items-end gap-2">
      <TextInput
        label="순서"
        style={{ width: "80px" }}
        type="number"
        value={value}
        onChange={(e) => {
          setValue(Number(e.target.value));
        }}
      />
      <button
        className="rounded bg-blue-500 px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-50"
        onClick={async () => {
          await updateIndex({
            id: audio.id,
            index: value,
          });
        }}
        disabled={isPending}
      >
        수정
      </button>
    </div>
  );
}
