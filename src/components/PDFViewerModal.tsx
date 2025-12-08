import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PDFViewer from './PDFViewer';
import { Apostila } from '@/data/apostilas';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  apostila: Apostila | null;
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ isOpen, onClose, apostila }) => {
  console.log('PDFViewerModal - isOpen:', isOpen);
  console.log('PDFViewerModal - apostila:', apostila);
  console.log('PDFViewerModal - pdfUrl:', apostila?.pdfUrl);
  
  if (!isOpen) return null;
  
  if (!apostila) {
    console.warn('PDFViewerModal - Apostila não disponível');
    return null;
  }
  
  if (!apostila.pdfUrl) {
    console.warn('PDFViewerModal - pdfUrl não disponível para esta apostila');
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card rounded-3xl shadow-2xl p-8 max-w-md"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">PDF não disponível</h2>
            <p className="text-muted-foreground mb-6">
              Esta apostila ainda não possui um PDF disponível para visualização.
            </p>
            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-background rounded-2xl md:rounded-3xl shadow-2xl w-full md:w-[95vw] h-[100vh] md:h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-border bg-card">
              <div className="flex-1 min-w-0 mr-2">
                <h2 className="text-base md:text-xl font-bold text-foreground truncate">{apostila.title}</h2>
                <p className="text-xs md:text-sm text-muted-foreground truncate">{apostila.author}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full flex-shrink-0 h-8 w-8 md:h-10 md:w-10 p-0"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <PDFViewer pdfUrl={apostila.pdfUrl} title={apostila.title} apostilaId={apostila.id} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PDFViewerModal;
