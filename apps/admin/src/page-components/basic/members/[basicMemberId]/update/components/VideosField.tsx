import { useState } from "react";
import type { BasicMemberV2, MemberVideoV2 } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";
import { assert } from "@ieum/utils";
import { nanoid } from "nanoid";

import { TextInput } from "~/components/TextInput";
import { VideoInput } from "~/components/VideoInput";
import { VideoPreview } from "~/page-components/basic/components/VideoPreview";
import { api } from "~/utils/api";

interface Props {
  memberId: BasicMemberV2["id"];
}

export function VideosField({ memberId }: Props) {
  const [newVideoIndex, setNewVideoIndex] = useState(0);
  const [videoFile, setVideoFile] = useState<File>();
  const utils = api.useUtils();
  const { data: videos = [] } =
    api.basicMemberVideoRouter.findByMemberId.useQuery({
      memberId,
    });
  const { mutateAsync: create } = api.basicMemberVideoRouter.create.useMutation(
    {
      onSuccess: () => {
        return utils.basicMemberVideoRouter.findByMemberId.invalidate();
      },
    },
  );
  const { mutateAsync: remove } = api.basicMemberVideoRouter.delete.useMutation(
    {
      onSuccess: () => {
        return utils.basicMemberVideoRouter.findByMemberId.invalidate();
      },
    },
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <p className="text-gray-500">
          ※ 영상은 최종 수정 버튼을 누르지 않아도 바로 반영됨
        </p>
        <div className="flex flex-row gap-4">
          {videos.map((video) => {
            return (
              <div key={video.id} className="flex flex-col gap-2">
                <VideoPreview bucketPath={video.bucketPath} />
                <VideoIndexField video={video} />
                <button
                  className="rounded bg-red-500 py-1 text-white"
                  onClick={async () => {
                    await remove({ id: video.id });
                    await supabase.storage
                      .from(
                        process.env
                          .NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_VIDEOS_BUCKET_NAME!,
                      )
                      .remove([video.bucketPath]);
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
          value={newVideoIndex}
          onChange={(e) => {
            setNewVideoIndex(Number(e.target.value));
          }}
        />
        <VideoInput
          label="영상"
          onChange={(file) => {
            setVideoFile(file);
          }}
          onRegister={async () => {
            if (videoFile == null) {
              return;
            }

            const { data, error } = await supabase.storage
              .from(
                process.env
                  .NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_VIDEOS_BUCKET_NAME!,
              )
              .upload(nanoid(), videoFile);

            assert(error == null, error?.message);

            await create({
              memberId: memberId,
              bucketPath: data.path,
              index: newVideoIndex,
            });
          }}
        />
      </div>
    </div>
  );
}

function VideoIndexField({ video }: { video: MemberVideoV2 }) {
  const [value, setValue] = useState(video.index);
  const { mutateAsync: updateIndex, isPending } =
    api.basicMemberVideoRouter.updateIndex.useMutation();

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
            id: video.id,
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
