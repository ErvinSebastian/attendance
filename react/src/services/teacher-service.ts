import create from './http-service';

export interface Teacher {
  id: number;
  name: string;
  user_type_name: string;
}

export default create('teachers');
