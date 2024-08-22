import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";

export function Home() {
  const { mutateAsync } =
    api.basicMatchRouter.bulkShiftPreparingToPending.useMutation();

  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <h1 className="text-4xl font-semibold">이음 어드민</h1>
        <button
          onClick={async () => {
            await mutateAsync();

            alert("매칭 상태를 변경했습니다.");
          }}
        >
          매칭 상태 변경
        </button>
      </div>
    </Layout>
  );
}
