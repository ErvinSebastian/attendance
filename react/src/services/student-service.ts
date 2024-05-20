import create from './http-service';

export interface Student {
  id: number;
  name: string;
  user_type_name: string;
  course_type_name: string;
  is_selected: boolean;
}

export default create('students');
