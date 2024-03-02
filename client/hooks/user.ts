"use client";
import { graphQLClient } from "@/clients/api";
import { getCurrentUserQuery, getUserById } from "@/graphql/query/user";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = () => {
  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: () => graphQLClient.request(getCurrentUserQuery),
  });
  return { ...query, user: query.data?.getCurrentUser };
};
