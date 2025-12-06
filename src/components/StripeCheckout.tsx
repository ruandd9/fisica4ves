import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { purchasesAPI } from '@/services/api';
import { getStripe } from '@/lib/stripe';
import { Loader2, CreditCard } from 'lucide-react';

interface StripeCheckoutProps {
  apostilaId: string;
  apostilaTitle: string;
  price: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StripeCheckout = ({ 
  apostilaId, 
  apostilaTitle, 
  price, 
  onSuccess, 
  onCancel 
}: StripeCheckoutProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      // Criar Payment Intent
      const response = await purchasesAPI.createPaymentIntent(apostilaId);
      const { clientSecret } = response.data;

      // Obter instância do Stripe
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe não foi carregado');
      }

      // Redirecionar para checkout do Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // Aqui você pode adicionar elementos do Stripe Elements
            // Por enquanto, vamos usar um método simplificado
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirmar compra no backend
        await purchasesAPI.confirmPurchase(apostilaId, paymentIntent.id);
        
        toast({
          title: 'Compra realizada!',
          description: `Você adquiriu "${apostilaTitle}" com sucesso.`,
        });
        
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro no checkout:', error);
      toast({
        title: 'Erro no pagamento',
        description: error.message || 'Não foi possível processar o pagamento.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Resumo da Compra</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{apostilaTitle}</span>
          <span className="font-bold">R$ {price.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pagar com Stripe
            </>
          )}
        </Button>

        <Button
          onClick={onCancel}
          disabled={isProcessing}
          variant="outline"
          className="w-full"
        >
          Cancelar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Pagamento seguro processado pelo Stripe
      </p>
    </div>
  );
};
