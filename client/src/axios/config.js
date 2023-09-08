import axios from 'axios';

export const serverFetch = axios.create({
  baseURL: 'https://localhost:3000',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
