import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Check, QrCode, Clock } from 'lucide-react';
import { purchasesAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface PixPaymentFormProps {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const PixPaymentForm = ({ 
  paymentIntentId,
  clientSecret,
  amount, 
  onSuccess, 
  onError,
  onCancel 
}: PixPaymentFormProps) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos
  
  // Código PIX simulado para teste (Stripe test mode)
  const pixCode = `00020126580014br.gov.bcb.pix0136${paymentIntentId}520400005303986540${amount.toFixed(2)}5802BR5913APOSTILAS6009SAO PAULO62070503***6304`;

  // Timer de expiração
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onError('Pagamento PIX expirou. Tente novamente.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onError]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (isChecking) return;
      
      setIsChecking(true);
      try {
        // Se for mock (test mode), simular pagamento após 10 segundos
        if (paymentIntentId.startsWith('pi_pix_test_')) {
          // Simular pagamento bem-sucedido após 10 segundos
          setTimeout(() => {
            toast({
              title: 'Pagamento simulado!',
              description: 'PIX confirmado (modo teste)',
            });
            onSuccess(paymentIntentId);
          }, 10000);
          setIsChecking(false);
          return;
        }

        const response = await purchasesAPI.checkPaymentStatus(paymentIntentId);
        
        if (response.data.status === 'succeeded') {
          onSuccess(paymentIntentId);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Verificar a cada 3 segundos
    const interval = setInterval(checkPaymentStatus, 3000);
    
    // Verificar imediatamente
    checkPaymentStatus();

    return () => clearInterval(interval);
  }, [paymentIntentId, onSuccess, toast]);

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast({
      title: 'Código copiado!',
      description: 'Cole no seu app de pagamento.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Resumo da Compra</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-bold text-lg">R$ {amount.toFixed(2)}</span>
        </div>
      </div>

      {/* QR Code Simulado */}
      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-border">
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
            <QrCode className="w-32 h-32 text-primary/30" />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            QR Code PIX (Modo Teste)
          </p>
        </div>
      </div>

      {/* Código PIX */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Código PIX Copia e Cola</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={pixCode}
            readOnly
            className="flex-1 px-3 py-2 bg-muted rounded-lg text-xs font-mono"
          />
          <Button
            onClick={handleCopyPixCode}
            variant="outline"
            size="icon"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Timer e Status */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-warning" />
            <span className="font-medium">Expira em: {formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isChecking && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Aguardando pagamento...</span>
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
        <p className="font-medium">Como pagar:</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Abra o app do seu banco</li>
          <li>Escolha pagar com PIX</li>
          <li>Escaneie o QR Code ou cole o código</li>
          <li>Confirme o pagamento</li>
        </ol>
      </div>

      {/* Botão Cancelar */}
      <Button
        onClick={onCancel}
        variant="outline"
        className="w-full"
      >
        Cancelar
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        🔒 Pagamento seguro processado pelo Stripe
      </p>
    </div>
  );
};
