import { ImgHTMLAttributes } from "react";
import { MemberImageV2 } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  image: MemberImageV2;
}

export function Avatar({ image, ...props }: Props) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!)
    .getPublicUrl(image.bucketPath);

  return (
    <img
      src={publicUrl}
      alt="프로필 사진"
      className="h-24 w-24 rounded-full object-cover"
      loading="lazy"
      {...props}
    />
  );
}
