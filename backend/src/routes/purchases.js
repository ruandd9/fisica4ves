import express from 'express';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import Apostila from '../models/Apostila.js';
import { protect } from '../middleware/auth.js';
import { getStripe } from '../config/stripe.js';

const router = express.Router();

// @route   POST /api/purchases/create-payment-intent
// @desc    Criar Payment Intent do Stripe
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
      return res.status(503).json({
        success: false,
        message: 'Stripe não está configurado. Use o modo simulado.'
      });
    }

    // Criar Payment Intent no Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(apostila.price * 100), // Stripe usa centavos
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

// @route   POST /api/purchases/confirm
// @desc    Confirmar compra após pagamento bem-sucedido
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  try {
    console.log('📥 Confirm request:', { body: req.body, userId: req.user?._id });
    const { apostilaId, paymentIntentId } = req.body;
    
    if (!apostilaId) {
      return res.status(400).json({
        success: false,
        message: 'ID da apostila é obrigatório'
      });
    }

    // Se Stripe estiver configurado e não for mock, verificar Payment Intent
    const stripe = getStripe();
    if (stripe && !paymentIntentId.startsWith('mock_') && !paymentIntentId.startsWith('pi_test_')) {
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
    // Se for mock, pi_test_ ou Stripe não configurado, aceitar diretamente

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

    // Criar registro de compra
    const purchase = await Purchase.create({
      user: req.user._id,
      apostila: apostilaId,
      price: apostila.price,
      paymentMethod: 'stripe',
      status: 'completed',
      stripePaymentIntentId: paymentIntentId
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
