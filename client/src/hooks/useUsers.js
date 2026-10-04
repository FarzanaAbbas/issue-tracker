import { useApi } from "./useApi.js";

/** The list of users that issues can be assigned to (cached across pages). */
export function useUsers() {
  return useApi("/users").data?.users ?? [];
}
