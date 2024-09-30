import { MemberImageV2 } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";
import { assert } from "@ieum/utils";
import { HoverCardArrow } from "@radix-ui/react-hover-card";

import { Avatar } from "./Avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

interface Props {
  images: MemberImageV2[];
  onClick?: () => void;
}

export function HoverAvatar({ images, onClick }: Props) {
  assert(images[0] != null, "images[0] is required");

  return (
    <HoverCard openDelay={500} closeDelay={50}>
      <HoverCardTrigger>
        <Avatar
          image={images[0]}
          style={{ marginRight: "4px", cursor: "pointer" }}
          onClick={onClick}
        />
      </HoverCardTrigger>
      <HoverCardContent
        className="HoverCardContent flex w-80 flex-col gap-2 overflow-auto"
        side="right"
      >
        <HoverCardArrow />
        {images.map((image) => {
          return <PreviewImage key={image.id} image={image} />;
        })}
      </HoverCardContent>
    </HoverCard>
  );
}

function PreviewImage({ image }: { image: MemberImageV2 }) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!)
    .getPublicUrl(image.bucketPath);

  return <img src={publicUrl} alt="미리보기 사진" loading="lazy" />;
}
