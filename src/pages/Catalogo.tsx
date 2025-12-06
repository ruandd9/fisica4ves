import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApostilaCard from '@/components/ApostilaCard';
import PurchaseModal from '@/components/PurchaseModal';
import { categories, Apostila } from '@/data/apostilas';
import { apostilasAPI } from '@/services/api';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Catalogo: React.FC = () => {
  const { toast } = useToast();
  const [apostilas, setApostilas] = useState<Apostila[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApostila, setSelectedApostila] = useState<Apostila | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  useEffect(() => {
    const fetchApostilas = async () => {
      try {
        const response = await apostilasAPI.getAll();
        console.log('🔍 Response do backend:', response.data);
        const data = response.data.data || response.data.apostilas || [];
        console.log('📦 Dados recebidos:', data);
        
        // Mapear dados do backend para formato do frontend
        const mapped = data.map((a: any) => ({
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
        
        console.log('✅ Apostilas mapeadas:', mapped);
        setApostilas(mapped);
      } catch (error) {
        console.error('❌ Erro ao buscar apostilas:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as apostilas.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApostilas();
  }, []);

  const filteredApostilas = useMemo(() => {
    let result = [...apostilas];
    console.log('📚 Total apostilas:', apostilas.length, 'Categoria selecionada:', selectedCategory);

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'Todos') {
      result = result.filter((a) => a.category === selectedCategory);
    }
    
    console.log('✅ Apostilas filtradas:', result.length);

    // Sort
    switch (sortBy) {
      case 'price':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [apostilas, searchQuery, selectedCategory, sortBy]);

  const handlePurchase = (apostila: Apostila) => {
    setSelectedApostila(apostila);
    setIsPurchaseModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando apostilas...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="gradient-hero py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Catálogo de Apostilas
              </h1>
              <p className="text-muted-foreground mb-8">
                Encontre o material ideal para seus estudos
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar apostilas..."
                  className="w-full pl-12 pr-12 py-4 bg-card rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-lg border border-border"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Categories & Filter Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'gradient-primary text-primary-foreground shadow-md'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Filter Button */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-card rounded-2xl border border-border p-6 mb-8 animate-fade-in">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-4 py-2 bg-secondary rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="rating">Melhor avaliados</option>
                      <option value="price">Menor preço</option>
                      <option value="name">Nome (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Results Count */}
            <p className="text-muted-foreground text-sm mb-6">
              {filteredApostilas.length} apostila{filteredApostilas.length !== 1 ? 's' : ''} encontrada{filteredApostilas.length !== 1 ? 's' : ''}
            </p>

            {/* Products Grid */}
            {filteredApostilas.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredApostilas.map((apostila, index) => (
                  <ApostilaCard 
                    key={apostila.id} 
                    apostila={apostila} 
                    onPurchase={handlePurchase}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nenhuma apostila encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar sua busca ou filtros
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todos');
                  }}
                  className="rounded-xl"
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Purchase Modal */}
      <PurchaseModal
        apostila={selectedApostila}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </div>
  );
};

export default Catalogo;
