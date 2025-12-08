import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Verificar se admin já existe
    const existingAdmin = await User.findOne({ email: 'adminapostilas@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin já existe. Atualizando...');
      existingAdmin.isAdmin = true;
      existingAdmin.name = 'Administrador';
      await existingAdmin.save();
      console.log('✅ Admin atualizado com sucesso!');
    } else {
      // Criar novo admin
      const admin = new User({
        name: 'Administrador',
        email: 'adminapostilas@gmail.com',
        password: 'Admin123',
        isAdmin: true,
        purchasedApostilas: []
      });

      await admin.save();
      console.log('✅ Admin criado com sucesso!');
      console.log('📧 Email: adminapostilas@gmail.com');
      console.log('🔑 Senha: Admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

createAdmin();
