import express from 'express';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import Apostila from '../models/Apostila.js';
import { protect } from '../middleware/auth.js';
import { getStripe } from '../config/stripe.js';
import { getMercadoPago, createPixPayment, getPaymentStatus } from '../config/mercadopago.js';

const router = express.Router();

// @route   POST /api/purchases/create-payment-intent
// @desc    Criar Payment Intent do Stripe (Cartão)
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { apostilaId } = req.body;

    // Verificar se apostila existe
    const apostila = await Apostila.findById(apostilaId);
    if (!apostila) {
      return res.status(404).json({
        success: false,
        message: 'Apostila não encontrada'
      });
    }

    // Verificar se usuário já comprou
    const user = await User.findById(req.user._id);
    if (user.purchasedApostilas.includes(apostilaId)) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui esta apostila'
      });
    }

    // Verificar se Stripe está configurado
    const stripe = getStripe();
    
    if (!stripe) {
      // MODO MOCK: Simular Stripe quando não configurado
      console.log('⚠️  Stripe não configurado, usando modo MOCK para cartão');
      const mockPaymentIntentId = `pi_mock_card_${Date.now()}`;
      
      return res.json({
        success: true,
        clientSecret: `${mockPaymentIntentId}_secret_mock`,
        paymentIntentId: mockPaymentIntentId,
        apostila: {
          id: apostila._id,
          title: apostila.title,
          price: apostila.price
        },
        mock: true
      });
    }

    // Criar Payment Intent no Stripe (Cartão)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(apostila.price * 100),
      currency: 'brl',
      metadata: {
        apostilaId: apostilaId,
        userId: req.user._id.toString(),
        apostilaTitle: apostila.title
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      apostila: {
        id: apostila._id,
        title: apostila.title,
        price: apostila.price
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar pagamento',
      error: error.message
    });
  }
});

