import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import Apostila from '../models/Apostila.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env da pasta backend
dotenv.config({ path: join(__dirname, '../../.env') });

async function cleanTestPurchases() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar apostilas de teste
    const testApostilas = await Apostila.find({ 
      title: { $regex: /TESTE/i } 
    });
    
    if (testApostilas.length === 0) {
      console.log('📚 Nenhuma apostila de teste encontrada');
      return;
    }

    console.log(`📚 Encontradas ${testApostilas.length} apostilas de teste:`);
    testApostilas.forEach(apostila => {
      console.log(`   - ${apostila.title} (ID: ${apostila._id})`);
    });

    const testApostilaIds = testApostilas.map(a => a._id);

    // Buscar compras de apostilas de teste
    const testPurchases = await Purchase.find({
      apostila: { $in: testApostilaIds }
    }).populate('user', 'name email').populate('apostila', 'title');

    console.log(`\n💰 Encontradas ${testPurchases.length} compras de teste:`);
    testPurchases.forEach(purchase => {
      console.log(`   - ${purchase.user?.name || 'Usuário'} comprou "${purchase.apostila?.title}" (${purchase.stripePaymentIntentId})`);
    });

    if (testPurchases.length > 0) {
      // Remover compras de teste
      const deleteResult = await Purchase.deleteMany({
        apostila: { $in: testApostilaIds }
      });
      console.log(`\n🗑️  Removidas ${deleteResult.deletedCount} compras de teste`);

      // Remover apostilas de teste das listas de usuários
      const userIds = [...new Set(testPurchases.map(p => p.user._id))];
      
      for (const userId of userIds) {
        const user = await User.findById(userId);
        if (user) {
          const originalCount = user.purchasedApostilas.length;
          user.purchasedApostilas = user.purchasedApostilas.filter(
            apostilaId => !testApostilaIds.some(testId => testId.equals(apostilaId))
          );
          
          if (user.purchasedApostilas.length !== originalCount) {
            await user.save();
            console.log(`👤 Removidas apostilas de teste do usuário ${user.name || user.email}`);
          }
        }
      }
    }

    console.log('\n✅ Limpeza concluída! Agora você pode testar novamente.');
    console.log('💡 Dica: Execute o script addTestApostilaProd.js se precisar recriar a apostila de teste.');

  } catch (error) {
    console.error('❌ Erro ao limpar compras de teste:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

cleanTestPurchases();