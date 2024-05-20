import create from './http-service';

export interface UserType {
  id: number;
  name: string;
  description: string;
}

export default create('user_types');
