import create from './http-service';

export interface Subject {
  id: number;
  name: string;
  description: string;
}

export default create('subjects');
