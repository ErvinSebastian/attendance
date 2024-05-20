import axios, { CanceledError } from 'axios';

export default axios.create({
  baseURL: 'http://localhost/attendance/app/index.php',
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
});

export { CanceledError };
