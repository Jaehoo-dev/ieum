import { supabase } from "@ieum/supabase";

export function VideoPreview({ bucketPath }: { bucketPath: string }) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_VIDEOS_BUCKET_NAME!)
    .getPublicUrl(bucketPath);

  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <video src={publicUrl} controls width={400} />;
}
