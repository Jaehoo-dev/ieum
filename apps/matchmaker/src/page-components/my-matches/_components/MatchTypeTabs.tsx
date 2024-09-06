import { ComponentProps } from "react";
import { 매치_유형 } from "@ieum/constants";
import { assert } from "@ieum/utils";
import {
  ToggleButton as _ToggleButton,
  ToggleButtonGroup as _ToggleButtonGroup,
} from "@mui/material";

import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { 조회용_매치_유형 } from "../_enums";

interface Props {
  value: 조회용_매치_유형;
  onChange: (value: 조회용_매치_유형) => void;
  senderTab: boolean;
  basicMatchNotification?: boolean;
  receiverNotification?: boolean;
  senderNotification?: boolean;
}

export function MatchTypeTabs({
  value,
  onChange,
  senderTab,
  basicMatchNotification = false,
  receiverNotification = false,
  senderNotification = false,
}: Props) {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  return (
    <Wrapper>
      <ToggleButtonGroup
        value={value}
        onChange={(_, value) => {
          console.log(value);
          if (value == null) {
            return;
          }

          onChange(value);
        }}
      >
        <ToggleButton
          value={조회용_매치_유형.BASIC}
          text="맞교환"
          onClick={() => {
            onChange(조회용_매치_유형.BASIC);
          }}
          notification={basicMatchNotification}
        />
        <ToggleButton
          value={조회용_매치_유형.MEGAPHONE_RECEIVER}
          text="나 우선"
          notification={receiverNotification}
        />
        {senderTab ? (
          <ToggleButton
            value={조회용_매치_유형.MEGAPHONE_SENDER}
            text="상대방 우선"
            notification={senderNotification}
          />
        ) : null}
      </ToggleButtonGroup>
    </Wrapper>
  );
}

MatchTypeTabs.Skeleton = function MatchTypeTabsSkeleton() {
  return (
    <Wrapper>
      <ToggleButtonGroup value={매치_유형.기본} disabled={true}>
        <ToggleButton value={매치_유형.기본} text="맞교환" />
        <ToggleButton value={매치_유형.확성기} text="순차" />
      </ToggleButtonGroup>
    </Wrapper>
  );
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-xs">{children}</div>;
}

function ToggleButtonGroup(props: ComponentProps<typeof _ToggleButtonGroup>) {
  return (
    <_ToggleButtonGroup
      color="primary"
      exclusive={true}
      fullWidth={true}
      size="small"
      {...props}
    />
  );
}

interface ToggleButtonProps extends ComponentProps<typeof _ToggleButton> {
  text: string;
  notification?: boolean;
}

function ToggleButton({
  text,
  notification = false,
  ...props
}: ToggleButtonProps) {
  return (
    <_ToggleButton
      className="flex items-start gap-1"
      disableRipple={true}
      {...props}
    >
      <span className="text-sm">{text}</span>
      {notification ? (
        <span className="mt-0.5 h-1 w-1 rounded-full bg-primary-900" />
      ) : null}
    </_ToggleButton>
  );
}
