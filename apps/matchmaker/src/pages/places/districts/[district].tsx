import type { GetStaticPaths, GetStaticProps } from "next";
import { 하루_초 } from "@ieum/matchmaker-trpc-server/src/constants";
import { Place, prisma, SeoulDistrict } from "@ieum/prisma";
import { assert } from "@ieum/utils";

export { PlacesByDistrictPage as default } from "~/page-components/places/districts/PlacesByDistrictPage";

export const getStaticPaths = (async () => {
  // TODO: 구 모두 채우면 Enum 사용
  const places = await prisma.place.findMany({
    select: {
      district: true,
    },
  });

  const districts = Array.from(
    new Set(
      places.map((place) => {
        return place.district;
      }),
    ),
  );

  const paths = districts.map((district) => {
    return {
      params: {
        district: district.toLowerCase(),
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
}) satisfies GetStaticPaths;

export const getStaticProps = (async ({ params }) => {
  const districtQuery = params?.district;

  assert(
    districtQuery != null && typeof districtQuery === "string",
    "districtQuery is not valid",
  );

  const district = districtQuery.toUpperCase() as SeoulDistrict;

  const places = await prisma.place.findMany({
    where: {
      district,
    },
  });

  return {
    props: {
      district,
      places,
    },
    revalidate: 하루_초,
  };
}) satisfies GetStaticProps<{
  district: Place["district"];
  places: Place[];
}>;
