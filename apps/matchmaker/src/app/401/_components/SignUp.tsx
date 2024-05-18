import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signIn } from "@ieum/admin-auth";

export async function SignUp() {
  const session = await auth();

  if (session != null) {
    return redirect("/");
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("kakao");
      }}
    >
      <button>
        <Image
          src="/kakao_login_large_narrow.png"
          alt="카카오 로그인"
          width={366}
          height={90}
        />
      </button>
    </form>
  );
}
