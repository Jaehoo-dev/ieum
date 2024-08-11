import { FripReview } from "@ieum/prisma";
import { format } from "date-fns";

import { Stars } from "./Stars";

interface Props {
  data: FripReview;
}

export function Review({ data }: Props) {
  return (
    <div className="flex flex-col gap-2 border-b pb-4">
      <div className="flex flex-col gap-1">
        <Stars rating={data.rating} />
        <div className="flex flex-row gap-2 text-sm text-gray-400">
          <p>{data.nickname}</p>
          <p>{format(data.writtenAt, "yyyy-MM-dd HH:mm")}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500">{data.option}</p>
      <p className="whitespace-pre-wrap break-words text-gray-700">
        {data.content}
      </p>
    </div>
  );
}
