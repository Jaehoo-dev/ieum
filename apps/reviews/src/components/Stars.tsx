import { FripRating } from "@ieum/prisma";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";

interface Props {
  rating: FripRating;
}

export function Stars({ rating }: Props) {
  return (
    <div className="flex flex-row">
      {Array.from({ length: 5 }).map((_, index) => {
        if (index === 4 && rating === FripRating.FOUR_POINT_FIVE) {
          return (
            <StarHalfIcon
              key={index}
              className="text-frip-primary-500"
              fontSize="small"
            />
          );
        }

        return (
          <StarIcon
            key={index}
            className="text-frip-primary-500"
            fontSize="small"
          />
        );
      })}
    </div>
  );
}
