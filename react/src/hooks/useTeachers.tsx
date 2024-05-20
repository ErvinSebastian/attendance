import { useEffect, useState } from 'react';
import teacherService, { Teacher } from '../services/teacher-service';

const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>();
  useEffect(() => {
    teacherService.getAllTeachers<Teacher>().then((res) => {
      setTeachers(res.data);
    });
  }, []);

  return { teachers, setTeachers };
};

export default useTeachers;
