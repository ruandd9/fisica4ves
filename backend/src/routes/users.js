import express from 'express';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Listar todos os usuários (apenas admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários',
      error: error.message
    });
  }
});

// Adicionar apostila a um usuário (apenas admin)
router.post('/:userId/apostilas', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { apostilaId } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se já possui
    if (user.purchasedApostilas.includes(apostilaId)) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já possui esta apostila'
      });
    }

    user.purchasedApostilas.push(apostilaId);
    await user.save();

    res.json({
      success: true,
      message: 'Apostila adicionada com sucesso',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar apostila',
      error: error.message
    });
  }
});

// Remover apostila de um usuário (apenas admin)
router.delete('/:userId/apostilas/:apostilaId', protect, adminOnly, async (req, res) => {
  try {
    const { userId, apostilaId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    user.purchasedApostilas = user.purchasedApostilas.filter(
      id => id.toString() !== apostilaId
    );
    
    await user.save();

    res.json({
      success: true,
      message: 'Apostila removida com sucesso',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao remover apostila',
      error: error.message
    });
  }
});

export default router;
