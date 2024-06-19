import { MemberImage } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";

const 크기 = 100;

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  image: MemberImage;
}

export function Avatar({ image, ...props }: Props) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!)
    .getPublicUrl(image.bucketPath, {
      transform: {
        width: 크기,
        height: 크기,
      },
    });

  return (
    <img
      src={publicUrl}
      alt="프로필 사진"
      width={크기}
      height={크기}
      className="rounded-full"
      {...props}
    />
  );
}
