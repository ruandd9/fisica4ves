import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, purchasesAPI } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  purchasedApostilas: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  purchaseApostila: (apostilaId: string) => void;
  hasPurchased: (apostilaId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      
      if (response.data.success) {
        const { token: authToken, ...userData } = response.data.data;
        
        const userWithPurchases: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          purchasedApostilas: userData.purchasedApostilas || [],
        };
        
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userWithPurchases));
        
        setUser(userWithPurchases);
        setToken(authToken);
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: 'Email ou senha incorretos' };
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || 'Erro ao conectar com o servidor';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(name, email, password);
      
      if (response.data.success) {
        const { token: authToken, ...userData } = response.data.data;
        
        const newUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          purchasedApostilas: userData.purchasedApostilas || [],
        };
        
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        
        setUser(newUser);
        setToken(authToken);
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: 'Erro ao criar conta' };
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Erro ao criar conta';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
  };

  const purchaseApostila = async (apostilaId: string) => {
    if (user) {
      try {
        // Nota: Este método não é mais usado diretamente
        // A compra agora é feita através do PurchaseModal com Stripe
        // Mantido para compatibilidade, mas recomenda-se usar o fluxo do modal
        
        const updatedUser = {
          ...user,
          purchasedApostilas: [...user.purchasedApostilas, apostilaId],
        };
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Erro ao realizar compra:', error);
        throw error;
      }
    }
  };

  const hasPurchased = (apostilaId: string): boolean => {
    return user?.purchasedApostilas.includes(apostilaId) || false;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, purchaseApostila, hasPurchased }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
