import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Maximize2,
  Minimize2,
  Loader2,
  BookmarkCheck
} from 'lucide-react';

// Configurar o worker do PDF.js usando arquivo local
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  apostilaId?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title, apostilaId }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Carregar última página vista do localStorage
  const getStorageKey = () => {
    const user = localStorage.getItem('auth_user');
    const userId = user ? JSON.parse(user).id : 'guest';
    return `pdf_progress_${userId}_${apostilaId}`;
  };

  const getSavedPage = (): number => {
    if (!apostilaId) return 1;
    try {
      const saved = localStorage.getItem(getStorageKey());
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  };

  const [pageNumber, setPageNumber] = useState<number>(getSavedPage());
  const [showProgressRestored, setShowProgressRestored] = useState<boolean>(false);
  
  // Calcular scale inicial baseado na largura
  const getInitialScale = (width: number) => {
    if (width < 640) return 0.4; // Mobile pequeno
    if (width < 768) return 0.5; // Mobile
    if (width < 1024) return 0.7; // Tablet
    return 1.0; // Desktop
  };

  const [scale, setScale] = useState<number>(() => 
    typeof window !== 'undefined' ? getInitialScale(window.innerWidth) : 1.0
  );

  // Mostrar notificação se progresso foi restaurado
  useEffect(() => {
    const savedPage = getSavedPage();
    if (savedPage > 1) {
      setShowProgressRestored(true);
      setTimeout(() => setShowProgressRestored(false), 3000);
    }
  }, []);

  // Atualizar apenas containerWidth no resize, não o scale
  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(window.innerWidth);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Salvar progresso quando a página mudar
  useEffect(() => {
    if (!apostilaId || pageNumber === 0) return;
    
    try {
      localStorage.setItem(getStorageKey(), pageNumber.toString());
      console.log(`Progresso salvo: Página ${pageNumber} da apostila ${apostilaId}`);
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  }, [pageNumber, apostilaId]);

  console.log('PDFViewer - pdfUrl:', pdfUrl);
  console.log('PDFViewer - title:', title);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF carregado com sucesso! Páginas:', numPages);
    setNumPages(numPages);
    setIsLoading(false);
    
    // Salvar número real de páginas do PDF
    if (apostilaId) {
      const user = localStorage.getItem('auth_user');
      const userId = user ? JSON.parse(user).id : 'guest';
      const pagesKey = `pdf_real_pages_${userId}_${apostilaId}`;
      localStorage.setItem(pagesKey, numPages.toString());
      console.log(`Páginas reais salvas: ${numPages} para apostila ${apostilaId}`);
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Erro ao carregar PDF:', error);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'apostila.pdf';
    link.click();
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full'}`}>
      {/* Notificação de progresso restaurado */}
      <AnimatePresence>
        {showProgressRestored && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span className="text-sm font-medium">Continuando da página {pageNumber}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-2 md:p-4 bg-card border-b border-border">
        {/* Navegação de páginas */}
        <div className="flex items-center gap-1 md:gap-2 w-full md:w-auto justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="gap-1 h-8 px-2 md:px-3"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          
          <div className="px-2 md:px-4 py-1 md:py-2 bg-secondary rounded-lg">
            <span className="text-xs md:text-sm font-medium whitespace-nowrap">
              {pageNumber} / {numPages || '...'}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="gap-1 h-8 px-2 md:px-3"
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Controles de zoom e ações */}
        <div className="flex items-center gap-1 md:gap-2 w-full md:w-auto justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="h-8 px-2"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-xs md:text-sm font-medium px-2 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="h-8 px-2"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1 hidden md:block" />

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 px-2 hidden md:flex"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-1 md:gap-2 h-8 px-2 md:px-3"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Baixar</span>
          </Button>
        </div>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto bg-secondary/30 p-4">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="shadow-2xl rounded-lg overflow-hidden bg-white"
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-10 md:p-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="ml-2 text-sm md:text-base">Carregando PDF...</p>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center p-10 md:p-20 text-destructive">
                  <p className="text-sm md:text-base">Erro ao carregar PDF.</p>
                  <p className="text-xs md:text-sm mt-2 break-all px-4">URL: {pdfUrl}</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                width={containerWidth < 768 ? Math.min(containerWidth - 32, 600) : undefined}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="flex items-center justify-center p-10 md:p-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                }
              />
            </Document>
          </motion.div>
        </div>
      </div>

      {/* Page Navigation (Bottom) - Hidden on mobile */}
      <div className="hidden md:flex items-center justify-center gap-2 p-4 bg-card border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPageNumber(1)}
          disabled={pageNumber === 1}
        >
          Primeira
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(numPages, 10) }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={pageNumber === page ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPageNumber(page)}
              className="w-10 h-10"
            >
              {page}
            </Button>
          ))}
          {numPages > 10 && (
            <span className="text-muted-foreground px-2">...</span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPageNumber(numPages)}
          disabled={pageNumber === numPages}
        >
          Última
        </Button>
      </div>
    </div>
  );
};

export default PDFViewer;
