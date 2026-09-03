import type { ImageSourcePropType } from 'react-native';

export type Recipe = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  initials: string;
  category: string;
  time: string;
  difficulty: string;
  likes: number;
  servings: string;
  image: ImageSourcePropType;
  ingredients: string[];
  steps: string[];
};

export const categories = ['Todas', 'Mais curtidas', 'Rápidas', 'Doces', 'Saudáveis'];

export const recipes: Recipe[] = [
  {
    id: 'massa-limao',
    title: 'Massa cremosa de limão',
    subtitle: 'Leve, brilhante e pronta em 20 minutos.',
    author: 'Lia Martins',
    initials: 'LM',
    category: 'Rápidas',
    time: '20 min',
    difficulty: 'Fácil',
    likes: 2480,
    servings: '2 porções',
    image: require('@/assets/images/recipe-pasta.jpg'),
    ingredients: [
      '200 g de massa curta',
      '1 limão-siciliano',
      '2 colheres de manteiga',
      '100 ml de creme de leite',
      'Parmesão ralado e salsinha',
    ],
    steps: [
      'Cozinhe a massa em água salgada até ficar al dente. Reserve uma xícara da água do cozimento.',
      'Doure a manteiga, junte as raspas e o suco do limão em fogo baixo.',
      'Acrescente o creme, a massa e um pouco da água reservada. Finalize com parmesão e salsinha.',
    ],
  },
  {
    id: 'bowl-manha',
    title: 'Bowl da manhã',
    subtitle: 'Frutas, iogurte e crocância para começar bem.',
    author: 'Caio Nunes',
    initials: 'CN',
    category: 'Saudáveis',
    time: '8 min',
    difficulty: 'Fácil',
    likes: 1896,
    servings: '1 porção',
    image: require('@/assets/images/recipe-bowl.jpg'),
    ingredients: [
      '1 pote de iogurte natural',
      '1 banana madura',
      'Frutas vermelhas a gosto',
      '3 colheres de granola',
      'Mel e sementes para finalizar',
    ],
    steps: [
      'Coloque o iogurte em uma tigela e cubra com a banana fatiada.',
      'Distribua as frutas vermelhas e a granola em pequenos grupos.',
      'Finalize com um fio de mel e sementes. Sirva na hora para manter a crocância.',
    ],
  },
  {
    id: 'bolo-chocolate',
    title: 'Bolo de chocolate intenso',
    subtitle: 'Macio no centro, com cobertura brilhante.',
    author: 'Nina Faria',
    initials: 'NF',
    category: 'Doces',
    time: '45 min',
    difficulty: 'Médio',
    likes: 1642,
    servings: '8 fatias',
    image: require('@/assets/images/recipe-cake.jpg'),
    ingredients: [
      '2 ovos',
      '1 xícara de açúcar',
      '1 xícara de farinha',
      '1/2 xícara de cacau',
      'Ganache de chocolate para cobrir',
    ],
    steps: [
      'Misture os ovos e o açúcar até formar um creme claro.',
      'Peneire a farinha e o cacau, incorporando delicadamente à mistura.',
      'Asse a 180 °C por 30 minutos. Espere amornar e cubra com a ganache.',
    ],
  },
];

export function getRecipe(id: string) {
  return recipes.find((recipe) => recipe.id === id);
}
