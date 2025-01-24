import type { AppRouter } from "@ieum/trpc-server";
import { createTRPCReact } from "@trpc/react-query";

export const api = createTRPCReact<AppRouter>();

export { type RouterInputs, type RouterOutputs } from "@ieum/trpc-server";
