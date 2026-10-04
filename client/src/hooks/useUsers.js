import { useEffect, useState } from "react";
import { api } from "../api/client.js";

/** Loads the list of users that issues can be assigned to. */
export function useUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api
      .get("/users")
      .then((res) => setUsers(res.data.users))
      .catch(() => setUsers([]));
  }, []);
  return users;
}
