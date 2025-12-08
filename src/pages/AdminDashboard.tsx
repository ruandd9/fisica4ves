import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import axios from 'axios';
import { 
  Users, 
  BookOpen, 
  Plus,
  Trash2,
  Shield,
  Search
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  purchasedApostilas: string[];
  isAdmin: boolean;
  createdAt: string;
}

interface Apostila {
  _id: string;
  title: string;
  category: string;
  pages: number;
}

const AdminDashboard: React.FC = () => {
  const { user, isLoading, token } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [apostilas, setApostilas] = useState<Apostila[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
      fetchApostilas();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchApostilas = async () => {
    try {
      const response = await axios.get(`${API_URL}/apostilas`);
      setApostilas(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar apostilas:', error);
    }
  };

  const addApostilaToUser = async (userId: string, apostilaId: string) => {
    try {
      await axios.post(
        `${API_URL}/users/${userId}/apostilas`,
        { apostilaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({
        title: 'Sucesso!',
        description: 'Apostila adicionada ao usuário',
      });
      
      fetchUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível adicionar a apostila',
      });
    }
  };

  const removeApostilaFromUser = async (userId: string, apostilaId: string) => {
    try {
      await axios.delete(
        `${API_URL}/users/${userId}/apostilas/${apostilaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({
        title: 'Sucesso!',
        description: 'Apostila removida do usuário',
      });
      
      fetchUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível remover a apostila',
      });
    }
  };

  if (isLoading || loadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Painel Administrativo
              </h1>
              <p className="text-muted-foreground">
                Gerencie usuários e apostilas
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{users.length}</p>
                  <p className="text-muted-foreground text-sm">Usuários</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{apostilas.length}</p>
                  <p className="text-muted-foreground text-sm">Apostilas</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {users.filter(u => u.isAdmin).length}
                  </p>
                  <p className="text-muted-foreground text-sm">Administradores</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar usuário por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{u.name}</h3>
                      {u.isAdmin && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cadastrado em {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Apostilas do usuário */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Apostilas ({u.purchasedApostilas.length})
                  </p>
                  
                  {u.purchasedApostilas.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {u.purchasedApostilas.map((apostilaId) => {
                        const apostila = apostilas.find(a => a._id === apostilaId);
                        return (
                          <div
                            key={apostilaId}
                            className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg"
                          >
                            <span className="text-sm text-foreground">
                              {apostila?.title || 'Apostila'}
                            </span>
                            <button
                              onClick={() => removeApostilaFromUser(u._id, apostilaId)}
                              className="text-destructive hover:text-destructive/80 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Adicionar apostila */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {apostilas
                      .filter(a => !u.purchasedApostilas.includes(a._id))
                      .map((apostila) => (
                        <Button
                          key={apostila._id}
                          variant="outline"
                          size="sm"
                          onClick={() => addApostilaToUser(u._id, apostila._id)}
                          className="gap-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {apostila.title}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
