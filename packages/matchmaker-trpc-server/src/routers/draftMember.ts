import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const draftMemberRouter = createTRPCRouter({
  create: publicProcedure
    .meta({ openapi: { method: "POST", path: "/draft-members/create" } })
    .input(z.any())
    .mutation(({ ctx, input }) => {
      console.log("create", input);

      return true;
    }),
});
