import { ImgHTMLAttributes } from "react";
import { MemberImage } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  image: MemberImage;
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
      className="h-[100px] w-[100px] rounded-full object-cover"
      {...props}
    />
  );
}
