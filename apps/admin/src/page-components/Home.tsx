import { Layout } from "~/components/Layout";

export function Home() {
  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <h1 className="text-4xl font-semibold">이음 어드민</h1>
      </div>
    </Layout>
  );
}
