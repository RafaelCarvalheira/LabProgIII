import axios from 'axios';

// Em produção (servidor), usa a URL absoluta da API via variável de ambiente
// Em desenvolvimento local, usa o proxy do Vite (/api)
const baseURL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;