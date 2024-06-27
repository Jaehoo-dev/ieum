import { useState } from "react";
import { BasicMember, MemberImage } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";
import { assert, isEmptyStringOrNil } from "@ieum/utils";
import { nanoid } from "nanoid";

import { ImageInput } from "~/components/ImageInput";
import { TextInput } from "~/components/TextInput";
import { ImagePreview } from "~/page-components/basic/components/ImagePreview";
import { api } from "~/utils/api";

interface Props {
  memberId: BasicMember["id"];
}

export function ImagesField({ memberId }: Props) {
  const [newImageIndex, setNewImageIndex] = useState(0);
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
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <p className="text-gray-500">
          ※ 사진은 수정 버튼을 누르지 않아도 바로 반영됨
        </p>
        <div className="flex flex-row gap-4">
          {images.map((image) => {
            return (
              <div key={image.id} className="flex flex-col gap-2">
                <ImagePreview bucketPath={image.bucketPath} />
                <ImageIndexField image={image} />
                <ImageCustomIndexField image={image} />
                <button
                  className="rounded bg-red-500 py-1 text-white"
                  onClick={async () => {
                    await deleteMemberImage({ id: image.id });
                    await supabase.storage
                      .from(
                        process.env
                          .NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
                      )
                      .remove([image.bucketPath]);
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
          value={newImageIndex}
          onChange={(e) => {
            setNewImageIndex(Number(e.target.value));
          }}
        />
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
                process.env
                  .NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
              )
              .upload(nanoid(), imageFile);

            assert(error == null, error?.message);

            await createMemberImage({
              memberId: memberId,
              bucketPath: data.path,
              index: newImageIndex,
            });
          }}
        />
      </div>
    </div>
  );
}

function ImageIndexField({ image }: { image: MemberImage }) {
  const [value, setValue] = useState(image.index);
  const { mutateAsync: updateImageIndex, isPending } =
    api.basicMemberImageRouter.updateIndex.useMutation();

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
          await updateImageIndex({
            id: image.id,
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

function ImageCustomIndexField({ image }: { image: MemberImage }) {
  const [value, setValue] = useState(image.customWidth);
  const { mutateAsync: updateImageWidth, isPending } =
    api.basicMemberImageRouter.updateCustomWidth.useMutation();

  return (
    <div className="flex flex-row items-end gap-2">
      <TextInput
        label="너비"
        style={{ width: "80px" }}
        type="number"
        value={value ?? ""}
        onChange={({ target: { value } }) => {
          if (isEmptyStringOrNil(value) || Number(value) <= 0) {
            setValue(null);

            return;
          }

          setValue(Number(value));
        }}
      />
      <button
        className="rounded bg-blue-500 px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-50"
        onClick={async () => {
          await updateImageWidth({
            id: image.id,
            width: value,
          });
        }}
        disabled={isPending}
      >
        수정
      </button>
    </div>
  );
}
