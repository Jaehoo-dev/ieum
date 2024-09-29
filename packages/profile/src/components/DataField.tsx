import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

import { Theme } from "../types";

interface Props {
  label: string;
  value: string;
  theme?: Theme;
  verified?: boolean;
}

export function DataField({
  label,
  value,
  theme = "BASIC",
  verified = false,
}: Props) {
  return (
    <span className="flex items-start gap-1">
      <p className="text-lg text-gray-900">•</p>
      <p className="text-lg text-gray-900">
        {`${label}: ${value}`}
        {verified ? (
          <VerifiedRoundedIcon
            className={`mb-0.5 ml-0.5 text-sm ${
              theme === "BLIND" ? "text-blind-300" : "text-primary-300"
            }`}
          />
        ) : null}
      </p>
    </span>
  );
}
