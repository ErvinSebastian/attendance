import create from './http-service';

export interface Class {
  id: number;
  name: string;
  description: string;
}

export default create('classes');
