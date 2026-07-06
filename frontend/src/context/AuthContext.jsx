import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('rcp_token');
    const storedUser  = localStorage.getItem('rcp_usuario');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('rcp_token');
        localStorage.removeItem('rcp_usuario');
      }
    }
    setLoading(false);
  }, []);

  function login(newToken, usuario) {
    localStorage.setItem('rcp_token', newToken);
    localStorage.setItem('rcp_usuario', JSON.stringify(usuario));
    setToken(newToken);
    setUser(usuario);
  }

  function logout() {
    localStorage.removeItem('rcp_token');
    localStorage.removeItem('rcp_usuario');
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
      isSuperAdmin: user?.papel === 'admin',
      isManager: user?.papel === 'admin' || user?.papel === 'imobiliaria',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
