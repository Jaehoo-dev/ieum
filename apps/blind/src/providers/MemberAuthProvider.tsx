import { createContext, useCallback, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import type { BasicMemberV2 } from "@ieum/prisma";
import { assert, globalKrToBasicKr } from "@ieum/utils";
import { signOut as signOutFirebase } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import { api } from "~/utils/api";
import { auth } from "~/utils/firebase";

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
  const [user, isAuthLoading, error] = useAuthState(auth);
  const utils = api.useUtils();
  const { data: member, isLoading: isMemberLoading } =
    api.blindMemberRouter.findByPhoneNumber.useQuery(
      {
        phoneNumber:
          user?.phoneNumber != null ? globalKrToBasicKr(user.phoneNumber) : "",
      },
      { enabled: user != null },
    );
  const isLoading = isAuthLoading || isMemberLoading;

  const signOut = useCallback(async () => {
    await signOutFirebase(auth);
    await utils.blindMemberRouter.invalidate();
  }, [utils.blindMemberRouter]);

  useEffect(() => {
    if (error != null) {
      void signOut();
    }
  }, [error, signOut]);

  const loggedIn = !isLoading && user != null;

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
