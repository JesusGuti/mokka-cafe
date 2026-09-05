import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/get-users";
import { usersKeys } from "../api/users.keys";

export const useGetUsers = () => {
  return useQuery({
    queryKey: usersKeys.lists(),
    queryFn: getUsers,
  });
};
