import { useEffect, useState } from 'react';
import userTypesService, { UserType } from '../services/user-type-service';

const useUserTypes = () => {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  useEffect(() => {
    const { request, cancel } = userTypesService.getAll<UserType>();
    request
      .then((res) => {
        setUserTypes(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => cancel();
  }, []);

  return { userTypes, setUserTypes };
};

export default useUserTypes;
