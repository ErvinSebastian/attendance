import { useEffect, useState } from 'react';
import studentService, { Student } from '../services/student-service';

const useStudents = () => {
  const [students, setStudents] = useState<Student[]>();
  useEffect(() => {
    studentService.getAllStudents<Student>().then((res) => {
      setStudents(res.data);
    });
  }, []);

  return { students, setStudents };
};

export default useStudents;
