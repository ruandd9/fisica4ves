import Stripe from 'stripe';
import dotenv from 'dotenv';

// Garantir que as variáveis de ambiente estão carregadas
dotenv.config();

let stripeInstance = null;

export const getStripe = () => {
  if (stripeInstance) {
    return stripeInstance;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.warn('⚠️  STRIPE_SECRET_KEY não configurada. Funcionalidades de pagamento estarão desabilitadas.');
    return null;
  }

  try {
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    console.log('✅ Stripe inicializado com sucesso');
    return stripeInstance;
  } catch (error) {
    console.error('❌ Erro ao inicializar Stripe:', error.message);
    return null;
  }
};

// Para compatibilidade com código existente
export default getStripe();
