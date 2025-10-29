import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminAPI } from '../services/api';

interface Admin {
  id: string;
  name: string;
  email: string;
  google2fa_enabled: boolean;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, otpCode?: string) => Promise<any>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from storage on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedAdmin = await AsyncStorage.getItem('admin');
      
      if (storedToken && storedAdmin) {
        setToken(storedToken);
        setAdmin(JSON.parse(storedAdmin));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, otpCode?: string) => {
    try {
      const response = await adminAPI.login({ email, password, otp_code: otpCode });
      
      if (response.data.success) {
        const { token: newToken, admin: adminData } = response.data.data;
        
        await AsyncStorage.setItem('token', newToken);
        await AsyncStorage.setItem('admin', JSON.stringify(adminData));
        
        setToken(newToken);
        setAdmin(adminData);
        
        return response.data;
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      const response = await adminAPI.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await adminAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('admin');
      setToken(null);
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

