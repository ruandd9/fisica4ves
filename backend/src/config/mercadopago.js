import { MercadoPagoConfig, Payment } from 'mercadopago';

let mercadoPago = null;

export const getMercadoPago = () => {
  if (!mercadoPago) {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.warn('⚠️  MercadoPago Access Token não configurado');
      return null;
    }

    // Verificar se é chave de teste ou produção
    const isTestKey = accessToken.startsWith('TEST-') || accessToken.startsWith('APP_TEST-');
    const isProdKey = accessToken.startsWith('APP_USR-');
    
    // Nota: MercadoPago agora usa APP_USR- tanto para teste quanto produção
    // A diferença está no ambiente da conta, não no prefixo da chave

    try {
      mercadoPago = new MercadoPagoConfig({
        accessToken: accessToken,
        options: {
          timeout: 5000,
          idempotencyKey: 'abc'
        }
      });
      
      console.log(`✅ MercadoPago configurado com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao configurar MercadoPago:', error.message);
      return null;
    }
  }
  
  return mercadoPago;
};

// Função para gerar CPF válido para teste
const generateValidTestCPF = () => {
  // CPFs válidos para teste do MercadoPago
  const testCPFs = [
    '11144477735', // CPF de teste válido
    '12345678909', // CPF de teste válido
    '01234567890', // CPF de teste válido
    '11111111111'  // CPF de teste válido (para sandbox)
  ];
  
  // Retorna um CPF aleatório da lista
  return testCPFs[Math.floor(Math.random() * testCPFs.length)];
};

export const createPixPayment = async (paymentData) => {
  const client = getMercadoPago();
  
  if (!client) {
    throw new Error('MercadoPago não configurado');
  }

  try {
    const payment = new Payment(client);
    
    // Usar CPF válido para teste
    const testCPF = generateValidTestCPF();
    
    const paymentRequest = {
      transaction_amount: paymentData.amount,
      description: paymentData.description,
      payment_method_id: 'pix',
      payer: {
        email: paymentData.payer.email,
        first_name: paymentData.payer.name,
        identification: {
          type: 'CPF',
          number: testCPF
        }
      },
      metadata: paymentData.metadata || {}
    };

    console.log('🔄 Criando pagamento PIX com CPF de teste:', testCPF);
    const result = await payment.create({ body: paymentRequest });
    
    console.log('✅ Pagamento PIX criado com sucesso:', result.id);
    return {
      id: result.id,
      status: result.status,
      qr_code: result.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: result.point_of_interaction?.transaction_data?.ticket_url,
      amount: result.transaction_amount,
      currency: result.currency_id,
      date_created: result.date_created,
      date_of_expiration: result.date_of_expiration
    };
  } catch (error) {
    console.error('❌ Erro ao criar pagamento PIX no MercadoPago:', error);
    
    // Verificar tipos específicos de erro
    if (error.cause && Array.isArray(error.cause)) {
      const errorCodes = error.cause.map(c => c.code);
      
      // Erro de CPF inválido (2067)
      if (errorCodes.includes(2067)) {
        console.log('🔄 Tentando com CPF alternativo...');
        try {
          const payment = new Payment(client);
          const paymentRequest = {
            transaction_amount: paymentData.amount,
            description: paymentData.description,
            payment_method_id: 'pix',
            payer: {
              email: paymentData.payer.email,
              first_name: paymentData.payer.name,
              identification: {
                type: 'CPF',
                number: '11144477735' // CPF de teste específico do MercadoPago
              }
            },
            metadata: paymentData.metadata || {}
          };

          const result = await payment.create({ body: paymentRequest });
          console.log('✅ Pagamento PIX criado com CPF alternativo:', result.id);
          
          return {
            id: result.id,
            status: result.status,
            qr_code: result.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
            ticket_url: result.point_of_interaction?.transaction_data?.ticket_url,
            amount: result.transaction_amount,
            currency: result.currency_id,
            date_created: result.date_created,
            date_of_expiration: result.date_of_expiration
          };
        } catch (secondError) {
          console.error('❌ Erro na segunda tentativa:', secondError);
          throw error; // Lança o erro original
        }
      }
      
      // Erro de PIX não habilitado (13253)
      if (errorCodes.includes(13253)) {
        console.error('🚫 PIX não habilitado na conta MercadoPago');
        console.error('💡 Solução: Ative o PIX na sua conta MercadoPago ou use chave de teste');
        throw new Error('PIX_NOT_ENABLED');
      }
    }
    
    // Verificar mensagem de erro específica para PIX não habilitado
    if (error.message && error.message.includes('without key enabled for QR render')) {
      console.error('🚫 Conta MercadoPago sem PIX habilitado para QR Code');
      console.error('💡 Soluções:');
      console.error('   1. Use uma chave de TESTE (TEST- ou APP_TEST-)');
      console.error('   2. Ative o PIX na sua conta MercadoPago');
      console.error('   3. Verifique se a conta está completamente verificada');
      throw new Error('PIX_QR_NOT_ENABLED');
    }
    
    // Verificar erro de credenciais de produção em ambiente de teste
    if (error.message && error.message.includes('Unauthorized use of live credentials')) {
      console.error('🚫 Credenciais de PRODUÇÃO sendo usadas em ambiente de TESTE');
      console.error('💡 Soluções:');
      console.error('   1. Obtenha credenciais específicas de TESTE/SANDBOX');
      console.error('   2. Verifique se está usando a aba "Test" no painel MercadoPago');
      console.error('   3. Crie uma aplicação específica para testes');
      throw new Error('LIVE_CREDENTIALS_IN_TEST');
    }
    
    throw error;
  }
};

export const getPaymentStatus = async (paymentId) => {
  const client = getMercadoPago();
  
  if (!client) {
    throw new Error('MercadoPago não configurado');
  }

  try {
    const payment = new Payment(client);
    const result = await payment.get({ id: paymentId });
    
    return {
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      amount: result.transaction_amount,
      currency: result.currency_id,
      date_created: result.date_created,
      date_approved: result.date_approved
    };
  } catch (error) {
    console.error('Erro ao buscar status do pagamento:', error);
    throw error;
  }
};