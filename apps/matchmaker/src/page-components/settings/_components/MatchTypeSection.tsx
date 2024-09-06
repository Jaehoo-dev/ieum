import { assert } from "@ieum/utils";
import { Checkbox, FormControlLabel } from "@mui/material";

import { useMemberAuthContext } from "~/providers/MemberAuthProvider";

export function MatchTypeSection() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-700">매치 유형</h2>
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={true}
              disabled={true}
              readOnly={true}
              disableRipple={true}
            />
          }
          label="기본(맞교환)"
        />
      </div>
    </div>
  );
}
