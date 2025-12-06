import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Apostila } from '@/data/apostilas';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Star, BookOpen, Lock, Check, ShoppingCart, Eye } from 'lucide-react';
import Card3D from './Card3D';

interface ApostilaCardProps {
  apostila: Apostila;
  onPurchase?: (apostila: Apostila) => void;
  index?: number;
}

const ApostilaCard: React.FC<ApostilaCardProps> = ({ apostila, onPurchase, index = 0 }) => {
  const { user, hasPurchased } = useAuth();
  const navigate = useNavigate();
  const isPurchased = hasPurchased(apostila.id);
  
  const discount = apostila.originalPrice 
    ? Math.round(((apostila.originalPrice - apostila.price) / apostila.originalPrice) * 100)
    : 0;

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPurchased) {
      navigate(`/dashboard?apostila=${apostila.id}`);
    } else if (user) {
      onPurchase?.(apostila);
    } else {
      navigate('/login');
    }
  };

  const handleCardClick = () => {
    navigate(`/apostila/${apostila.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card3D className="group cursor-pointer" intensity={8}>
        <div 
          onClick={handleCardClick}
          className="relative bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Cover Image with 3D effect */}
          <div className="relative h-56 overflow-hidden">
            <motion.img
              src={apostila.cover}
              alt={apostila.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
            
            {/* Discount Badge */}
            {discount > 0 && (
              <motion.div 
                className="absolute top-3 left-3 px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full shadow-lg"
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
              >
                -{discount}% OFF
              </motion.div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-3 right-3 px-3 py-1.5 bg-card/95 backdrop-blur-md text-foreground text-xs font-semibold rounded-full shadow-md border border-border/50">
              {apostila.category}
            </div>

            {/* View Details Overlay */}
            <motion.div 
              className="absolute inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            >
              <motion.div
                className="flex items-center gap-2 text-primary-foreground font-semibold"
                initial={{ y: 20 }}
                whileHover={{ y: 0 }}
              >
                <Eye className="w-5 h-5" />
                Ver Detalhes
              </motion.div>
            </motion.div>

            {/* Purchased Overlay */}
            {isPurchased && (
              <div className="absolute inset-0 bg-success/30 backdrop-blur-[2px] flex items-center justify-center">
                <motion.div 
                  className="bg-success text-success-foreground px-5 py-2.5 rounded-full flex items-center gap-2 font-bold shadow-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Check className="w-5 h-5" />
                  Adquirido
                </motion.div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 space-y-4" style={{ transform: 'translateZ(20px)' }}>
            <div>
              <h3 className="font-bold text-foreground text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {apostila.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {apostila.description}
              </p>
            </div>

            {/* Rating & Pages */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(apostila.rating) ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} 
                    />
                  ))}
                </div>
                <span className="font-bold text-foreground">{apostila.rating}</span>
                <span className="text-muted-foreground">({apostila.reviews})</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{apostila.pages} págs</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2">
              {apostila.features.slice(0, 3).map((feature, idx) => (
                <motion.span
                  key={idx}
                  className="px-2.5 py-1 bg-secondary/80 text-secondary-foreground text-xs font-medium rounded-lg border border-border/50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  {feature}
                </motion.span>
              ))}
            </div>

            {/* Price & Action */}
            <div className="flex items-end justify-between pt-3 border-t border-border">
              <div className="space-y-0.5">
                {apostila.originalPrice && (
                  <span className="text-muted-foreground line-through text-sm block">
                    R$ {apostila.originalPrice.toFixed(2)}
                  </span>
                )}
                <p className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  R$ {apostila.price.toFixed(2)}
                </p>
              </div>
              
              <Button
                onClick={handleAction}
                size="lg"
                className={`gap-2 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                  isPurchased 
                    ? 'bg-success hover:bg-success/90 text-success-foreground hover:shadow-success/25 hover:shadow-xl'
                    : 'gradient-primary text-primary-foreground hover:shadow-glow hover:scale-105'
                }`}
              >
                {isPurchased ? (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Acessar
                  </>
                ) : user ? (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Comprar
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Ver mais
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
          </div>
        </div>
      </Card3D>
    </motion.div>
  );
};

export default ApostilaCard;
