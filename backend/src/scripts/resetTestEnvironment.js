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

async function resetTestEnvironment() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    console.log('🧹 LIMPANDO AMBIENTE DE TESTE...\n');

    // 1. Buscar e remover apostilas de teste existentes
    const testApostilas = await Apostila.find({ 
      title: { $regex: /TESTE/i } 
    });
    
    if (testApostilas.length > 0) {
      const testApostilaIds = testApostilas.map(a => a._id);
      
      // Remover compras de teste
      const deleteResult = await Purchase.deleteMany({
        apostila: { $in: testApostilaIds }
      });
      console.log(`🗑️  Removidas ${deleteResult.deletedCount} compras de teste`);

      // Remover das listas de usuários
      await User.updateMany(
        { purchasedApostilas: { $in: testApostilaIds } },
        { $pull: { purchasedApostilas: { $in: testApostilaIds } } }
      );
      console.log('👤 Apostilas de teste removidas dos usuários');

      // Remover apostilas de teste
      await Apostila.deleteMany({ _id: { $in: testApostilaIds } });
      console.log(`📚 Removidas ${testApostilas.length} apostilas de teste`);
    }

    console.log('\n🆕 CRIANDO NOVA APOSTILA DE TESTE...\n');

    // 2. Criar nova apostila de teste
    const testApostilaProd = {
      title: "TESTE PRODUÇÃO - Validação PIX Real - R$ 2,00",
      description: "Apostila de teste para validar PIX em produção. Use para testar pagamentos reais com valor baixo.",
      longDescription: "Esta é uma apostila de teste criada especificamente para validar o funcionamento do PIX em ambiente de produção. Contém conteúdo de demonstração e serve para testar o fluxo completo de pagamento com valores baixos. Após a validação, pode ser removida ou mantida para testes futuros.",
      price: 2.00,
      originalPrice: 2.00,
      category: "Vestibulares",
      cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop",
      pages: 5,
      rating: 5.0,
      reviews: 1,
      features: [
        "Teste de PIX real", 
        "Valor baixo para validação", 
        "Conteúdo de demonstração",
        "Fluxo completo de pagamento"
      ],
      author: "Sistema de Testes",
      lastUpdate: "Dezembro 2024",
      language: "Português",
      level: "Teste",
      topics: [
        "Validação de PIX", 
        "Teste de produção", 
        "Fluxo de pagamento", 
        "Integração MercadoPago"
      ],
      pdfUrl: "/pdfs/teste-producao.pdf",
      isActive: true
    };

    const apostila = await Apostila.create(testApostilaProd);
    
    console.log('✅ AMBIENTE DE TESTE RESETADO COM SUCESSO!');
    console.log('🆔 Nova Apostila ID:', apostila._id);
    console.log('💰 Preço: R$ 2,00');
    console.log('🎯 Título:', apostila.title);
    console.log('');
    console.log('📋 PRONTO PARA TESTAR:');
    console.log('1. ✅ Apostila de teste criada');
    console.log('2. ✅ Compras anteriores removidas');
    console.log('3. ✅ Usuários podem comprar novamente');
    console.log('4. ✅ PIX será gerado com R$ 2,00');
    console.log('');
    console.log('🚀 Agora você pode testar a compra PIX normalmente!');

  } catch (error) {
    console.error('❌ Erro ao resetar ambiente de teste:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

resetTestEnvironment();