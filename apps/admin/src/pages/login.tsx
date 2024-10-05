import { useRouter } from "next/router";
import { signIn } from "@ieum/admin-auth";
import { useForm } from "react-hook-form";

import { TextInput } from "~/components/TextInput";

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async ({ username, password }) => {
          await signIn("credentials", {
            username,
            password,
            redirect: false,
          });

          void router.push("/");
        })}
      >
        <TextInput
          label="username"
          {...register("username", {
            required: true,
          })}
        />
        <TextInput
          label="password"
          type="password"
          {...register("password", {
            required: true,
          })}
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-500 py-2 text-white"
        >
          Login
        </button>
      </form>
    </div>
  );
}

LoginPage.auth = false;
