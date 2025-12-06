import React, { useState, useEffect } from 'react';
import { Apostila } from '@/data/apostilas';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { X, CreditCard, Check, Loader2, ShieldCheck, BookOpen } from 'lucide-react';
import { purchasesAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { StripePaymentForm } from './StripePaymentForm';

interface PurchaseModalProps {
  apostila: Apostila | null;
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ apostila, isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [useStripe, setUseStripe] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const stripePromise = getStripe();

  if (!isOpen || !apostila) return null;

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para comprar.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      if (useStripe) {
        // Criar Payment Intent e mostrar formulário Stripe
        const response = await purchasesAPI.createPaymentIntent(apostila.id);
        setClientSecret(response.data.clientSecret);
        setShowStripeForm(true);
        setIsProcessing(false);
      } else {
        // Fluxo simulado (sem Stripe)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockPaymentIntentId = `mock_${Date.now()}`;
        await purchasesAPI.confirmPurchase(apostila.id, mockPaymentIntentId);
        
        handleSuccess();
      }
      
    } catch (error: any) {
      console.error('Erro na compra:', error);
      toast({
        title: 'Erro na compra',
        description: error.response?.data?.message || 'Não foi possível processar a compra.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const handleSuccess = () => {
    // Atualizar usuário no contexto
    if (user && apostila) {
      const updatedUser = {
        ...user,
        purchasedApostilas: [...user.purchasedApostilas, apostila.id],
      };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
    
    setIsSuccess(true);
    
    toast({
      title: 'Compra realizada!',
      description: `Você adquiriu "${apostila.title}" com sucesso.`,
    });
    
    // Auto close after success
    setTimeout(() => {
      setIsSuccess(false);
      setShowStripeForm(false);
      setClientSecret(null);
      onClose();
      window.location.reload();
    }, 2000);
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    try {
      await purchasesAPI.confirmPurchase(apostila!.id, paymentIntentId);
      handleSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro ao confirmar compra',
        description: error.response?.data?.message || 'Erro ao confirmar compra.',
        variant: 'destructive',
      });
    }
  };

  const handleStripeError = (error: string) => {
    toast({
      title: 'Erro no pagamento',
      description: error,
      variant: 'destructive',
    });
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-3xl shadow-xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {isSuccess ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Compra Realizada!</h3>
            <p className="text-muted-foreground">
              Sua apostila já está disponível na área do aluno.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 pb-0">
              <h3 className="text-xl font-bold text-foreground mb-1">Confirmar Compra</h3>
              <p className="text-muted-foreground text-sm">Revise os detalhes antes de confirmar</p>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="flex gap-4 p-4 bg-secondary/50 rounded-2xl mb-6">
                <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-primary/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2">
                    {apostila.title}
                  </h4>
                  <p className="text-muted-foreground text-xs">{apostila.pages} páginas</p>
                  <p className="text-primary font-bold text-lg mt-1">
                    R$ {apostila.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Stripe Payment Form */}
              {showStripeForm && clientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    amount={apostila.price}
                    onSuccess={handleStripeSuccess}
                    onError={handleStripeError}
                    onCancel={() => {
                      setShowStripeForm(false);
                      setClientSecret(null);
                    }}
                  />
                </Elements>
              ) : (
                <>
                  {/* Payment Method */}
              <div className="border border-border rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Método de Pagamento</span>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-secondary rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      checked={!useStripe}
                      onChange={() => setUseStripe(false)}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Pagamento Simulado</div>
                      <div className="text-xs text-muted-foreground">Para testes (sem cobrança real)</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 bg-secondary rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      checked={useStripe}
                      onChange={() => setUseStripe(true)}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Stripe (Modo Teste)</div>
                      <div className="text-xs text-muted-foreground">Pagamento via Stripe Test</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-6">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Pagamento seguro com criptografia SSL</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="flex-1 gradient-primary text-primary-foreground rounded-xl shadow-md hover:shadow-glow"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    `Pagar R$ ${apostila.price.toFixed(2)}`
                  )}
                </Button>
              </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PurchaseModal;
