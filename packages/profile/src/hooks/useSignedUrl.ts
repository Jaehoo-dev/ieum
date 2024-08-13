import { supabase } from "@ieum/supabase";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSuspenseSignedUrl({
  bucket,
  path,
  expiresIn = 3,
}: {
  bucket: string;
  path: string;
  expiresIn?: number;
}) {
  return useSuspenseQuery({
    queryKey: ["useSuspenseSignedUrl", { bucket, path, expiresIn }],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        throw error;
      }

      return data.signedUrl;
    },
  });
}
