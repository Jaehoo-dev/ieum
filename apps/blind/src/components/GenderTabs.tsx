import { 성별_라벨 } from "@ieum/constants";
import { Gender } from "@ieum/prisma";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export function GenderTabs({
  value,
  onChange,
}: {
  value: Gender;
  onChange: (gender: Gender) => void;
}) {
  return (
    <div className="w-full max-w-xs">
      <ToggleButtonGroup
        value={value}
        onChange={(_, value) => {
          if (value == null) {
            return;
          }

          onChange(value);
        }}
        color="primary"
        exclusive={true}
        fullWidth={true}
        size="small"
      >
        <ToggleButton value={Gender.MALE} disableRipple={true}>
          <span className="text-sm">{성별_라벨[Gender.MALE]}</span>
        </ToggleButton>
        <ToggleButton value={Gender.FEMALE} disableRipple={true}>
          <span className="text-sm">{성별_라벨[Gender.FEMALE]}</span>
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}
