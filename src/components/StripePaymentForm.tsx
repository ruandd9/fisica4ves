import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const StripePaymentForm = ({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onError,
  onCancel 
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Elemento do cartão não encontrado');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        onError(error.message || 'Erro ao processar pagamento');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (error: any) {
      onError(error.message || 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'hsl(var(--foreground))',
        '::placeholder': {
          color: 'hsl(var(--muted-foreground))',
        },
        backgroundColor: 'hsl(var(--background))',
      },
      invalid: {
        color: 'hsl(var(--destructive))',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Resumo da Compra</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-bold text-lg">R$ {amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Dados do Cartão</label>
        <div className="border border-border rounded-lg p-4 bg-background">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-muted-foreground">
          ✅ Sucesso: 4242 4242 4242 4242 | ❌ Recusado: 4000 0000 0000 0002
          <br />
          CVV: qualquer 3 dígitos | Data: qualquer futura
        </p>
      </div>

      <div className="space-y-2">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
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
              Pagar R$ {amount.toFixed(2)}
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          variant="outline"
          className="w-full"
        >
          Cancelar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        🔒 Pagamento seguro processado pelo Stripe
      </p>
    </form>
  );
};