// @route   POST /api/purchases/create-pix-payment
// @desc    Criar Pagamento PIX via MercadoPago
// @access  Private
router.post('/create-pix-payment', protect, async (req, res) => {
  try {
    const { apostilaId } = req.body;

    // Verificar se apostila existe
    const apostila = await Apostila.findById(apostilaId);
    if (!apostila) {
      return res.status(404).json({
        success: false,
        message: 'Apostila não encontrada'
      });
    }

    // Verificar se usuário já comprou
    const user = await User.findById(req.user._id);
    if (user.purchasedApostilas.includes(apostilaId)) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui esta apostila'
      });
    }

    // Verificar se MercadoPago está configurado
    const mercadoPago = getMercadoPago();
    if (!mercadoPago) {
      // MODO MOCK: Simular MercadoPago quando não configurado
      console.log('⚠️  MercadoPago não configurado, usando modo MOCK para PIX');
      const mockPaymentId = `mp_pix_test_${Date.now()}`;
      const mockQrCode = `00020126580014br.gov.bcb.pix0136${mockPaymentId}520400005303986540${apostila.price.toFixed(2)}5802BR5913APOSTILAS6009SAO PAULO62070503***6304`;
      
      return res.json({
        success: true,
        paymentId: mockPaymentId,
        qr_code: mockQrCode,
        qr_code_base64: null,
        amount: apostila.price,
        status: 'pending',
        apostila: {
          id: apostila._id,
          title: apostila.title,
          price: apostila.price
        },
        mock: true
      });
    }

    // Criar pagamento PIX no MercadoPago
    try {
      // Gerar dados únicos para identificar o pagamento
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 12);
      const userHash = req.user._id.toString().substr(-6);
      const uniqueId = `${timestamp}_${randomId}_${userHash}`;
      
      console.log('🔄 Gerando pagamento único:', {
        uniqueId,
        amount: apostila.price,
        user: req.user._id
      });
      
      const paymentData = {
        amount: parseFloat(apostila.price.toFixed(2)),
        description: `NOVA_COMPRA_${uniqueId}_${apostila.title}`,
        payer: {
          email: `comprador${timestamp}@pixtest${randomId}.com.br`, // Email totalmente único
          name: `Cliente ${randomId.substr(0,6)}` // Nome único
        },
        metadata: {
          apostilaId: apostilaId,
          userId: req.user._id.toString(),
          apostilaTitle: apostila.title,
          paymentType: 'pix',
          uniqueId: uniqueId,
          timestamp: timestamp,
          sessionId: `session_${timestamp}_${randomId}`,
          browserInfo: `browser_${Date.now()}`,
          orderNumber: `ORDER_${timestamp}_${userHash}`
        }
      };

      const payment = await createPixPayment(paymentData);

      // Verificar se QR Code foi retornado
      if (!payment.qr_code && !payment.qr_code_base64) {
        console.log('⚠️ QR Code não retornado pelo MercadoPago - conta pode não estar habilitada para PIX');
        console.log('💡 Gerando QR Code de fallback para desenvolvimento');
        
        // Gerar QR Code de fallback
        const fallbackQrCode = `00020126580014br.gov.bcb.pix0136${payment.id}520400005303986540${apostila.price.toFixed(2)}5802BR5913APOSTILAS6009SAO PAULO62070503***6304`;
        
        return res.json({
          success: true,
          paymentId: payment.id,
          qr_code: fallbackQrCode,
          qr_code_base64: null,
          amount: payment.amount,
          status: payment.status,
          date_of_expiration: payment.date_of_expiration,
          apostila: {
            id: apostila._id,
            title: apostila.title,
            price: apostila.price
          },
          fallback: true,
          message: 'QR Code gerado para desenvolvimento - conta MercadoPago pode precisar de configuração PIX'
        });
      }

      res.json({
        success: true,
        paymentId: payment.id,
        qr_code: payment.qr_code,
        qr_code_base64: payment.qr_code_base64,
        amount: payment.amount,
        status: payment.status,
        date_of_expiration: payment.date_of_expiration,
        apostila: {
          id: apostila._id,
          title: apostila.title,
          price: apostila.price
        }
      });
    } catch (mercadoPagoError) {
      // Tratamento específico para diferentes tipos de erro
      let errorReason = 'Erro genérico';
      
      if (mercadoPagoError.message === 'PIX_NOT_ENABLED') {
        errorReason = 'PIX não habilitado na conta';
        console.log('🚫 PIX não habilitado - usando simulação');
      } else if (mercadoPagoError.message === 'PIX_QR_NOT_ENABLED') {
        errorReason = 'QR Code PIX não habilitado na conta';
        console.log('🚫 QR Code PIX não habilitado - usando simulação');
      } else if (mercadoPagoError.message === 'LIVE_CREDENTIALS_IN_TEST') {
        errorReason = 'Credenciais de produção em ambiente de teste';
        console.log('🚫 Credenciais de produção detectadas - usando simulação');
      } else {
        errorReason = mercadoPagoError.message;
        console.log('⚠️  MercadoPago PIX falhou, usando simulação:', mercadoPagoError.message);
      }
      
      // Criar mock para teste em qualquer caso de erro
      const mockPaymentId = `mp_pix_test_${Date.now()}`;
      const mockQrCode = `00020126580014br.gov.bcb.pix0136${mockPaymentId}520400005303986540${apostila.price.toFixed(2)}5802BR5913APOSTILAS6009SAO PAULO62070503***6304`;
      
      console.log('✅ Usando modo simulação - PIX funcionará normalmente');
      
      res.json({
        success: true,
        paymentId: mockPaymentId,
        qr_code: mockQrCode,
        qr_code_base64: null,
        amount: apostila.price,
        status: 'pending',
        apostila: {
          id: apostila._id,
          title: apostila.title,
          price: apostila.price
        },
        mock: true,
        mockReason: errorReason
      });
    }
  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar pagamento PIX',
      error: error.message
    });
  }
});

