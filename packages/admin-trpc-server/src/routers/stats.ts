import { Gender, MemberStatus, RegionV2 } from "@ieum/prisma";
import { match } from "ts-pattern";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const statsRouter = createTRPCRouter({
  getStats: protectedAdminProcedure.query(async ({ ctx: { prisma } }) => {
    const [basicMembers, blindMembers] = await Promise.all([
      prisma.basicMemberV2.findMany({
        where: {
          status: {
            in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
          },
        },
        select: {
          status: true,
          regionV2: true,
          gender: true,
        },
      }),
      prisma.blindMember.findMany({
        where: {
          status: {
            in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
          },
        },
        select: {
          status: true,
          gender: true,
        },
      }),
    ]);

    const basic = basicMembers.reduce(
      (acc, member) => {
        match(member.regionV2)
          .with(
            RegionV2.SEOUL,
            RegionV2.INCHEON_BUCHEON,
            RegionV2.SOUTH_GYEONGGI,
            RegionV2.NORTH_GYEONGGI,
            () => {
              match(member)
                .with(
                  {
                    status: MemberStatus.ACTIVE,
                    gender: Gender.MALE,
                  },
                  () => {
                    acc.seoulIncheonGyeonggi.active.male += 1;
                  },
                )
                .with(
                  {
                    status: MemberStatus.ACTIVE,
                    gender: Gender.FEMALE,
                  },
                  () => {
                    acc.seoulIncheonGyeonggi.active.female += 1;
                  },
                )
                .with(
                  {
                    status: MemberStatus.INACTIVE,
                    gender: Gender.MALE,
                  },
                  () => {
                    acc.seoulIncheonGyeonggi.inactive.male += 1;
                  },
                )
                .with(
                  {
                    status: MemberStatus.INACTIVE,
                    gender: Gender.FEMALE,
                  },
                  () => {
                    acc.seoulIncheonGyeonggi.inactive.female += 1;
                  },
                );
            },
          )
          .with(RegionV2.CHUNGCHEONG, () => {
            match(member)
              .with(
                {
                  status: MemberStatus.ACTIVE,
                  gender: Gender.MALE,
                },
                () => {
                  acc.chungcheong.active.male += 1;
                },
              )
              .with(
                {
                  status: MemberStatus.ACTIVE,
                  gender: Gender.FEMALE,
                },
                () => {
                  acc.chungcheong.active.female += 1;
                },
              )
              .with(
                {
                  status: MemberStatus.INACTIVE,
                  gender: Gender.MALE,
                },
                () => {
                  acc.chungcheong.inactive.male += 1;
                },
              )
              .with(
                {
                  status: MemberStatus.INACTIVE,
                  gender: Gender.FEMALE,
                },
                () => {
                  acc.chungcheong.inactive.female += 1;
                },
              );
          })
          .otherwise(() => {
            throw new Error("Invalid region");
          });

        return acc;
      },
      {
        seoulIncheonGyeonggi: {
          active: {
            male: 0,
            female: 0,
          },
          inactive: {
            male: 0,
            female: 0,
          },
        },
        chungcheong: {
          active: {
            male: 0,
            female: 0,
          },
          inactive: {
            male: 0,
            female: 0,
          },
        },
      },
    );

    const blind = blindMembers.reduce(
      (acc, member) => {
        match(member)
          .with(
            {
              status: MemberStatus.ACTIVE,
              gender: Gender.MALE,
            },
            () => {
              acc.active.male += 1;
            },
          )
          .with(
            {
              status: MemberStatus.ACTIVE,
              gender: Gender.FEMALE,
            },
            () => {
              acc.active.female += 1;
            },
          )
          .with(
            {
              status: MemberStatus.INACTIVE,
              gender: Gender.MALE,
            },
            () => {
              acc.inactive.male += 1;
            },
          )
          .with(
            {
              status: MemberStatus.INACTIVE,
              gender: Gender.FEMALE,
            },
            () => {
              acc.inactive.female += 1;
            },
          );

        return acc;
      },
      {
        active: {
          male: 0,
          female: 0,
        },
        inactive: {
          male: 0,
          female: 0,
        },
      },
    );

    return {
      basic,
      blind,
    };
  }),
});
