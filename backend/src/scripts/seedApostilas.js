import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Apostila from '../models/Apostila.js';

dotenv.config();

const apostilas = [
  {
    title: "Física Completa - Mecânica, Termodinâmica e Eletromagnetismo",
    description: "Apostila completa de Física com teoria detalhada, exemplos práticos e mais de 400 exercícios resolvidos. Ideal para ENEM, vestibulares e concursos.",
    longDescription: "Esta apostila foi desenvolvida para estudantes que desejam dominar os conceitos fundamentais da Física. Com uma abordagem clara e didática, o material abrange Mecânica Clássica, Termodinâmica, Eletromagnetismo, Óptica e Física Moderna. Cada capítulo inclui teoria completa, exemplos resolvidos passo a passo e exercícios de fixação com gabarito comentado.",
    price: 59.90,
    originalPrice: 99.90,
    category: "Vestibulares",
    cover: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=600&fit=crop",
    pages: 450,
    rating: 4.9,
    reviews: 387,
    features: ["400+ exercícios resolvidos", "Teoria completa", "Fórmulas organizadas", "Simulados ENEM", "Videoaulas bônus"],
    author: "Prof. Dr. Roberto Almeida",
    lastUpdate: "Dezembro 2024",
    language: "Português",
    level: "Médio/Superior",
    topics: ["Cinemática", "Dinâmica", "Energia", "Termodinâmica", "Eletricidade", "Magnetismo", "Óptica", "Física Moderna"]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Limpar apostilas existentes
    await Apostila.deleteMany({});
    console.log('🗑️  Apostilas antigas removidas');

    // Inserir novas apostilas
    await Apostila.insertMany(apostilas);
    console.log('✅ Apostilas inseridas com sucesso!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

seedDatabase();