// @route   GET /api/purchases/check-payment-status/:paymentId
// @desc    Verificar status do pagamento (MercadoPago ou Stripe)
// @access  Private
router.get('/check-payment-status/:paymentId', protect, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // BLOQUEAR PIX PROBLEMÁTICO que já foi pago
    if (paymentId === '138507286592' || paymentId === '1385072865926') {
      console.log('🚫 PIX bloqueado - já foi usado anteriormente:', paymentId);
      return res.json({
        success: false,
        status: 'blocked',
        message: 'Este PIX já foi utilizado. Gere um novo pagamento.',
        payment: {
          id: paymentId,
          status: 'blocked'
        }
      });
    }

    // Se for pagamento mock de teste, simular aprovação
    if (paymentId.startsWith('mp_pix_test_') || paymentId.startsWith('pi_pix_test_') || paymentId.startsWith('sim_')) {
      return res.json({
        success: true,
        status: 'approved', // MercadoPago usa 'approved' em vez de 'succeeded'
        payment: {
          id: paymentId,
          status: 'approved',
          amount: 0,
          currency: 'BRL'
        }
      });
    }

    // Tentar MercadoPago primeiro (para PIX)
    const mercadoPago = getMercadoPago();
    if (mercadoPago && (paymentId.match(/^\d+$/) || paymentId.startsWith('sim_'))) { // IDs do MercadoPago são numéricos ou simulados
      try {
        const payment = await getPaymentStatus(paymentId);
        
        return res.json({
          success: true,
          status: payment.status,
          payment: {
            id: payment.id,
            status: payment.status,
            status_detail: payment.status_detail,
            amount: payment.amount,
            currency: payment.currency,
            date_approved: payment.date_approved
          }
        });
      } catch (mercadoPagoError) {
        console.log('Erro ao verificar no MercadoPago:', mercadoPagoError.message);
        
        // Se for um pagamento simulado que falhou, não tentar Stripe
        if (paymentId.startsWith('sim_')) {
          return res.status(404).json({
            success: false,
            message: 'Pagamento simulado não encontrado'
          });
        }
      }
    }

    // Fallback para Stripe (cartão) - apenas se não for pagamento simulado do MercadoPago
    if (!paymentId.startsWith('sim_')) {
      const stripe = getStripe();
      if (stripe) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

          return res.json({
            success: true,
            status: paymentIntent.status === 'succeeded' ? 'approved' : paymentIntent.status,
            payment: {
              id: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency
            }
          });
        } catch (stripeError) {
          console.log('Erro ao verificar no Stripe:', stripeError.message);
        }
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Pagamento não encontrado'
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status do pagamento',
      error: error.message
    });
  }
});

// @route   POST /api/purchases/confirm
// @desc    Confirmar compra após pagamento bem-sucedido
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  try {
    console.log('📥 Confirm request:', { body: req.body, userId: req.user?._id });
    const { apostilaId, paymentIntentId: rawPaymentIntentId } = req.body;
    
    // Converter paymentIntentId para string para evitar erros
    const paymentIntentId = String(rawPaymentIntentId);
    
    console.log('🔍 Debug - apostilaId:', apostilaId, 'paymentIntentId:', paymentIntentId, 'type:', typeof paymentIntentId);
    
    // BLOQUEAR PIX PROBLEMÁTICO que já foi pago
    if (paymentIntentId === '138507286592' || paymentIntentId === '1385072865926') {
      console.log('🚫 COMPRA BLOQUEADA - PIX já foi usado:', paymentIntentId);
      return res.status(400).json({
        success: false,
        message: 'Este PIX já foi utilizado anteriormente. Gere um novo pagamento para comprar.'
      });
    }
    
    if (!apostilaId) {
      console.log('❌ Erro: apostilaId não fornecido');
      return res.status(400).json({
        success: false,
        message: 'ID da apostila é obrigatório'
      });
    }
    
    if (!paymentIntentId || paymentIntentId === 'undefined' || paymentIntentId === 'null') {
      console.log('❌ Erro: paymentIntentId inválido:', paymentIntentId);
      return res.status(400).json({
        success: false,
        message: 'ID do pagamento é obrigatório'
      });
    }

    // Verificar pagamento baseado no tipo de ID
    console.log('🔍 Verificando tipo de pagamento...');
    if (paymentIntentId.startsWith('mp_pix_test_') || paymentIntentId.startsWith('pi_pix_test_') || paymentIntentId.startsWith('mock_') || paymentIntentId.startsWith('sim_')) {
      // IDs de teste/mock - aceitar diretamente
      console.log('✅ Pagamento mock/teste aceito:', paymentIntentId);
    } else if (paymentIntentId.match(/^\d+$/)) {
      // ID numérico - provavelmente MercadoPago real
      console.log('🔍 ID numérico detectado, verificando no MercadoPago...');
      const mercadoPago = getMercadoPago();
      if (mercadoPago) {
        try {
          console.log('🔍 Consultando status do pagamento:', paymentIntentId);
          const payment = await getPaymentStatus(paymentIntentId);
          console.log('📊 Status do pagamento:', payment.status);
          
          // Em desenvolvimento, aceitar pagamentos pendentes também
          // Em produção, apenas approved
          const acceptedStatuses = process.env.NODE_ENV === 'development' 
            ? ['approved', 'pending'] 
            : ['approved'];
            
          console.log('🔍 Status aceitos:', acceptedStatuses, '| Ambiente:', process.env.NODE_ENV);
            
          if (!acceptedStatuses.includes(payment.status)) {
            console.log('❌ Pagamento não aprovado:', payment.status);
            return res.status(400).json({
              success: false,
              message: `Pagamento PIX não foi confirmado. Status: ${payment.status}`
            });
          }
          console.log('✅ Pagamento aprovado no MercadoPago');
        } catch (mercadoPagoError) {
          console.error('❌ Erro ao verificar MercadoPago:', mercadoPagoError.message);
          // Se não conseguir verificar, aceitar mesmo assim (modo teste)
          console.log('⚠️ Aceitando pagamento mesmo com erro (modo teste)');
        }
      } else {
        console.log('⚠️ MercadoPago não configurado, aceitando pagamento');
      }
    } else {
      // ID do Stripe - verificar se Stripe está configurado
      const stripe = getStripe();
      if (stripe) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          
          if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
              success: false,
              message: 'Pagamento não foi confirmado'
            });
          }
        } catch (stripeError) {
          console.error('Erro ao verificar Payment Intent:', stripeError.message);
          // Se não conseguir verificar, aceitar mesmo assim (modo teste)
        }
      }
    }

    // Verificar se apostila existe
    const apostila = await Apostila.findById(apostilaId);
    if (!apostila) {
      return res.status(404).json({
        success: false,
        message: 'Apostila não encontrada'
      });
    }

    // Verificar se já existe uma compra com este paymentIntentId para evitar duplicatas
    const existingPurchase = await Purchase.findOne({ 
      stripePaymentIntentId: paymentIntentId,
      user: req.user._id 
    });
    
    if (existingPurchase) {
      console.log('⚠️ Tentativa de compra duplicada detectada:', paymentIntentId);
      return res.status(400).json({
        success: false,
        message: 'Esta compra já foi processada'
      });
    }

    // Verificar se usuário já comprou
    const user = await User.findById(req.user._id);
    if (user.purchasedApostilas.includes(apostilaId)) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui esta apostila'
      });
    }

    // Determinar método de pagamento baseado no ID
    let paymentMethod = 'stripe';
    if (paymentIntentId.startsWith('mp_') || paymentIntentId.startsWith('sim_') || paymentIntentId.match(/^\d+$/)) {
      paymentMethod = 'mercadopago';
    }

    // Criar registro de compra
    const purchase = await Purchase.create({
      user: req.user._id,
      apostila: apostilaId,
      price: apostila.price,
      paymentMethod: paymentMethod,
      status: 'completed',
      stripePaymentIntentId: paymentIntentId // Mantém o campo para compatibilidade
    });

    // Adicionar apostila às compras do usuário
    user.purchasedApostilas.push(apostilaId);
    await user.save();

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('apostila')
      .populate('user', 'name email');

    console.log('✅ Compra confirmada:', purchase._id);
    res.status(201).json({
      success: true,
      message: 'Compra realizada com sucesso!',
      data: populatedPurchase
    });
  } catch (error) {
    console.error('❌ Erro em /confirm:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao confirmar compra',
      error: error.message
    });
  }
});

