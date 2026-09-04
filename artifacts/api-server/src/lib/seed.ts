import { db, recipesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const seedUser = {
  id: "seed-pitada",
  displayName: "Pitada",
  username: "pitada",
  bio: "Receitas que cabem na vida real.",
};

const seedRecipes = [
  {
    authorId: seedUser.id,
    title: "Massa cremosa de limão",
    subtitle: "Leve, brilhante e pronta em 20 minutos.",
    category: "Rápidas",
    timeMinutes: 20,
    difficulty: "Fácil",
    servings: "2 porções",
    ingredients: ["200 g de massa curta", "1 limão-siciliano", "2 colheres de manteiga", "100 ml de creme de leite", "Parmesão ralado e salsinha"],
    steps: ["Cozinhe a massa em água salgada até ficar al dente. Reserve uma xícara da água do cozimento.", "Doure a manteiga, junte as raspas e o suco do limão em fogo baixo.", "Acrescente o creme, a massa e um pouco da água reservada. Finalize com parmesão e salsinha."],
    imageUrl: "asset://recipe-pasta",
    likesCount: 2480,
  },
  {
    authorId: seedUser.id,
    title: "Bowl da manhã",
    subtitle: "Frutas, iogurte e crocância para começar bem.",
    category: "Saudáveis",
    timeMinutes: 8,
    difficulty: "Fácil",
    servings: "1 porção",
    ingredients: ["1 pote de iogurte natural", "1 banana madura", "Frutas vermelhas a gosto", "3 colheres de granola", "Mel e sementes para finalizar"],
    steps: ["Coloque o iogurte em uma tigela e cubra com a banana fatiada.", "Distribua as frutas vermelhas e a granola em pequenos grupos.", "Finalize com um fio de mel e sementes. Sirva na hora para manter a crocância."],
    imageUrl: "asset://recipe-bowl",
    likesCount: 1896,
  },
  {
    authorId: seedUser.id,
    title: "Bolo de chocolate intenso",
    subtitle: "Macio no centro, com cobertura brilhante.",
    category: "Doces",
    timeMinutes: 45,
    difficulty: "Médio",
    servings: "8 fatias",
    ingredients: ["2 ovos", "1 xícara de açúcar", "1 xícara de farinha", "1/2 xícara de cacau", "Ganache de chocolate para cobrir"],
    steps: ["Misture os ovos e o açúcar até formar um creme claro.", "Peneire a farinha e o cacau, incorporando delicadamente à mistura.", "Asse a 180 °C por 30 minutos. Espere amornar e cubra com a ganache."],
    imageUrl: "asset://recipe-cake",
    likesCount: 1642,
  },
];

export async function seedDatabase(): Promise<void> {
  await db.insert(usersTable).values(seedUser).onConflictDoNothing({ target: usersTable.id });
  const existing = await db.select({ id: recipesTable.id }).from(recipesTable).where(eq(recipesTable.authorId, seedUser.id)).limit(1);
  if (existing.length === 0) {
    await db.insert(recipesTable).values(seedRecipes);
    logger.info({ count: seedRecipes.length }, "Seeded community recipes");
  }
}