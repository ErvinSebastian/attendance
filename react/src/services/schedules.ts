import { useEffect, useState } from 'react';
import classService, { Class } from './class-service';

const schedules = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const [schedules, setSchedules] = useState([]);
  useEffect(() => {
    const response = classService.getSchedules(user);
    response
      .then((res) => {
        console.log(res);
        setSchedules(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return { schedules, setSchedules };
};

export default schedules;
