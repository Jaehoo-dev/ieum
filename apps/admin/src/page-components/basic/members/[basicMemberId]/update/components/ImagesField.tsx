import { useState } from "react";
import { BasicMember } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";
import { assert } from "@ieum/utils";
import { nanoid } from "nanoid";

import { ImageInput } from "~/components/ImageInput";
import { ImagePreview } from "~/page-components/basic/components/ImagePreview";
import { api } from "~/utils/api";

interface Props {
  memberId: BasicMember["id"];
}

export function ImagesField({ memberId }: Props) {
  const [imageFile, setImageFile] = useState<File>();
  const utils = api.useUtils();
  const { data: images = [] } =
    api.basicMemberImageRouter.findByMemberId.useQuery({
      memberId,
    });
  const { mutateAsync: createMemberImage } =
    api.basicMemberImageRouter.create.useMutation({
      onSuccess: () => {
        return utils.basicMemberImageRouter.findByMemberId.invalidate();
      },
    });
  const { mutateAsync: deleteMemberImage } =
    api.basicMemberImageRouter.delete.useMutation({
      onSuccess: () => {
        return utils.basicMemberImageRouter.findByMemberId.invalidate();
      },
    });

  return (
    <div className="flex flex-col gap-1">
      <p className="text-gray-500">
        ※ 사진은 수정 버튼을 누르지 않아도 바로 반영됨
      </p>
      <div className="flex flex-row gap-4">
        {images.map((image) => {
          return (
            <div key={image.id} className="flex flex-col gap-2">
              <ImagePreview bucketPath={image.bucketPath} />
              <button
                className="rounded bg-red-500 py-1 text-white"
                onClick={async () => {
                  await deleteMemberImage({ id: image.id });
                }}
              >
                삭제
              </button>
            </div>
          );
        })}
      </div>
      <ImageInput
        label="사진"
        onChange={(file) => {
          setImageFile(file);
        }}
        onRegister={async () => {
          if (imageFile == null) {
            return;
          }

          const { data, error } = await supabase.storage
            .from(
              process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
            )
            .upload(nanoid(), imageFile);

          assert(error == null, error?.message);

          await createMemberImage({
            memberId: memberId,
            bucketPath: data.path,
          });
        }}
      />
    </div>
  );
}
