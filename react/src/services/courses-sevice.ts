import create from './http-service';

export interface Course {
  id: number;
  name: string;
  description: string;
}

export default create('courses');
