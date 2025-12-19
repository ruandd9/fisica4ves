import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Check, QrCode, Clock } from 'lucide-react';
import { purchasesAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface PixPaymentFormProps {
  paymentId: string | number;
  qrCode: string;
  qrCodeBase64?: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const PixPaymentForm = ({ 
  paymentId: rawPaymentId,
  qrCode,
  qrCodeBase64,
  amount, 
  onSuccess, 
  onError,
  onCancel 
}: PixPaymentFormProps) => {
  // Converter paymentId para string para evitar erros
  const paymentId = String(rawPaymentId);
  
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos

  // Inicializar MercadoPago SDK para Device ID
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).MercadoPago) {
      const mp = new (window as any).MercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
      
      // Gerar Device ID para melhorar qualidade da integração
      const deviceId = mp.getIdentificationTypes();
      console.log('🔧 MercadoPago SDK inicializado para Device ID');
    }
  }, []);

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

  // Polling para verificar status do pagamento - DESABILITADO TEMPORARIAMENTE
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (isChecking) return;
      
      setIsChecking(true);
      try {
        // Se for mock (test mode), simular pagamento após 10 segundos
        if (paymentId.startsWith('mp_pix_test_') || paymentId.startsWith('pi_pix_test_')) {
          // Simular pagamento bem-sucedido após 10 segundos
          setTimeout(() => {
            toast({
              title: 'Pagamento simulado!',
              description: 'PIX confirmado (modo teste)',
            });
            onSuccess(paymentId);
          }, 10000);
          setIsChecking(false);
          return;
        }

        // POLLING DESABILITADO - Não verificar automaticamente
        console.log('⚠️ Polling automático DESABILITADO para evitar aprovações indevidas');
        
        // Não fazer verificação automática
        // const response = await purchasesAPI.checkPaymentStatus(paymentId);
        
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // POLLING DESABILITADO - Não verificar automaticamente
    // const interval = setInterval(checkPaymentStatus, 3000);
    
    // Verificar apenas uma vez para modos de teste
    if (paymentId.startsWith('mp_pix_test_') || paymentId.startsWith('pi_pix_test_')) {
      checkPaymentStatus();
    }

    // return () => clearInterval(interval);
  }, [paymentId, onSuccess, toast]);

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(qrCode);
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

      {/* QR Code */}
      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-border">
        <div className="flex flex-col items-center gap-4">
          {qrCodeBase64 ? (
            <img 
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code PIX"
              className="w-48 h-48 rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
              <QrCode className="w-32 h-32 text-primary/30" />
            </div>
          )}
          <p className="text-sm text-center text-muted-foreground">
            {qrCodeBase64 ? 'QR Code PIX - MercadoPago' : 'QR Code PIX (Modo Teste)'}
          </p>
        </div>
      </div>

      {/* Código PIX */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Código PIX Copia e Cola</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={qrCode}
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

      {/* Botões de Ação */}
      <div className="space-y-2">
        {/* Botão para verificar pagamento manualmente */}
        <Button
          onClick={async () => {
            try {
              setIsChecking(true);
              const response = await purchasesAPI.checkPaymentStatus(paymentId);
              
              console.log('🔍 Status verificado manualmente:', response.data.status);
              
              if (response.data.status === 'approved' || response.data.status === 'succeeded') {
                toast({
                  title: 'Pagamento confirmado!',
                  description: 'PIX aprovado com sucesso',
                });
                onSuccess(paymentId);
              } else {
                toast({
                  title: 'Pagamento pendente',
                  description: `Status: ${response.data.status}. Tente novamente após pagar.`,
                  variant: 'default',
                });
              }
            } catch (error) {
              console.error('Erro ao verificar status:', error);
              toast({
                title: 'Erro ao verificar',
                description: 'Não foi possível verificar o status do pagamento',
                variant: 'destructive',
              });
            } finally {
              setIsChecking(false);
            }
          }}
          className="w-full"
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Verificando...
            </>
          ) : (
            '🔍 Verificar se PIX foi Pago'
          )}
        </Button>

        {/* Botões de simulação apenas em desenvolvimento */}
        {import.meta.env.DEV && (
          <div className="space-y-2 mt-2">
            <Button
              onClick={() => {
                toast({
                  title: 'Pagamento simulado!',
                  description: 'PIX aprovado (modo desenvolvimento)',
                });
                onSuccess(paymentId);
              }}
              className="w-full"
              variant="outline"
              size="sm"
            >
              🧪 Simular Aprovação (Dev)
            </Button>
          </div>
        )}
        
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full"
        >
          Cancelar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        🔒 Pagamento seguro processado pelo MercadoPago
      </p>
    </div>
  );
};
