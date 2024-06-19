import { MemberImage } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";

const 너비 = 100;

export function Avatar({ image }: { image: MemberImage }) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!)
    .getPublicUrl(image.bucketPath, {
      transform: {
        width: 너비,
        resize: "contain",
      },
    });

  return <img src={publicUrl} alt="프로필 사진" width={너비} />;
}
