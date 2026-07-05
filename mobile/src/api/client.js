import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  'http://10.0.2.2:3000';

// Callback chamado em 401/403 (seta pelo App.js via setUnauthorizedHandler)
let _onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  _onUnauthorized = fn;
}

async function request(path, options = {}) {
  const token = await AsyncStorage.getItem('rcp_token');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try { data = await response.json(); } catch {}

  if (response.status === 401 || response.status === 403) {
    await AsyncStorage.multiRemove(['rcp_token', 'rcp_usuario']);
    _onUnauthorized?.();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    throw new Error(data?.erro || `Erro HTTP ${response.status}`);
  }

  return data;
}

export const api = {
  get:   (path)        => request(path),
  post:  (path, body)  => request(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch: (path, body)  => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del:   (path)        => request(path, { method: 'DELETE' }),

  login: (email, senha) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    }).then(async (r) => {
      const d = await r.json().catch(() => null);
      if (!r.ok) throw new Error(d?.erro || 'Credenciais inválidas');
      return d;
    }),
};
