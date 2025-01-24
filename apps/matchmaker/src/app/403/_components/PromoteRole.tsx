import { redirect } from "next/navigation";
import { auth } from "@ieum/admin-auth";
import { prisma, Role } from "@ieum/prisma";

export async function PromoteRole() {
  const session = await auth();
  const isAuthenticated = session != null;
  const isAuthorized =
    isAuthenticated &&
    (session?.user.role === Role.APP_ADMIN ||
      session?.user.role === Role.STORE_MANAGER);

  if (!isAuthenticated) {
    return redirect("https://www.flatwhite.cafe/401");
  }

  if (isAuthorized) {
    return redirect("/");
  }

  return (
    <form
      action={async () => {
        "use server";
        await promoteRole(session.user.id);
        redirect("/");
      }}
    >
      <button>카페 관리자로 회원가입</button>
    </form>
  );
}

async function promoteRole(userId: string) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: Role.STORE_MANAGER,
    },
  });
}
