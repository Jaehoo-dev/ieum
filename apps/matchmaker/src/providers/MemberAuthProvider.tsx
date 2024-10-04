import { createContext, useCallback, useContext } from "react";
import type { ReactNode } from "react";
import { signOut as signOutSession, useSession } from "@ieum/matchmaker-auth";
import type { BasicMemberV2 } from "@ieum/prisma";
import { assert } from "@ieum/utils";

import { api } from "~/utils/api";

export type Member = Pick<
  BasicMemberV2,
  "id" | "name" | "phoneNumber" | "gender"
>;

interface MemberAuthContext {
  member: Member | null | undefined;
  loading: boolean;
  loggedIn: boolean;
  registered: boolean;
  signOut: () => Promise<void>;
}

const MemberAuthContext = createContext<MemberAuthContext | null>(null);

interface Props {
  children: ReactNode;
}

export function MemberAuthProvider({ children }: Props) {
  const { data: session, status } = useSession();
  const utils = api.useUtils();
  const { data: member, isLoading: isMemberLoading } =
    api.basicMemberRouter.findByPhoneNumber.useQuery(
      {
        phoneNumber:
          session?.user.phoneNumber != null ? session.user.phoneNumber : "",
      },
      { enabled: session?.user != null },
    );
  const isLoading = status === "loading" || isMemberLoading;

  const signOut = useCallback(async () => {
    await signOutSession({
      callbackUrl: "/",
      redirect: true,
    });
    await utils.basicMemberRouter.invalidate();
  }, [utils.basicMemberRouter]);

  const loggedIn = !isLoading && session?.user != null;

  return (
    <MemberAuthContext.Provider
      value={{
        member,
        loading: isLoading,
        loggedIn,
        registered: loggedIn && member != null,
        signOut,
      }}
    >
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuthContext() {
  const context = useContext(MemberAuthContext);

  assert(
    context != null,
    "useMemberAuthContext must be used within a MemberAuthProvider",
  );

  return context;
}