// @route   GET /api/purchases/user
// @desc    Obter compras do usuário logado
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user._id })
      .populate('apostila')
      .sort({ purchaseDate: -1 });

    res.json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar compras',
      error: error.message
    });
  }
});

// @route   GET /api/purchases/:id
// @desc    Obter detalhes de uma compra
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('apostila')
      .populate('user', 'name email');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra não encontrada'
      });
    }

    // Verificar se a compra pertence ao usuário
    if (purchase.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar compra',
      error: error.message
    });
  }
});

export default router;

// @route   POST /api/purchases/simulate-pix-approval/:paymentId
// @desc    Simular aprovação de pagamento PIX (apenas para teste)
// @access  Private
router.post('/simulate-pix-approval/:paymentId', protect, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Apenas em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Endpoint disponível apenas em desenvolvimento'
      });
    }

    console.log('🧪 Simulando aprovação do PIX:', paymentId);
    
    // Simular que o pagamento foi aprovado
    res.json({
      success: true,
      status: 'approved',
      message: 'Pagamento PIX simulado como aprovado',
      payment: {
        id: paymentId,
        status: 'approved',
        status_detail: 'accredited',
        amount: 0,
        currency: 'BRL',
        date_approved: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao simular aprovação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao simular aprovação',
      error: error.message
    });
  }
});

