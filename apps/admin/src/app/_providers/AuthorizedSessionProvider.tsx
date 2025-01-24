import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { Session } from "@ieum/admin-auth";

const AuthorizedSessionContext = createContext<Session | null>(null);

interface Props {
  children: ReactNode;
  session: Session;
}

export function AuthorizedSessionProvider({ children, session }: Props) {
  return (
    <AuthorizedSessionContext.Provider value={session}>
      {children}
    </AuthorizedSessionContext.Provider>
  );
}

export function useAuthorizedSession() {
  const session = useContext(AuthorizedSessionContext);

  if (session == null) {
    throw new Error("AuthorizedSessionProvider is not provided");
  }

  return session;
}
