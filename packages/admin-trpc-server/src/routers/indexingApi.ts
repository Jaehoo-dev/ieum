import { assert } from "@ieum/utils";
import axios from "axios";
import { google } from "googleapis";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const indexingApiRouter = createTRPCRouter({
  requestIndexing: protectedAdminProcedure
    .input(
      z.object({
        url: z.string(),
        type: z.union([z.literal("URL_UPDATED"), z.literal("URL_DELETED")]),
      }),
    )
    .mutation(async ({ input }) => {
      const jwtClient = new google.auth.JWT(
        process.env.INDEXING_API_CLIENT_EMAIL,
        undefined,
        process.env.INDEXING_API_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        ["https://www.googleapis.com/auth/indexing"],
        undefined,
      );

      jwtClient.authorize(function (err, tokens) {
        if (err != null) {
          throw err;
        }

        assert(tokens != null, "tokens should not be null");

        axios
          .post(
            "https://indexing.googleapis.com/v3/urlNotifications:publish",
            input,
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            },
          )
          .then((res) => {
            return res.data;
          })
          .catch((err) => {
            console.error(err);
            throw err;
          });
      });
    }),
});
