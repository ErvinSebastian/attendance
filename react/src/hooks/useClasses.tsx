import { useEffect, useState } from 'react';
import classService, { Class } from '../services/class-service';

const useClasses = () => {
  const session = JSON.parse(sessionStorage.getItem('user'));
  const [classes, setClasses] = useState<Class[]>([]);
  useEffect(() => {
    if (session.user_type_name == 'admin') {
      const { request, cancel } = classService.getAll<Class>();
      request
        .then((res) => {
          setClasses(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
      return () => cancel();
    }

    if (session.user_type_name == 'student') {
      const { request, cancel } = classService.getStudentSubjectList(
        session.id,
      );
      request
        .then((res) => {
          setClasses(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
      return () => cancel();
    }

    if (session.user_type_name == 'teacher') {
      const { request, cancel } = classService.getTeacherSubjectList(
        session.id,
      );
      request
        .then((res) => {
          setClasses(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
      return () => cancel();
    }
  }, []);

  return { classes, setClasses };
};

export default useClasses;
