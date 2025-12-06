import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Apostila } from '@/data/apostilas';
import { apostilasAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  BookOpen, 
  Download, 
  Eye, 
  Clock, 
  Star, 
  ShoppingBag,
  ChevronRight,
  Play,
  FileText,
  Lock,
  X
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isLoading, hasPurchased } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedApostila, setSelectedApostila] = useState<Apostila | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [purchasedApostilas, setPurchasedApostilas] = useState<Apostila[]>([]);
  const [loadingApostilas, setLoadingApostilas] = useState(true);

  // Fetch purchased apostilas
  useEffect(() => {
    const fetchPurchasedApostilas = async () => {
      if (!user) return;
      
      try {
        const response = await apostilasAPI.getAll();
        const allApostilas = response.data.data || [];
        
        // Filtrar apenas as compradas
        const purchased = allApostilas
          .filter((a: any) => user.purchasedApostilas.includes(a._id))
          .map((a: any) => ({
            id: a._id,
            title: a.title,
            description: a.description,
            longDescription: a.longDescription,
            price: a.price,
            originalPrice: a.originalPrice,
            category: a.category,
            cover: a.cover,
            pages: a.pages,
            rating: a.rating,
            reviews: a.reviews,
            features: a.features,
            author: a.author,
            lastUpdate: a.lastUpdate,
            language: a.language,
            level: a.level,
            topics: a.topics
          }));
        
        setPurchasedApostilas(purchased);
      } catch (error) {
        console.error('Erro ao buscar apostilas compradas:', error);
      } finally {
        setLoadingApostilas(false);
      }
    };

    fetchPurchasedApostilas();
  }, [user]);

  // Check if coming from a specific apostila
  React.useEffect(() => {
    const apostilaId = searchParams.get('apostila');
    if (apostilaId) {
      const found = apostilas.find((a) => a.id === apostilaId);
      if (found && hasPurchased(found.id)) {
        setSelectedApostila(found);
        setIsViewerOpen(true);
      }
    }
  }, [searchParams, hasPurchased]);

  if (isLoading || loadingApostilas) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Olá, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              Acesse suas apostilas adquiridas e continue seus estudos
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: BookOpen, label: 'Apostilas', value: purchasedApostilas.length },
              { icon: Clock, label: 'Horas estudadas', value: '12h' },
              { icon: FileText, label: 'Páginas lidas', value: '340' },
              { icon: Star, label: 'Progresso', value: '45%' },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl border border-border p-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-muted-foreground text-xs">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content */}
          {purchasedApostilas.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                Minhas Apostilas
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedApostilas.map((apostila, index) => (
                  <div
                    key={apostila.id}
                    className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Cover */}
                    <div className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-primary/30" />
                      </div>
                      <div className="absolute top-3 right-3 px-2 py-1 bg-success text-success-foreground text-xs font-medium rounded-full">
                        Adquirido
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                        {apostila.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {apostila.pages} páginas • {apostila.category}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="text-primary font-medium">30%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full w-[30%] gradient-primary rounded-full" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedApostila(apostila);
                            setIsViewerOpen(true);
                          }}
                          className="flex-1 gap-2 rounded-xl gradient-primary text-primary-foreground"
                        >
                          <Play className="w-4 h-4" />
                          Continuar
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-xl"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Nenhuma apostila ainda
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Você ainda não adquiriu nenhuma apostila. Explore nosso catálogo 
                e comece seus estudos hoje mesmo!
              </p>
              <Button
                onClick={() => window.location.href = '/catalogo'}
                className="gradient-primary text-primary-foreground rounded-xl gap-2"
              >
                Ver Catálogo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Viewer Modal */}
      {isViewerOpen && selectedApostila && (
        <div className="fixed inset-0 z-50 bg-background animate-fade-in">
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border z-10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsViewerOpen(false)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
                <div>
                  <h2 className="font-semibold text-foreground line-clamp-1">
                    {selectedApostila.title}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Página 1 de {selectedApostila.pages}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-card rounded-3xl border border-border p-8 md:p-12 shadow-xl">
              <div className="prose prose-lg max-w-none">
                <h1 className="text-3xl font-bold text-foreground mb-6">
                  {selectedApostila.title}
                </h1>
                
                <div className="bg-secondary/50 rounded-2xl p-6 mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Índice</h2>
                  <ol className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-medium">1.</span> Introdução
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-medium">2.</span> Conceitos Fundamentais
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-medium">3.</span> Exercícios Práticos
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-medium">4.</span> Questões Comentadas
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-medium">5.</span> Simulados
                    </li>
                  </ol>
                </div>

                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introdução</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Este material foi desenvolvido por especialistas com ampla experiência 
                  em concursos públicos. Aqui você encontrará teoria completa, exercícios 
                  resolvidos e questões comentadas para maximizar seu aprendizado.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Cada capítulo foi estruturado pensando na melhor forma de fixação do 
                  conteúdo, seguindo uma metodologia comprovada por milhares de aprovados.
                </p>

                {/* Placeholder for more content */}
                <div className="text-center py-8 border-t border-border mt-8">
                  <p className="text-muted-foreground">
                    Continue navegando pelo material...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
