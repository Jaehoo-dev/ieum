import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";

export function Home() {
  const { mutateAsync } =
    api.basicMatchRouter.bulkShiftPreparingToPending.useMutation();
  const { data: stats } = api.statsRouter.getStats.useQuery();

  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 py-2">
        <h1 className="text-4xl font-semibold">이음 어드민</h1>
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white"
          onClick={async () => {
            await mutateAsync();

            alert("매칭 상태를 변경했습니다.");
          }}
        >
          매칭 상태 변경
        </button>
        {stats == null ? null : (
          <div className="space-y-6 text-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-semibold tracking-wider text-gray-700"
                    >
                      이음 베이직
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500"
                    >
                      성별
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500"
                    >
                      수도권
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500"
                    >
                      충청
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500"
                    >
                      전체
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <tr>
                    <td
                      className="whitespace-nowrap px-6 py-4 font-medium"
                      rowSpan={3}
                    >
                      활동중
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">남성</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.basic.seoulIncheonGyeonggi.active.male}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.basic.chungcheong.active.male}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.basic.seoulIncheonGyeonggi.active.male +
                        stats.basic.chungcheong.active.male}
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4">여성</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.basic.seoulIncheonGyeonggi.active.female}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.basic.chungcheong.active.female}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.basic.seoulIncheonGyeonggi.active.female +
                        stats.basic.chungcheong.active.female}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      전체
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.basic.seoulIncheonGyeonggi.active.male +
                        stats.basic.seoulIncheonGyeonggi.active.female}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.basic.chungcheong.active.male +
                        stats.basic.chungcheong.active.female}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.basic.seoulIncheonGyeonggi.active.male +
                        stats.basic.seoulIncheonGyeonggi.active.female +
                        stats.basic.chungcheong.active.male +
                        stats.basic.chungcheong.active.female}
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="whitespace-nowrap px-6 py-4 font-medium"
                      rowSpan={3}
                    >
                      휴면
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">남성</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.basic.seoulIncheonGyeonggi.inactive.male}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.basic.chungcheong.inactive.female}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.basic.seoulIncheonGyeonggi.inactive.male +
                        stats.basic.chungcheong.inactive.female}
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4">여성</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.basic.seoulIncheonGyeonggi.inactive.female}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.basic.chungcheong.inactive.female}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.basic.seoulIncheonGyeonggi.inactive.female +
                        stats.basic.chungcheong.inactive.female}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      전체
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.basic.seoulIncheonGyeonggi.inactive.male +
                        stats.basic.seoulIncheonGyeonggi.inactive.female}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.basic.chungcheong.inactive.male +
                        stats.basic.chungcheong.inactive.female}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.basic.seoulIncheonGyeonggi.inactive.male +
                        stats.basic.seoulIncheonGyeonggi.inactive.female +
                        stats.basic.chungcheong.inactive.male +
                        stats.basic.chungcheong.inactive.female}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-semibold tracking-wider text-gray-700"
                    >
                      이음 블라인드
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500"
                    >
                      성별
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500"
                    >
                      전체
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <tr>
                    <td
                      className="whitespace-nowrap px-6 py-4 font-medium"
                      rowSpan={3}
                    >
                      활동중
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">남성</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.blind.active.male}
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4">여성</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.blind.active.female}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      전체
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.blind.active.male + stats.blind.active.female}
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="whitespace-nowrap px-6 py-4 font-medium"
                      rowSpan={3}
                    >
                      휴면
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">남성</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.blind.inactive.male}
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4">여성</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {stats.blind.inactive.female}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      전체
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {stats.blind.inactive.male + stats.blind.inactive.female}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
