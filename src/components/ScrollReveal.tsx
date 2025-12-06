import React from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  scale?: boolean;
  rotate?: boolean;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.6,
  scale = false,
  rotate = false,
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 60 };
      case 'down': return { y: -60 };
      case 'left': return { x: 60 };
      case 'right': return { x: -60 };
      case 'none': return {};
      default: return { y: 60 };
    }
  };

  const variants = {
    hidden: {
      opacity: 0,
      ...getInitialPosition(),
      scale: scale ? 0.8 : 1,
      rotateX: rotate ? 15 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
