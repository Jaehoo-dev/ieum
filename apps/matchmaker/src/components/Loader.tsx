import { ComponentProps } from "react";
import { primary500 } from "@ieum/constants";
import PulseLoader from "react-spinners/PulseLoader";

interface Props extends ComponentProps<typeof PulseLoader> {}

export function Loader(props: Props) {
  return <PulseLoader color={primary500} {...props} />;
}
