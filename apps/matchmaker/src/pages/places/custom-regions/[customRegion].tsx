import type { GetStaticPaths, GetStaticProps } from "next";
import { CustomRegion, Place, prisma, SeoulDistrict } from "@ieum/prisma";
import { assert } from "@ieum/utils";

export { PlacesByCustomRegionPage as default } from "~/page-components/places/custom-regions/PlacesByCustomRegionPage";

export const getStaticPaths = (async () => {
  const customRegions = Object.values(CustomRegion);

  const paths = customRegions.map((customRegion) => {
    return {
      params: {
        customRegion: customRegion.toLowerCase(),
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
}) satisfies GetStaticPaths;

export const getStaticProps = (async ({ params }) => {
  const customRegionQuery = params?.customRegion;

  assert(
    customRegionQuery != null && typeof customRegionQuery === "string",
    "customRegionQuery is not valid",
  );

  const customRegion = customRegionQuery.toUpperCase() as CustomRegion;

  const places = await prisma.place.findMany({
    where: {
      customRegions: {
        has: customRegion,
      },
    },
  });

  return {
    props: {
      customRegion,
      places,
    },
  };
}) satisfies GetStaticProps<{
  customRegion: CustomRegion;
  places: Place[];
}>;
