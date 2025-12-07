import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env da pasta backend
dotenv.config({ path: join(__dirname, '../../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askConfirmation = () => {
  return new Promise((resolve) => {
    rl.question('Digite "s" para confirmar a exclusão de TODOS os usuários: ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 's');
    });
  });
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os usuários
    const users = await User.find({}, 'name email createdAt purchasedApostilas');
    console.log(`📊 Usuários no banco: ${users.length}\n`);

    // Listar emails
    if (users.length > 0) {
      console.log('📧 Emails dos usuários:');
      users.forEach((user, index) => {
        const compras = user.purchasedApostilas?.length || 0;
        console.log(`   ${index + 1}. ${user.email} - ${user.name} (${compras} compras)`);
      });
    }

    // ⚠️ CONFIRMAÇÃO DE SEGURANÇA
    console.log('\n⚠️  ATENÇÃO: Este script vai DELETAR TODOS OS USUÁRIOS do banco!');
    console.log('⚠️  Use apenas em desenvolvimento ou antes de lançar em produção.\n');

    const confirmed = await askConfirmation();

    if (!confirmed) {
      console.log('❌ Operação cancelada pelo usuário.');
      process.exit(0);
    }

    // Limpar todos os usuários
    const result = await User.deleteMany({});
    console.log(`🗑️  ${result.deletedCount} usuários removidos`);

    console.log('✅ Banco de usuários limpo com sucesso!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

seedDatabase();
