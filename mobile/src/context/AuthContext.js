import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      try {
        const storedToken = await AsyncStorage.getItem('rcp_token');
        const storedUser  = await AsyncStorage.getItem('rcp_usuario');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {}
      setLoading(false);
    }
    restore();
  }, []);

  async function login(newToken, usuario) {
    await AsyncStorage.setItem('rcp_token', newToken);
    await AsyncStorage.setItem('rcp_usuario', JSON.stringify(usuario));
    setToken(newToken);
    setUser(usuario);
  }

  async function logout() {
    await AsyncStorage.removeItem('rcp_token');
    await AsyncStorage.removeItem('rcp_usuario');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAdmin: user?.papel === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
