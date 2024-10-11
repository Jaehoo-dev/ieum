import { createContext, useCallback, useContext } from "react";
import type { ReactNode } from "react";
import { signOut as signOutSession, useSession } from "@ieum/blind-auth";
import type { BasicMemberV2 } from "@ieum/prisma";
import { assert } from "@ieum/utils";

import { api } from "~/utils/api";

export type Member = Pick<BasicMemberV2, "id" | "phoneNumber" | "gender">;

interface MemberAuthContext {
  member: Member | null | undefined;
  loading: boolean;
  loggedIn: boolean;
  registered: boolean;
  preRegistered: boolean;
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
    api.blindMemberRouter.findByPhoneNumber.useQuery(
      {
        phoneNumber:
          session?.user.phoneNumber != null ? session.user.phoneNumber : "",
      },
      { enabled: session?.user != null },
    );
  const { data: draftMember, isLoading: isDraftMemberLoading } =
    api.blindMemberRouter.findDraftByPhoneNumber.useQuery(
      {
        phoneNumber:
          session?.user.phoneNumber != null ? session.user.phoneNumber : "",
      },
      { enabled: session?.user != null },
    );
  const isLoading =
    status === "loading" || isMemberLoading || isDraftMemberLoading;

  const signOut = useCallback(async () => {
    await signOutSession({
      callbackUrl: "/",
      redirect: true,
    });
    await utils.blindMemberRouter.invalidate();
  }, [utils.blindMemberRouter]);

  const loggedIn = !isLoading && session?.user != null;

  return (
    <MemberAuthContext.Provider
      value={{
        member,
        loading: isLoading,
        loggedIn,
        registered: loggedIn && member != null,
        preRegistered: loggedIn && draftMember != null,
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
