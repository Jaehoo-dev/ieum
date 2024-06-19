import { supabase } from "@ieum/supabase";

export function ImagePreview({ bucketPath }: { bucketPath: string }) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!)
    .getPublicUrl(bucketPath, {
      transform: {
        width: 200,
        resize: "contain",
      },
    });

  return <img src={publicUrl} alt="사진" width={200} height={200} />;
}
