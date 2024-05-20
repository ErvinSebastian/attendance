import { useEffect, useState } from 'react';
import userService, { User } from '../services/user-service';

const useUsers = () => {
  const [users, setUsers] = useState<User[]>();
  useEffect(() => {
    const { request, cancel } = userService.getAll<User>();
    request
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => cancel();
  }, []);

  return { users, setUsers };
};

export default useUsers;
