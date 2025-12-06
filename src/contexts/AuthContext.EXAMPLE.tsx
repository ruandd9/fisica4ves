// EXEMPLO DE COMO ATUALIZAR O AuthContext PARA USAR API REAL
// Copie este código para src/contexts/AuthContext.tsx

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
  purchaseApostila: (apostilaId: string) => Promise<{ success: boolean; error?: string }>;
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
      
      // Validar token com backend
      authAPI.getMe()
        .then(response => {
          if (response.data.success) {
            setUser(response.data.data);
            localStorage.setItem('auth_user', JSON.stringify(response.data.data));
          }
        })
        .catch(() => {
          // Token inválido, fazer logout
          logout();
        });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      
      if (response.data.success) {
        const { token: authToken, ...userData } = response.data.data;
        
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        setUser(userData);
        setToken(authToken);
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: 'Erro ao fazer login' };
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
        
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        setUser(userData);
        setToken(authToken);
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: 'Erro ao criar conta' };
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || 'Erro ao criar conta';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
  };

  const purchaseApostila = async (apostilaId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Criar Payment Intent
      const paymentResponse = await purchasesAPI.createPaymentIntent(apostilaId);
      
      if (!paymentResponse.data.success) {
        return { success: false, error: 'Erro ao criar pagamento' };
      }
      
      // 2. Simular pagamento bem-sucedido (em produção, use Stripe Elements)
      const mockPaymentIntentId = `pi_mock_${Date.now()}`;
      
      // 3. Confirmar compra
      const confirmResponse = await purchasesAPI.confirmPurchase(apostilaId, mockPaymentIntentId);
      
      if (confirmResponse.data.success && user) {
        // Atualizar lista de apostilas compradas
        const updatedUser = {
          ...user,
          purchasedApostilas: [...user.purchasedApostilas, apostilaId],
        };
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        return { success: true };
      }
      
      return { success: false, error: 'Erro ao processar compra' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao processar compra';
      return { success: false, error: errorMessage };
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
