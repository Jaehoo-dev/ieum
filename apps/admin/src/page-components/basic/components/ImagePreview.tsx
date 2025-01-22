import { supabase } from "@ieum/supabase";

export function ImagePreview({ bucketPath }: { bucketPath: string }) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!)
    .getPublicUrl(bucketPath);

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={publicUrl} alt="사진" width={400} />;
}
