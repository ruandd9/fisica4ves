import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Apostila } from '@/data/apostilas';
import { apostilasAPI, purchasesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import PDFViewerModal from '@/components/PDFViewerModal';
import { 
  BookOpen, 
  Download, 
  Clock, 
  Star, 
  ShoppingBag,
  ChevronRight,
  Play,
  FileText,
  Calendar,
  CreditCard,
  X,
  Shield
} from 'lucide-react';

interface Purchase {
  _id: string;
  apostila: any;
  price: number;
  purchaseDate: string;
  paymentMethod: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedApostila, setSelectedApostila] = useState<Apostila | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [purchasedApostilas, setPurchasedApostilas] = useState<Apostila[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingApostilas, setLoadingApostilas] = useState(true);
  const [activeTab, setActiveTab] = useState<'apostilas' | 'compras'>('apostilas');
  const [hasUnreadPurchases, setHasUnreadPurchases] = useState(false);
  const [totalPagesRead, setTotalPagesRead] = useState(0);

  // Calcular total de páginas lidas
  const calculateTotalPagesRead = () => {
    if (!user || purchasedApostilas.length === 0) return 0;
    
    let total = 0;
    purchasedApostilas.forEach((apostila) => {
      const storageKey = `pdf_progress_${user.id}_${apostila.id}`;
      const savedPage = localStorage.getItem(storageKey);
      if (savedPage) {
        total += parseInt(savedPage, 10);
      }
    });
    
    return total;
  };

  // Calcular total de páginas reais de todas apostilas
  const calculateTotalPages = () => {
    if (!user || purchasedApostilas.length === 0) return 0;
    
    let total = 0;
    purchasedApostilas.forEach((apostila) => {
      const pagesKey = `pdf_real_pages_${user.id}_${apostila.id}`;
      const realPages = localStorage.getItem(pagesKey);
      total += realPages ? parseInt(realPages, 10) : apostila.pages;
    });
    
    return total;
  };

  // Verificar se há compras não lidas
  useEffect(() => {
    if (purchases.length > 0) {
      const lastViewedTime = localStorage.getItem('lastViewedPurchases');
      const latestPurchaseTime = new Date(purchases[0].purchaseDate).getTime();
      
      if (!lastViewedTime || latestPurchaseTime > parseInt(lastViewedTime)) {
        setHasUnreadPurchases(true);
      }
    }
  }, [purchases]);

  // Marcar compras como lidas quando visualizar a tab
  useEffect(() => {
    if (activeTab === 'compras' && hasUnreadPurchases) {
      const now = Date.now();
      localStorage.setItem('lastViewedPurchases', now.toString());
      setHasUnreadPurchases(false);
    }
  }, [activeTab, hasUnreadPurchases]);

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
            topics: a.topics,
            pdfUrl: a.pdfUrl
          }));
        
        setPurchasedApostilas(purchased);
        
        // Calcular páginas lidas após carregar apostilas
        setTimeout(() => {
          const total = calculateTotalPagesRead();
          setTotalPagesRead(total);
        }, 100);
      } catch (error) {
        console.error('Erro ao buscar apostilas compradas:', error);
      } finally {
        setLoadingApostilas(false);
      }
    };

    fetchPurchasedApostilas();
  }, [user]);

  // Atualizar páginas lidas quando o viewer fechar
  useEffect(() => {
    if (!isViewerOpen && purchasedApostilas.length > 0) {
      const total = calculateTotalPagesRead();
      setTotalPagesRead(total);
    }
  }, [isViewerOpen, purchasedApostilas]);

  // Fetch purchases history
  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;
      
      try {
        const response = await purchasesAPI.getUserPurchases();
        const data = response.data.data || [];
        setPurchases(data);
      } catch (error) {
        console.error('Erro ao buscar histórico de compras:', error);
      }
    };

    fetchPurchases();
  }, [user]);

  // Check if coming from a specific apostila
  React.useEffect(() => {
    const apostilaId = searchParams.get('apostila');
    if (apostilaId && purchasedApostilas.length > 0) {
      const found = purchasedApostilas.find((a) => a.id === apostilaId);
      if (found) {
        // Garantir que está na tab de apostilas
        setActiveTab('apostilas');
        // Scroll suave até a seção
        setTimeout(() => {
          const element = document.getElementById(`apostila-${apostilaId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight temporário
            element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
            }, 2000);
          }
        }, 100);
      }
    }
  }, [searchParams, purchasedApostilas]);

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
          <div className="mb-8 animate-fade-in flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Olá, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-muted-foreground">
                Acesse suas apostilas adquiridas e continue seus estudos
              </p>
            </div>
            {user.isAdmin && (
              <Button
                onClick={() => window.location.href = '/admin'}
                className="gap-2 gradient-primary text-primary-foreground"
              >
                <Shield className="w-4 h-4" />
                Painel Admin
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: BookOpen, label: 'Apostilas', value: purchasedApostilas.length },
              { icon: Clock, label: 'Horas estudadas', value: Math.floor(totalPagesRead / 10) + 'h' },
              { icon: FileText, label: 'Páginas lidas', value: totalPagesRead },
              { icon: Star, label: 'Progresso', value: purchasedApostilas.length > 0 ? Math.round((totalPagesRead / calculateTotalPages()) * 100) + '%' : '0%' },
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

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab('apostilas')}
              className={`pb-3 px-4 font-medium transition-colors relative ${
                activeTab === 'apostilas'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Minhas Apostilas
              {activeTab === 'apostilas' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('compras')}
              className={`pb-3 px-4 font-medium transition-colors relative ${
                activeTab === 'compras'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShoppingBag className="w-4 h-4 inline mr-2" />
              Minhas Compras
              {hasUnreadPurchases && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {purchases.length}
                </span>
              )}
              {activeTab === 'compras' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Content - Apostilas */}
          {activeTab === 'apostilas' && purchasedApostilas.length > 0 && (
            <div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedApostilas.map((apostila, index) => (
                  <div
                    key={apostila.id}
                    id={`apostila-${apostila.id}`}
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
                        {(() => {
                          const storageKey = `pdf_progress_${user.id}_${apostila.id}`;
                          const pagesKey = `pdf_real_pages_${user.id}_${apostila.id}`;
                          const savedPage = localStorage.getItem(storageKey);
                          const realPages = localStorage.getItem(pagesKey);
                          const currentPage = savedPage ? parseInt(savedPage, 10) : 0;
                          const totalPages = realPages ? parseInt(realPages, 10) : apostila.pages;
                          const progress = Math.round((currentPage / totalPages) * 100);
                          
                          return (
                            <>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Progresso</span>
                                <span className="text-primary font-medium">{progress}%</span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full gradient-primary rounded-full transition-all duration-500" 
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </>
                          );
                        })()}
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
                          onClick={() => {
                            if (apostila.pdfUrl) {
                              const link = document.createElement('a');
                              link.href = apostila.pdfUrl;
                              link.download = `${apostila.title}.pdf`;
                              link.click();
                            }
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State - Apostilas */}
          {activeTab === 'apostilas' && purchasedApostilas.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
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

          {/* Content - Compras */}
          {activeTab === 'compras' && purchases.length > 0 && (
            <div>
              <div className="space-y-4">
                {purchases.map((purchase, index) => {
                  const isNew = hasUnreadPurchases && index === 0;
                  return (
                    <div
                      key={purchase._id}
                      className={`bg-card rounded-2xl border p-6 hover:shadow-lg transition-all duration-300 ${
                        isNew ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">
                                  {purchase.apostila?.title || 'Apostila'}
                                </h3>
                                {isNew && (
                                  <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full animate-pulse">
                                    NOVA
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {purchase.apostila?.category}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(purchase.purchaseDate).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              {purchase.paymentMethod === 'stripe' ? 'Cartão de Crédito' : 'Simulado'}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                purchase.status === 'completed' 
                                  ? 'bg-success/10 text-success' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {purchase.status === 'completed' ? 'Concluído' : purchase.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            R$ {purchase.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State - Compras */}
          {activeTab === 'compras' && purchases.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Nenhuma compra realizada
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Você ainda não realizou nenhuma compra. Explore nosso catálogo!
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl gap-2"
                  onClick={() => {
                    if (selectedApostila?.pdfUrl) {
                      const link = document.createElement('a');
                      link.href = selectedApostila.pdfUrl;
                      link.download = `${selectedApostila.title}.pdf`;
                      link.click();
                    }
                  }}
                >
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

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        apostila={selectedApostila}
      />
    </div>
  );
};

export default Dashboard;
