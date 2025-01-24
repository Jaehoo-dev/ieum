"use client";

import assert from "assert";

import { api } from "~/utils/api";
import { useAuthorizedSession } from "../_providers/AuthorizedSessionProvider";

export default function DashboardHome() {
  const { user } = useAuthorizedSession();
  const { data: stores } = api.store.findManagingByUserId.useQuery(user.id);

  assert(stores != null, "상점 정보가 없습니다.");

  return stores.map(({ id, name }) => {
    return (
      <div key={id}>
        <p>{name}</p>
      </div>
    );
  });
}
