import type { ComponentProps } from "react";
import { blind500 } from "@ieum/constants";
import PulseLoader from "react-spinners/PulseLoader";

type Props = ComponentProps<typeof PulseLoader>;

export function Loader(props: Props) {
  return <PulseLoader color={blind500} {...props} />;
}
