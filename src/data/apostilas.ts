import matematicaCover from '@/assets/covers/matematica-cover.jpg';
import portuguesCover from '@/assets/covers/portugues-cover.jpg';
import direitoCover from '@/assets/covers/direito-cover.jpg';
import informaticaCover from '@/assets/covers/informatica-cover.jpg';
import logicaCover from '@/assets/covers/logica-cover.jpg';
import adminCover from '@/assets/covers/admin-cover.jpg';

export interface Apostila {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  category: string;
  cover: string;
  pages: number;
  rating: number;
  reviews: number;
  features: string[];
  isPurchased?: boolean;
  author?: string;
  lastUpdate?: string;
  language?: string;
  level?: string;
  topics?: string[];
}

export const apostilas: Apostila[] = [
  {
    id: "1",
    title: "Matemática Completa para Concursos",
    description: "Material completo com teoria e mais de 500 exercícios resolvidos. Ideal para concursos públicos de nível médio e superior.",
    longDescription: "Esta apostila foi desenvolvida especialmente para candidatos que desejam dominar a matemática exigida nos principais concursos públicos do Brasil. Com uma abordagem didática e progressiva, o material cobre desde os fundamentos básicos até os tópicos mais avançados, sempre com foco na resolução prática de questões. Cada capítulo traz teoria explicada de forma clara, exemplos resolvidos passo a passo, e uma bateria de exercícios com gabaritos comentados. Ideal tanto para quem está começando quanto para quem quer revisar e aprofundar conhecimentos.",
    price: 49.90,
    originalPrice: 89.90,
    category: "Concursos",
    cover: matematicaCover,
    pages: 320,
    rating: 4.8,
    reviews: 234,
    features: ["500+ exercícios", "Gabarito comentado", "Atualizada 2024", "Mapas mentais"],
    author: "Prof. Carlos Eduardo",
    lastUpdate: "Dezembro 2024",
    language: "Português",
    level: "Médio/Superior",
    topics: ["Aritmética", "Álgebra", "Geometria", "Estatística", "Probabilidade", "Matemática Financeira"],
  },
  {
    id: "2",
    title: "Português - Gramática e Redação",
    description: "Domine a língua portuguesa com teoria clara e exercícios práticos. Inclui técnicas de redação para vestibulares.",
    longDescription: "A apostila de Português mais completa do mercado, elaborada por professores especialistas com anos de experiência em preparação para concursos e vestibulares. O material abrange gramática normativa, interpretação de texto, produção textual e literatura. Destaque especial para as técnicas de redação que já ajudaram milhares de alunos a alcançarem notas acima de 900 no ENEM. Inclui análise de redações nota máxima e modelos comentados.",
    price: 39.90,
    originalPrice: 69.90,
    category: "Vestibulares",
    cover: portuguesCover,
    pages: 280,
    rating: 4.9,
    reviews: 189,
    features: ["Gramática completa", "Redação nota 1000", "Exercícios ENEM", "Técnicas de interpretação"],
    author: "Profa. Ana Paula Santos",
    lastUpdate: "Novembro 2024",
    language: "Português",
    level: "Médio/Superior",
    topics: ["Morfologia", "Sintaxe", "Semântica", "Redação", "Interpretação", "Literatura"],
  },
  {
    id: "3",
    title: "Direito Constitucional Esquematizado",
    description: "Apostila com mapas mentais e resumos objetivos. Perfeita para OAB e concursos jurídicos.",
    longDescription: "Material indispensável para quem busca aprovação em concursos da área jurídica ou no exame da OAB. A apostila apresenta todo o conteúdo de Direito Constitucional de forma esquematizada, facilitando a memorização e a revisão. Inclui súmulas vinculantes, jurisprudência atualizada do STF e STJ, e questões comentadas das principais bancas. Os mapas mentais exclusivos permitem uma revisão rápida e eficiente antes das provas.",
    price: 59.90,
    originalPrice: 99.90,
    category: "Direito",
    cover: direitoCover,
    pages: 420,
    rating: 4.7,
    reviews: 156,
    features: ["Mapas mentais", "Súmulas atualizadas", "Questões OAB", "Jurisprudência STF/STJ"],
    author: "Dr. Ricardo Mendes",
    lastUpdate: "Dezembro 2024",
    language: "Português",
    level: "Superior",
    topics: ["Princípios Fundamentais", "Direitos e Garantias", "Organização do Estado", "Poderes", "Controle de Constitucionalidade"],
  },
  {
    id: "4",
    title: "Informática para Iniciantes",
    description: "Aprenda do básico ao avançado com linguagem simples. Inclui Windows, Office e Internet.",
    longDescription: "Apostila perfeita para quem está começando ou precisa revisar conceitos de informática para concursos. O material é escrito em linguagem acessível, com muitas ilustrações e tutoriais passo a passo. Cobre desde os conceitos básicos de hardware e software até tópicos mais específicos como segurança da informação e computação em nuvem. Atualizada com as versões mais recentes do Windows e pacote Office.",
    price: 29.90,
    originalPrice: 49.90,
    category: "Concursos",
    cover: informaticaCover,
    pages: 180,
    rating: 4.6,
    reviews: 312,
    features: ["Passo a passo", "Exercícios práticos", "Dicas para provas", "Screenshots atualizados"],
    author: "Prof. Marcos Silva",
    lastUpdate: "Outubro 2024",
    language: "Português",
    level: "Básico/Médio",
    topics: ["Windows 11", "Office 365", "Internet", "Segurança", "Hardware", "Redes"],
  },
  {
    id: "5",
    title: "Raciocínio Lógico Descomplicado",
    description: "Técnicas e macetes para resolver qualquer questão de lógica. Material objetivo e direto ao ponto.",
    longDescription: "Se você tem dificuldade com raciocínio lógico, esta apostila foi feita para você! Desenvolvida com uma metodologia exclusiva que simplifica os conceitos mais complexos, o material ensina técnicas e macetes que aceleram a resolução de questões. Inclui todos os tipos de questões cobradas em concursos: proposições, tabelas-verdade, sequências, matrizes lógicas e muito mais. As vídeo-aulas complementares reforçam o aprendizado.",
    price: 44.90,
    originalPrice: 79.90,
    category: "Concursos",
    cover: logicaCover,
    pages: 240,
    rating: 4.8,
    reviews: 278,
    features: ["Macetes exclusivos", "300+ questões", "Vídeo-aulas bônus", "Resolução comentada"],
    author: "Prof. Lucas Ferreira",
    lastUpdate: "Novembro 2024",
    language: "Português",
    level: "Médio",
    topics: ["Proposições", "Tabela-Verdade", "Sequências", "Matrizes Lógicas", "Probabilidade", "Análise Combinatória"],
  },
  {
    id: "6",
    title: "Administração Pública - Teoria e Prática",
    description: "Conteúdo atualizado sobre gestão pública, políticas e governança. Essencial para concursos administrativos.",
    longDescription: "Apostila completa de Administração Pública, abordando desde os conceitos fundamentais até as tendências mais recentes em gestão governamental. O material é atualizado com a Reforma Administrativa, Nova Lei de Licitações e outros marcos legais recentes. Ideal para concursos de Analista Administrativo, Gestor Público e cargos correlatos. Inclui casos práticos reais que facilitam a compreensão dos conceitos teóricos.",
    price: 54.90,
    originalPrice: 89.90,
    category: "Concursos",
    cover: adminCover,
    pages: 350,
    rating: 4.5,
    reviews: 98,
    features: ["Casos práticos", "Legislação atualizada", "Resumos", "Questões comentadas"],
    author: "Profa. Juliana Costa",
    lastUpdate: "Dezembro 2024",
    language: "Português",
    level: "Superior",
    topics: ["Gestão Pública", "Políticas Públicas", "Governança", "Licitações", "Orçamento Público", "Controle"],
  },
];

export const categories = [
  "Todos",
  "Concursos",
  "Vestibulares",
  "Direito",
  "ENEM",
];
