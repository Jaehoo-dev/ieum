import { supabase } from "@ieum/supabase";

export function AudioPreview({ bucketPath }: { bucketPath: string }) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_AUDIOS_BUCKET_NAME!)
    .getPublicUrl(bucketPath);

  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <audio src={publicUrl} controls />;
}