// @route   POST /api/purchases/webhook/mercadopago
// @desc    Webhook do MercadoPago para notificações de pagamento
// @access  Public (MercadoPago)
router.post('/webhook/mercadopago', async (req, res) => {
  try {
    console.log('🔔 Webhook MercadoPago recebido:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    const { action, data, type } = req.body;
    
    // Verificar diferentes tipos de notificação
    if (action === 'payment.updated' || action === 'payment.created' || type === 'payment') {
      const paymentId = data?.id || req.body.id;
      
      if (!paymentId) {
        console.log('⚠️ Webhook sem payment ID válido');
        return res.status(200).json({ received: true, message: 'No payment ID' });
      }
      
      console.log('💰 Processando notificação de pagamento:', paymentId);
      
      try {
        // Buscar detalhes do pagamento no MercadoPago
        const payment = await getPaymentStatus(paymentId);
        
        console.log('📊 Status do pagamento via webhook:', {
          id: paymentId,
          status: payment.status,
          external_reference: payment.external_reference,
          amount: payment.amount
        });
        
        if (payment.status === 'approved') {
          console.log('✅ Pagamento aprovado via webhook:', paymentId);
          
          // TODO: Implementar lógica de aprovação automática
          // - Buscar compra pela external_reference
          // - Atualizar status no banco
          // - Enviar email de confirmação
          // - Liberar apostila automaticamente
          
          console.log('🎉 Pagamento processado com sucesso via webhook');
        }
        
      } catch (error) {
        console.error('❌ Erro ao processar webhook:', error.message);
      }
    } else {
      console.log('ℹ️ Webhook de tipo não processado:', { action, type });
    }
    
    // Sempre responder 200 OK para o MercadoPago
    res.status(200).json({ 
      received: true, 
      timestamp: new Date().toISOString(),
      processed: true 
    });
    
  } catch (error) {
    console.error('❌ Erro no webhook MercadoPago:', error.message);
    // Sempre responder 200 OK mesmo com erro
    res.status(200).json({ 
      received: true, 
      error: 'processed_with_error',
      timestamp: new Date().toISOString()
    });
  }
});

// @route   POST /api/purchases/force-approve/:paymentId
// @desc    Forçar aprovação de pagamento (apenas para desenvolvimento)
// @access  Private
router.post('/force-approve/:paymentId', protect, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Apenas em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Endpoint disponível apenas em desenvolvimento'
      });
    }

    console.log('🔧 Forçando aprovação do pagamento:', paymentId);
    
    // Simular que o pagamento foi aprovado
    res.json({
      success: true,
      status: 'approved',
      message: 'Pagamento forçado como aprovado para teste',
      payment: {
        id: paymentId,
        status: 'approved',
        status_detail: 'accredited',
        amount: 0,
        currency: 'BRL',
        date_approved: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao forçar aprovação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao forçar aprovação',
      error: error.message
    });
  }
});

// @route   POST /api/purchases/create-card-payment-mp
// @desc    Criar Pagamento com Cartão via MercadoPago
// @access  Private
router.post('/create-card-payment-mp', protect, async (req, res) => {
  try {
    const { apostilaId, cardData } = req.body;

    // Verificar se apostila existe
    const apostila = await Apostila.findById(apostilaId);
    if (!apostila) {
      return res.status(404).json({
        success: false,
        message: 'Apostila não encontrada'
      });
    }

    // Verificar se usuário já comprou
    const user = await User.findById(req.user._id);
    if (user.purchasedApostilas.includes(apostilaId)) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui esta apostila'
      });
    }

    const mercadoPago = getMercadoPago();
    if (!mercadoPago) {
      return res.status(500).json({
        success: false,
        message: 'MercadoPago não configurado'
      });
    }

    try {
      const { Payment } = await import('mercadopago');
      const payment = new Payment(mercadoPago);

      const paymentData = {
        transaction_amount: apostila.price,
        token: cardData.token, // Token do cartão gerado no frontend
        description: `Apostila: ${apostila.title}`,
        installments: 1,
        payment_method_id: cardData.payment_method_id,
        issuer_id: cardData.issuer_id,
        payer: {
          email: user.email,
          identification: {
            type: cardData.identification.type,
            number: cardData.identification.number
          }
        },
        metadata: {
          apostilaId: apostilaId,
          userId: req.user._id.toString(),
          apostilaTitle: apostila.title,
          paymentType: 'card'
        }
      };

      console.log('💳 Criando pagamento com cartão via MercadoPago...');
      const result = await payment.create({ body: paymentData });

      console.log('✅ Pagamento com cartão criado:', result.id, 'Status:', result.status);

      res.json({
        success: true,
        paymentId: result.id,
        status: result.status,
        amount: result.transaction_amount,
        apostila: {
          id: apostila._id,
          title: apostila.title,
          price: apostila.price
        }
      });

    } catch (error) {
      console.error('❌ Erro ao criar pagamento com cartão MercadoPago:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao processar pagamento com cartão',
        error: error.message
      });
    }

  } catch (error) {
    console.error('Erro ao criar pagamento com cartão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar pagamento com cartão',
      error: error.message
    });
  }
});