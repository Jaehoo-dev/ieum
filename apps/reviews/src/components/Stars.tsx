import { FripRating } from "@ieum/prisma";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { match } from "ts-pattern";

interface Props {
  rating: FripRating;
}

export function Stars({ rating }: Props) {
  return (
    <div className="flex flex-row">
      {match(rating)
        .with(FripRating.FIVE, () => {
          return (
            <>
              <FullStar />
              <FullStar />
              <FullStar />
              <FullStar />
              <FullStar />
            </>
          );
        })
        .with(FripRating.FOUR_POINT_FIVE, () => {
          return (
            <>
              <FullStar />
              <FullStar />
              <FullStar />
              <FullStar />
              <HalfStar />
            </>
          );
        })
        .with(FripRating.FOUR, () => {
          return (
            <>
              <FullStar />
              <FullStar />
              <FullStar />
              <FullStar />
            </>
          );
        })
        .exhaustive()}
    </div>
  );
}

function FullStar() {
  return <StarIcon className="text-frip-primary-500" fontSize="small" />;
}

function HalfStar() {
  return <StarHalfIcon className="text-frip-primary-500" fontSize="small" />;
}
