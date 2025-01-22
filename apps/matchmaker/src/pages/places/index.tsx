import { 하루_초 } from "@ieum/matchmaker-trpc-server/src/constants";
import type { SeoulDistrict } from "@ieum/prisma";
import { prisma } from "@ieum/prisma";

export { PlacesPage as default } from "~/page-components/places/PlacesPage";

export async function getStaticProps() {
  const places = await prisma.place.findMany();

  const placesByDistrict = places.reduce(
    (acc, place) => {
      const district = place.district;

      if (acc[district] == null) {
        acc[district] = [];
      }

      acc[district].push(place);

      return acc;
    },
    {} as Record<SeoulDistrict, typeof places>,
  );

  return {
    props: {
      places: placesByDistrict,
    },
    revalidate: 하루_초,
  };
}
