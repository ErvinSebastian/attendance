import { useEffect, useState } from 'react';
import subjectService, { Subject } from '../services/subjects-service';

const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  useEffect(() => {
    subjectService.getAllSubjects<Subject>().then((res) => {
      setSubjects(res.data);
    });
  }, []);

  return { subjects, setSubjects };
};

export default useSubjects;
