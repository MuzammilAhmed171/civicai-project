import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civicai_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (e) {
      console.error('Failed to verify token:', e);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: authToken, ...userDataRes } = res.data;
    localStorage.setItem('civicai_token', authToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    setToken(authToken);
    setUser(userDataRes);
    return res.data;
  };

  const login = async (identity, password) => {
    const res = await api.post('/auth/login', { identity, password });
    const { token: authToken, ...userDataRes } = res.data;
    localStorage.setItem('civicai_token', authToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    setToken(authToken);
    setUser(userDataRes);
    return res.data;
  };

  const adminLogin = async (username, password) => {
    const res = await api.post('/auth/admin-login', { username, password });
    const { token: authToken, ...userDataRes } = res.data;
    localStorage.setItem('civicai_token', authToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    setToken(authToken);
    setUser(userDataRes);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('civicai_token');
    delete api.defaults.headers.common['Authorization'];
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        adminLogin,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
