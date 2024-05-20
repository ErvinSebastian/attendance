import create from './http-service';

export interface User {
  id: number;
  name: string;
  user_type_name: string;
  course_name: string;
  student_id: string;
}

export default create('users');
