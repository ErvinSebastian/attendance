import { useEffect, useState } from 'react';
import courseService, { Course } from '../services/courses-sevice';

const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    const { request, cancel } = courseService.getAll<Course>();
    request
      .then((res) => {
        setCourses(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => cancel();
  }, []);

  return { courses, setCourses };
};

export default useCourses;
