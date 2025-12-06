import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElementsProps {
  className?: string;
}

const FloatingElements: React.FC<FloatingElementsProps> = ({ className = '' }) => {
  const elements = [
    { size: 80, x: '10%', y: '20%', delay: 0, duration: 8 },
    { size: 60, x: '85%', y: '15%', delay: 1, duration: 10 },
    { size: 100, x: '75%', y: '70%', delay: 2, duration: 12 },
    { size: 40, x: '15%', y: '75%', delay: 0.5, duration: 9 },
    { size: 50, x: '50%', y: '85%', delay: 1.5, duration: 11 },
    { size: 70, x: '90%', y: '45%', delay: 0.8, duration: 7 },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm"
          style={{
            width: el.size,
            height: el.size,
            left: el.x,
            top: el.y,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Geometric shapes */}
      <motion.div
        className="absolute w-20 h-20 border-2 border-primary/20 rotate-45"
        style={{ left: '5%', top: '50%' }}
        animate={{ rotate: [45, 225, 45], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-16 h-16 border-2 border-accent/20"
        style={{ right: '10%', top: '30%', borderRadius: '30%' }}
        animate={{ rotate: [0, 360], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

export default FloatingElements;
