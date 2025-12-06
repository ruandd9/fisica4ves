import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apostilas, Apostila } from '@/data/apostilas';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import FloatingElements from '@/components/FloatingElements';
import PurchaseModal from '@/components/PurchaseModal';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  BookOpen, 
  ShoppingCart, 
  Check, 
  ArrowLeft, 
  FileText,
  Clock,
  Globe,
  TrendingUp,
  Award,
  Users,
  Download,
  Play,
  Lock
} from 'lucide-react';

const ApostilaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPurchased } = useAuth();
  const [apostila, setApostila] = useState<Apostila | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isPurchased = apostila ? hasPurchased(apostila.id) : false;

  useEffect(() => {
    const found = apostilas.find(a => a.id === id);
    if (found) {
      setApostila(found);
    } else {
      navigate('/catalogo');
    }
  }, [id, navigate]);

  if (!apostila) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const discount = apostila.originalPrice 
    ? Math.round(((apostila.originalPrice - apostila.price) / apostila.originalPrice) * 100)
    : 0;

  const handlePurchase = () => {
    if (!user) {
      navigate('/login');
    } else {
      setShowPurchaseModal(true);
    }
  };

  const handleAccess = () => {
    navigate(`/dashboard?apostila=${apostila.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <FloatingElements />
        
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </motion.button>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Cover Image with 3D Effect */}
            <ScrollReveal direction="left" scale>
              <motion.div 
                className="relative group perspective-1000"
                whileHover={{ rotateY: 5, rotateX: -5 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <motion.img
                    src={apostila.cover}
                    alt={apostila.title}
                    className="w-full aspect-[3/4] object-cover"
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: imageLoaded ? 1 : 0 }}
                    onLoad={() => setImageLoaded(true)}
                  />
                  
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10" />
                  
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <motion.div 
                      className="absolute top-6 left-6 px-4 py-2 bg-destructive text-destructive-foreground text-lg font-bold rounded-full shadow-xl"
                      initial={{ scale: 0, rotate: -12 }}
                      animate={{ scale: 1, rotate: -6 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
                    >
                      -{discount}% OFF
                    </motion.div>
                  )}

                  {/* Purchased Badge */}
                  {isPurchased && (
                    <motion.div 
                      className="absolute top-6 right-6 px-4 py-2 bg-success text-success-foreground text-lg font-bold rounded-full shadow-xl flex items-center gap-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check className="w-5 h-5" />
                      Adquirido
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Content */}
            <div className="space-y-6">
              <ScrollReveal delay={0.1}>
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                  {apostila.category}
                </span>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
                  {apostila.title}
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(apostila.rating) ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} 
                      />
                    ))}
                    <span className="ml-2 font-bold text-lg">{apostila.rating}</span>
                  </div>
                  <span className="text-muted-foreground">|</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span>{apostila.reviews} avaliações</span>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {apostila.longDescription || apostila.description}
                </p>
              </ScrollReveal>

              {/* Author & Info */}
              <ScrollReveal delay={0.5}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <FileText className="w-5 h-5 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Páginas</p>
                    <p className="font-bold text-foreground">{apostila.pages}</p>
                  </div>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <Clock className="w-5 h-5 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Atualização</p>
                    <p className="font-bold text-foreground text-sm">{apostila.lastUpdate}</p>
                  </div>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <Globe className="w-5 h-5 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Idioma</p>
                    <p className="font-bold text-foreground">{apostila.language}</p>
                  </div>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <TrendingUp className="w-5 h-5 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Nível</p>
                    <p className="font-bold text-foreground text-sm">{apostila.level}</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Author */}
              {apostila.author && (
                <ScrollReveal delay={0.6}>
                  <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                      {apostila.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Autor(a)</p>
                      <p className="font-bold text-foreground">{apostila.author}</p>
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Price & CTA */}
              <ScrollReveal delay={0.7}>
                <div className="p-6 bg-card rounded-2xl border border-border shadow-lg space-y-4">
                  <div className="flex items-end gap-3">
                    {apostila.originalPrice && (
                      <span className="text-2xl text-muted-foreground line-through">
                        R$ {apostila.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      R$ {apostila.price.toFixed(2)}
                    </span>
                  </div>

                  {isPurchased ? (
                    <div className="flex gap-3">
                      <Button
                        onClick={handleAccess}
                        size="lg"
                        className="flex-1 gap-2 bg-success hover:bg-success/90 text-success-foreground rounded-xl h-14 text-lg font-bold"
                      >
                        <BookOpen className="w-5 h-5" />
                        Acessar Material
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 rounded-xl h-14"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        onClick={handlePurchase}
                        size="lg"
                        className="w-full gap-2 gradient-primary text-primary-foreground rounded-xl h-14 text-lg font-bold shadow-lg hover:shadow-glow transition-all"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Comprar Agora
                      </Button>
                      <p className="text-sm text-center text-muted-foreground">
                        Acesso imediato após confirmação do pagamento
                      </p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              O que você vai aprender
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apostila.topics?.map((topic, index) => (
              <ScrollReveal key={index} delay={index * 0.1} direction="up">
                <motion.div 
                  className="p-6 bg-card rounded-2xl border border-border shadow-md"
                  whileHover={{ y: -5, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{topic}</h3>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center text-foreground mb-4">
              Recursos Inclusos
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Tudo o que você precisa para dominar o conteúdo e garantir sua aprovação
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {apostila.features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.1} scale>
                <motion.div 
                  className="p-6 text-center bg-gradient-to-br from-card to-secondary/50 rounded-2xl border border-border"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-bold text-foreground">{feature}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isPurchased && (
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-90" />
          <FloatingElements className="opacity-30" />
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto text-white">
                <h2 className="text-4xl font-extrabold mb-4">
                  Pronto para começar?
                </h2>
                <p className="text-xl opacity-90 mb-8">
                  Garanta já seu acesso e comece a estudar agora mesmo!
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={handlePurchase}
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 rounded-xl h-14 px-8 text-lg font-bold shadow-xl gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Comprar por R$ {apostila.price.toFixed(2)}
                  </Button>
                  {apostila.originalPrice && (
                    <span className="text-white/80 line-through">
                      De R$ {apostila.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      <Footer />

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        apostila={apostila}
      />
    </div>
  );
};

export default ApostilaDetails;
