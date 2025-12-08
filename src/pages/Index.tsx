import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApostilaCard from '@/components/ApostilaCard';
import FloatingElements from '@/components/FloatingElements';
import { Button } from '@/components/ui/button';
import { apostilas } from '@/data/apostilas';
import { 
  ArrowRight, 
  BookOpen, 
  Shield, 
  Zap, 
  Award, 
  Users,
  CheckCircle,
  Star
} from 'lucide-react';

const Index: React.FC = () => {
  // Reorganizar apostilas em destaque: Física no centro, outras duas com "em breve"
  const featuredApostilas = [
    { ...apostilas[0], isComingSoon: true }, // Matemática - em breve
    apostilas[6], // Física - disponível (posição central)
    { ...apostilas[1], isComingSoon: true }, // Português - em breve
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <FloatingElements />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              Materiais atualizados 2026
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 animate-fade-in-up">
              Estude com os
              <span className="text-primary block mt-2">melhores materiais</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Apostilas completas, atualizadas e desenvolvidas por especialistas 
              para sua aprovação em concursos e vestibulares.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/catalogo">
                <Button size="lg" className="gradient-primary text-primary-foreground px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-glow transition-all">
                  Ver Catálogo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-2xl border-2">
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-center">
                <div className="stat-glow">
                  <p className="text-4xl md:text-5xl font-extrabold stat-number animate-float">15k+</p>
                </div>
                <p className="text-muted-foreground text-sm mt-3">Alunos aprovados</p>
              </div>
              <div className="text-center">
                <div className="stat-glow">
                  <p className="text-4xl md:text-5xl font-extrabold stat-number animate-float-delayed">50+</p>
                </div>
                <p className="text-muted-foreground text-sm mt-3">Apostilas</p>
              </div>
              <div className="text-center">
                <div className="stat-glow">
                  <p className="text-4xl md:text-5xl font-extrabold stat-number animate-float-slow">4.9</p>
                </div>
                <p className="text-muted-foreground text-sm mt-3">Avaliação média</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que escolher a ApostilaPro?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Oferecemos a melhor experiência de estudo com materiais de qualidade comprovada.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Conteúdo Completo',
                description: 'Teoria + exercícios resolvidos em cada apostila',
              },
              {
                icon: Shield,
                title: 'Acesso Vitalício',
                description: 'Compre uma vez, acesse para sempre',
              },
              {
                icon: Zap,
                title: 'Atualizações Grátis',
                description: 'Receba todas as atualizações sem custo extra',
              },
              {
                icon: Award,
                title: 'Certificado',
                description: 'Ganhe certificado de conclusão dos estudos',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-background rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Apostilas em Destaque
              </h2>
              <p className="text-muted-foreground">
                Os materiais mais vendidos e bem avaliados
              </p>
            </div>
            <Link to="/catalogo" className="hidden md:block">
              <Button variant="outline" className="rounded-xl">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredApostilas.map((apostila, index) => {
              const isComingSoon = apostila.isComingSoon || false;

              // Card do meio (Física) usa o componente ApostilaCard original
              if (!isComingSoon) {
                return (
                  <ApostilaCard key={apostila.id} apostila={apostila} index={index} />
                );
              }

              // Cards laterais com efeito de inatividade
              return (
                <div 
                  key={apostila.id} 
                  className="animate-fade-in-up relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Card com efeito de inatividade */}
                  <div className="opacity-50 grayscale blur-[1px] pointer-events-none">
                    <ApostilaCard apostila={apostila} index={index} />
                  </div>

                  {/* Badge "Em breve" sobreposto */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-background/95 backdrop-blur-sm border-2 border-primary text-foreground px-6 py-3 rounded-2xl text-sm font-bold shadow-lg">
                      Em breve
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link to="/catalogo">
              <Button variant="outline" className="rounded-xl">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que nossos alunos dizem
            </h2>
            <p className="text-muted-foreground">
              Milhares de aprovados em todo o Brasil
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Maria Silva',
                role: 'Aprovada no TRT',
                text: 'Material excelente! Consegui minha aprovação estudando apenas com as apostilas da ApostilaPro.',
              },
              {
                name: 'João Santos',
                role: 'Aprovado na Polícia Federal',
                text: 'Conteúdo didático e exercícios muito bem elaborados. Recomendo a todos!',
              },
              {
                name: 'Ana Costa',
                role: 'Aprovada no ENEM',
                text: 'As apostilas são completas e atualizadas. Tirei nota máxima na redação!',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-background rounded-2xl border border-border"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-warning fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden gradient-primary rounded-3xl p-8 md:p-12 text-center">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-foreground/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-foreground/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Comece a estudar hoje mesmo!
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Crie sua conta gratuitamente e tenha acesso a materiais de amostra. 
                Sua aprovação está a um clique de distância.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/cadastro">
                  <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-6 text-lg rounded-2xl">
                    Criar Conta Grátis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center gap-6 mt-8 text-primary-foreground/80 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Acesso imediato
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
