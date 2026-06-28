// FITStark — Idées de préparation par aliment de la liste de courses.
// 3 idées courtes par aliment, taguées par moment du repas pour aider à
// répartir les achats sur la semaine. Pas des recettes complètes : juste
// de quoi savoir comment, quand, dans quel ordre et en quelle quantité
// préparer chaque aliment.
//
// Grammage : JAMAIS stocké en dur, toujours calculé (voir lib/grocery.ts) :
//  - aliment principal (clé du dictionnaire) → cible macro réelle de l'utilisateur
//  - `extras` (ingrédients secondaires nommés, présents au catalogue) → portion
//    de référence du catalogue
//  - `seasoning` : condiments/herbes dont le grammage ne change rien aux calories
//    ("à volonté"), ou mentions volontairement libres ("légumes au choix") —
//    inventer un chiffre serait malhonnête, donc pas de grammage affiché pour eux.

export type MealTime = "breakfast" | "lunch" | "snack" | "dinner"

export interface RecipeIdea {
  title: string
  meal: MealTime
  /** Étapes ordonnées, avec le timing quand il compte (ex: "Saisir 2 min, puis..."). */
  steps: string[]
  /** Ingrédients secondaires nommés, présents au catalogue → grammage calculable. */
  extras?: string[]
  /** Condiments/herbes/mentions libres, sans grammage pertinent. */
  seasoning?: string
  /** false = idée d'usage (condiment, accompagnement) — pas un repas complet à
   *  proposer seul dans le planning hebdo, mais reste affichée dans les idées
   *  recette de l'aliment. Par défaut true. */
  standalone?: boolean
}

export const GROCERY_RECIPES: Record<string, RecipeIdea[]> = {
  // ─── Protéines ───
  chicken_breast: [
    {
      title: "Poulet grillé citron-ail",
      meal: "dinner",
      steps: ["Mariner le poulet 15 min dans citron, ail écrasé et huile d'olive.", "Griller 6-7 min par face à feu moyen-vif."],
      extras: ["lemon", "garlic", "olive_oil"],
    },
    {
      title: "Salade poulet-avocat",
      meal: "lunch",
      steps: ["Émincer le poulet déjà cuit, refroidi.", "Mélanger avec avocat en cubes et tomates, ajouter la vinaigrette en dernier pour ne pas ramollir la salade."],
      extras: ["avocado", "tomato"],
      seasoning: "vinaigrette légère",
    },
    {
      title: "Wrap poulet effiloché",
      meal: "snack",
      steps: ["Effilocher du poulet froid à la fourchette.", "Garnir une tortilla de poulet, crudités puis yaourt grec, rouler serré."],
      extras: ["greek_yogurt"],
      seasoning: "crudités, tortilla",
    },
  ],
  eggs: [
    {
      title: "Œufs brouillés à l'avoine",
      meal: "breakfast",
      steps: ["Battre les œufs, cuire 2-3 min à feu doux en remuant.", "Servir à côté des flocons d'avoine et des fruits."],
      extras: ["oats"],
      seasoning: "fruits de saison",
    },
    {
      title: "Œufs durs à emporter",
      meal: "snack",
      steps: ["Cuire à l'eau bouillante 8-10 min, puis refroidir sous l'eau froide.", "Garder au frais jusqu'à 4 jours, écaler au moment de manger."],
    },
    {
      title: "Omelette légumes de saison",
      meal: "dinner",
      steps: ["Faire revenir les légumes 3-4 min à la poêle.", "Battre les œufs, verser sur les légumes, cuire 4-5 min à feu doux."],
      seasoning: "légumes de saison au choix",
    },
  ],
  tuna: [
    {
      title: "Salade de thon-quinoa",
      meal: "lunch",
      steps: ["Égoutter le thon.", "Mélanger avec le quinoa déjà cuit, les tomates et un filet de citron."],
      extras: ["quinoa", "tomato", "lemon"],
    },
    {
      title: "Tartine de thon",
      meal: "breakfast",
      steps: ["Écraser le thon avec un peu de yaourt grec.", "Tartiner sur le pain complet juste avant de servir."],
      extras: ["greek_yogurt", "bread_wheat"],
    },
    {
      title: "Poivrons farcis au thon",
      meal: "dinner",
      steps: ["Mélanger thon, riz cuit et épices.", "Farcir les poivrons évidés, four 10 min à 200°C."],
      extras: ["rice", "bell_pepper"],
      seasoning: "épices",
    },
  ],
  salmon: [
    {
      title: "Saumon au four et légumes",
      meal: "dinner",
      steps: ["Disposer le saumon nature avec les légumes de saison sur une plaque.", "Four 15 min à 180°C."],
      seasoning: "légumes de saison au choix",
    },
    {
      title: "Tartine saumon-avocat",
      meal: "breakfast",
      steps: ["Écraser l'avocat sur le pain complet.", "Déposer les tranches de saumon par-dessus juste avant de servir."],
      extras: ["bread_wheat", "avocado"],
    },
    {
      title: "Poke bowl saumon",
      meal: "lunch",
      steps: ["Préparer le riz et laisser tiédir.", "Disposer saumon et légumes croquants sur le riz, arroser de sauce soja-citron au moment de servir."],
      extras: ["rice"],
      seasoning: "légumes croquants, sauce soja-citron",
    },
  ],
  beef_5: [
    {
      title: "Bolognaise maison",
      meal: "dinner",
      steps: ["Faire revenir oignon et ail 2 min, ajouter la viande et saisir 5 min.", "Ajouter les tomates, mijoter 20 min à couvert."],
      extras: ["onion", "garlic", "tomato"],
    },
    {
      title: "Burger maison",
      meal: "lunch",
      steps: ["Façonner la viande en steak, saler juste avant cuisson.", "Griller 4 min par face, assembler avec pain complet et crudités."],
      extras: ["bread_wheat"],
      seasoning: "crudités",
    },
    {
      title: "Poêlée bœuf-légumes",
      meal: "dinner",
      steps: ["Saisir la viande 3-4 min à feu vif.", "Ajouter les légumes de saison, sauce soja, poursuivre 5 min."],
      seasoning: "légumes de saison au choix, sauce soja",
    },
  ],
  tofu: [
    {
      title: "Tofu mariné grillé",
      meal: "dinner",
      steps: ["Couper le tofu en tranches, mariner 20 min dans tamari et gingembre râpé.", "Griller à la poêle 3-4 min par face."],
      seasoning: "tamari, gingembre",
    },
    {
      title: "Tofu brouillé curcuma",
      meal: "breakfast",
      steps: ["Émietter le tofu à la fourchette.", "Cuire 4-5 min à la poêle avec curcuma et légumes, comme des œufs brouillés."],
      seasoning: "curcuma, légumes au choix",
    },
    {
      title: "Salade tofu-quinoa",
      meal: "lunch",
      steps: ["Dorer les cubes de tofu à la poêle 5 min.", "Mélanger avec quinoa cuit et légumes croquants, vinaigrette sésame en dernier."],
      extras: ["quinoa"],
      seasoning: "légumes croquants, vinaigrette sésame",
    },
  ],
  lentils: [
    {
      title: "Salade de lentilles",
      meal: "lunch",
      steps: ["Égoutter les lentilles cuites.", "Mélanger avec tomates et oignon rouge émincé, ajouter la vinaigrette moutarde juste avant de servir."],
      extras: ["tomato", "onion"],
      seasoning: "vinaigrette moutarde",
    },
    {
      title: "Soupe de lentilles",
      meal: "dinner",
      steps: ["Faire revenir les carottes et l'oignon 3 min.", "Ajouter les lentilles et le bouillon, mijoter 20 min."],
      extras: ["carrot", "onion"],
    },
    {
      title: "Houmous de lentilles",
      meal: "snack",
      steps: ["Mixer les lentilles avec citron, ail et huile d'olive jusqu'à texture lisse.", "Tartiner sur des crudités."],
      extras: ["lemon", "garlic", "olive_oil"],
    },
  ],
  cottage_cheese: [
    {
      title: "Bowl fromage blanc-fruits",
      meal: "breakfast",
      steps: ["Verser le fromage blanc dans un bol.", "Ajouter les fruits de saison et un filet de miel juste avant de servir."],
      seasoning: "fruits de saison, filet de miel",
    },
    {
      title: "Sauce fromage blanc-herbes",
      meal: "lunch",
      steps: ["Mélanger le fromage blanc avec herbes fraîches ciselées et citron.", "Servir frais pour napper des crudités."],
      extras: ["lemon"],
      seasoning: "herbes fraîches",
    },
    {
      title: "Collation simple",
      meal: "snack",
      steps: ["Servir nature avec une pincée de cannelle."],
      seasoning: "cannelle",
    },
  ],
  greek_yogurt: [
    {
      title: "Bowl petit-déj protéiné",
      meal: "breakfast",
      steps: ["Verser le yaourt grec dans un bol.", "Ajouter flocons d'avoine, fruits et un filet de miel par-dessus."],
      extras: ["oats"],
      seasoning: "fruits, filet de miel",
    },
    {
      title: "Tzatziki maison",
      meal: "lunch",
      steps: ["Râper le concombre, presser pour enlever l'eau.", "Mélanger avec le yaourt, ail et menthe, réserver au frais 10 min avant de servir."],
      extras: ["garlic"],
      seasoning: "concombre, menthe",
    },
    {
      title: "Collation post-training",
      meal: "snack",
      steps: ["Servir nature avec une cuillère de beurre de cacahuète mélangée."],
      extras: ["peanut_butter"],
    },
  ],
  whey: [
    {
      title: "Shake post-training",
      meal: "snack",
      steps: ["Mixer la whey avec eau ou lait et une banane jusqu'à texture lisse.", "Boire dans les 30 min après l'entraînement."],
      extras: ["banana", "milk"],
    },
    {
      title: "Pancakes protéinés",
      meal: "breakfast",
      steps: ["Mélanger whey, œuf, flocons d'avoine et banane écrasée.", "Cuire à la poêle 2 min par face à feu doux-moyen."],
      extras: ["eggs", "oats", "banana"],
    },
    {
      title: "Porridge protéiné",
      meal: "breakfast",
      steps: ["Cuire les flocons d'avoine d'abord.", "Hors du feu, incorporer la whey en remuant pour éviter les grumeaux."],
      extras: ["oats"],
    },
  ],

  // ─── Glucides ───
  rice: [
    {
      title: "Riz sauté aux légumes",
      meal: "dinner",
      steps: ["Faire revenir les légumes de saison 4-5 min à feu vif.", "Ajouter le riz déjà cuit et la sauce soja, sauter 2-3 min."],
      seasoning: "légumes de saison au choix, sauce soja",
    },
    {
      title: "Bowl riz-protéine",
      meal: "lunch",
      steps: ["Préparer le riz et laisser tiédir.", "Disposer la protéine au choix et les légumes par-dessus, arroser de sauce."],
      seasoning: "protéine au choix, légumes, sauce au choix",
    },
    {
      title: "Riz au lait léger",
      meal: "snack",
      steps: ["Cuire le riz dans le lait à feu doux 18-20 min en remuant.", "Ajouter cannelle et un peu de miel en fin de cuisson."],
      extras: ["milk"],
      seasoning: "cannelle, miel",
    },
  ],
  pasta_wheat: [
    {
      title: "Pâtes bolognaise",
      meal: "dinner",
      steps: ["Cuire les pâtes selon le paquet.", "Napper de sauce bolognaise maison chaude."],
      extras: ["beef_5", "tomato"],
    },
    {
      title: "Salade de pâtes froides",
      meal: "lunch",
      steps: ["Cuire les pâtes, rincer à l'eau froide pour stopper la cuisson.", "Mélanger avec légumes croquants et vinaigrette, à emporter."],
      seasoning: "légumes croquants, vinaigrette",
    },
    {
      title: "Pâtes au thon",
      meal: "dinner",
      steps: ["Cuire les pâtes.", "Mélanger à chaud avec thon égoutté, tomates cerises, huile d'olive et basilic."],
      extras: ["tuna", "tomato", "olive_oil"],
      seasoning: "basilic",
    },
  ],
  oats: [
    {
      title: "Porridge classique",
      meal: "breakfast",
      steps: ["Cuire les flocons dans lait ou eau 3-4 min à feu doux en remuant.", "Ajouter fruits et cannelle en fin de cuisson."],
      extras: ["milk"],
      seasoning: "fruits, cannelle",
    },
    {
      title: "Overnight oats",
      meal: "breakfast",
      steps: ["Mélanger flocons, lait/yaourt et fruits le soir dans un bocal.", "Réserver au frigo toute la nuit, prêt à manger froid le matin."],
      extras: ["milk"],
      seasoning: "fruits de saison",
    },
    {
      title: "Barres énergétiques maison",
      meal: "snack",
      steps: ["Mélanger flocons, beurre de cacahuète et miel chaud jusqu'à pâte homogène.", "Tasser dans un moule, figer 2h au frigo, puis découper en barres."],
      extras: ["peanut_butter"],
      seasoning: "miel",
    },
  ],
  bread_wheat: [
    {
      title: "Tartine avocat-œuf",
      meal: "breakfast",
      steps: ["Pocher l'œuf 3 min dans l'eau frémissante.", "Écraser l'avocat sur le pain grillé, déposer l'œuf et les graines par-dessus."],
      extras: ["avocado", "eggs"],
    },
    {
      title: "Sandwich complet",
      meal: "lunch",
      steps: ["Garnir le pain de la protéine au choix.", "Ajouter crudités et sauce légère juste avant de fermer le sandwich."],
      seasoning: "protéine au choix, crudités, sauce légère",
    },
    {
      title: "Toast fromage blanc-concombre",
      meal: "snack",
      steps: ["Tartiner le pain grillé de fromage blanc.", "Ajouter des rondelles de concombre et du poivre."],
      extras: ["cottage_cheese"],
      seasoning: "concombre, poivre",
    },
  ],
  sweet_potato: [
    {
      title: "Patate douce rôtie",
      meal: "dinner",
      steps: ["Couper en quartiers, assaisonner d'épices.", "Four 25 min à 200°C, accompagner d'une protéine."],
      seasoning: "épices, protéine au choix en accompagnement",
    },
    {
      title: "Frites de patate douce",
      meal: "lunch",
      steps: ["Couper en bâtonnets réguliers, peu d'huile.", "Four 20 min à 200°C en retournant à mi-cuisson."],
      extras: ["olive_oil"],
    },
    {
      title: "Purée de patate douce",
      meal: "dinner",
      steps: ["Cuire à la vapeur 15-20 min jusqu'à tendre.", "Écraser avec un peu de lait."],
      extras: ["milk"],
    },
  ],
  quinoa: [
    {
      title: "Bowl quinoa-légumes",
      meal: "lunch",
      steps: ["Cuire le quinoa, laisser tiédir.", "Mélanger avec légumes de saison, vinaigrette citron en dernier."],
      extras: ["lemon"],
      seasoning: "légumes de saison au choix",
    },
    {
      title: "Porridge de quinoa",
      meal: "breakfast",
      steps: ["Cuire le quinoa dans du lait 15 min à feu doux.", "Ajouter fruits et cannelle en fin de cuisson."],
      extras: ["milk"],
      seasoning: "fruits, cannelle",
    },
    {
      title: "Quinoa froid à emporter",
      meal: "snack",
      steps: ["Cuire le quinoa la veille, réserver au frigo.", "Mélanger avec légumes croquants et citron au moment de partir."],
      extras: ["lemon"],
      seasoning: "légumes croquants",
    },
  ],

  // ─── Lipides ───
  olive_oil: [
    {
      title: "Vinaigrette maison",
      meal: "lunch",
      steps: ["Mélanger huile d'olive, citron et moutarde.", "Verser sur la salade juste avant de servir."],
      extras: ["lemon"],
      seasoning: "moutarde",
      standalone: false,
    },
    {
      title: "Légumes rôtis",
      meal: "dinner",
      steps: ["Napper les légumes de saison d'huile d'olive avant cuisson.", "Four 20-25 min à 200°C."],
      seasoning: "légumes de saison au choix",
      standalone: false,
    },
    {
      title: "Filet sur tartine",
      meal: "breakfast",
      steps: ["Déposer tomate et sel sur la tartine.", "Finir avec quelques gouttes d'huile d'olive."],
      extras: ["tomato"],
      seasoning: "sel",
      standalone: false,
    },
  ],
  almonds: [
    { title: "Collation nature", meal: "snack", steps: ["Servir une poignée, pratique à emporter telle quelle."] },
    {
      title: "Topping porridge",
      meal: "breakfast",
      steps: ["Concasser grossièrement les amandes.", "Parsemer sur le porridge juste avant de servir."],
    },
    {
      title: "Mix énergétique",
      meal: "snack",
      steps: ["Mélanger les amandes avec des fruits secs.", "Préparer en sachet avant l'entraînement."],
      seasoning: "fruits secs au choix",
    },
  ],
  peanut_butter: [
    {
      title: "Tartine banane",
      meal: "breakfast",
      steps: ["Tartiner le pain complet de beurre de cacahuète.", "Ajouter les rondelles de banane par-dessus."],
      extras: ["bread_wheat", "banana"],
    },
    {
      title: "Shake post-training",
      meal: "snack",
      steps: ["Mixer une cuillère de beurre de cacahuète avec la whey et le lait."],
      extras: ["whey", "milk"],
    },
    {
      title: "Sauce satay légère",
      meal: "dinner",
      steps: ["Diluer le beurre de cacahuète avec un peu d'eau chaude et de sauce soja.", "Napper légumes ou protéine en fin de cuisson."],
      seasoning: "eau chaude, sauce soja",
      standalone: false,
    },
  ],
  avocado: [
    {
      title: "Avocado toast",
      meal: "breakfast",
      steps: ["Écraser l'avocat à la fourchette avec citron.", "Étaler sur le pain complet, finir avec piment doux."],
      extras: ["bread_wheat", "lemon"],
      seasoning: "piment doux",
    },
    {
      title: "Guacamole maison",
      meal: "snack",
      steps: ["Écraser l'avocat avec citron, oignon et tomate émincés.", "Servir frais avec des crudités à tremper."],
      extras: ["lemon", "onion", "tomato"],
    },
    {
      title: "Salade avocat-thon",
      meal: "lunch",
      steps: ["Couper l'avocat en cubes.", "Mélanger avec thon égoutté et tomates, vinaigrette légère en dernier."],
      extras: ["tuna", "tomato"],
      seasoning: "vinaigrette légère",
    },
  ],

  // ─── Légumes ───
  tomato: [
    {
      title: "Salade tomate-basilic",
      meal: "lunch",
      steps: ["Couper les tomates en quartiers.", "Ajouter huile d'olive, basilic frais et sel juste avant de servir."],
      extras: ["olive_oil"],
      seasoning: "basilic frais, sel",
    },
    {
      title: "Sauce tomate maison",
      meal: "dinner",
      steps: ["Faire revenir ail et oignon 2 min.", "Ajouter les tomates, mijoter 20 min à couvert pour pâtes ou riz."],
      extras: ["garlic", "onion"],
    },
    {
      title: "Tomates farcies",
      meal: "dinner",
      steps: ["Évider les tomates, réserver la chair.", "Farcir de riz et protéine mélangés, four 20 min à 200°C."],
      extras: ["rice"],
      seasoning: "protéine au choix",
    },
  ],
  zucchini: [
    {
      title: "Courgettes sautées",
      meal: "dinner",
      steps: ["Couper en rondelles.", "Sauter 6-8 min à la poêle avec ail, huile d'olive et herbes."],
      extras: ["garlic", "olive_oil"],
      seasoning: "herbes",
    },
    {
      title: "Spaghetti de courgette",
      meal: "lunch",
      steps: ["Tailler la courgette en longues lanières à l'économe.", "Sauter rapidement 2-3 min, napper de sauce tomate ou pesto."],
      seasoning: "sauce tomate ou pesto",
    },
    {
      title: "Gratin de courgettes",
      meal: "dinner",
      steps: ["Couper en tranches fines, disposer dans un plat.", "Parsemer d'un peu de fromage, four 25 min à 190°C."],
      extras: ["cheese"],
    },
  ],
  broccoli: [
    {
      title: "Brocoli vapeur",
      meal: "dinner",
      steps: ["Cuire à la vapeur 8 min jusqu'à tendre-croquant.", "Assaisonner d'huile d'olive et citron au moment de servir."],
      extras: ["olive_oil", "lemon"],
    },
    {
      title: "Brocoli sauté à l'ail",
      meal: "lunch",
      steps: ["Détailler en petits bouquets.", "Sauter 5 min à la poêle avec ail et sauce soja."],
      extras: ["garlic"],
      seasoning: "sauce soja",
    },
    {
      title: "Soupe de brocoli",
      meal: "dinner",
      steps: ["Cuire le brocoli dans le bouillon 12 min.", "Mixer avec un peu de fromage blanc jusqu'à texture lisse."],
      extras: ["cottage_cheese"],
    },
  ],
  spinach: [
    {
      title: "Épinards à la poêle",
      meal: "dinner",
      steps: ["Faire revenir l'ail 1 min.", "Ajouter les épinards, sauter 2-3 min jusqu'à ce qu'ils tombent."],
      extras: ["garlic"],
    },
    {
      title: "Smoothie vert",
      meal: "breakfast",
      steps: ["Mixer une poignée d'épinards crus avec banane et lait jusqu'à texture lisse."],
      extras: ["banana", "milk"],
    },
    {
      title: "Omelette aux épinards",
      meal: "breakfast",
      steps: ["Sauter les épinards 2 min à la poêle.", "Battre les œufs, verser dessus, cuire 4-5 min à feu doux."],
      extras: ["eggs"],
    },
  ],
  leek: [
    {
      title: "Fondue de poireaux",
      meal: "dinner",
      steps: ["Émincer le poireau finement.", "Cuire doucement 15 min à la poêle à couvert, ajouter un peu de crème légère en fin de cuisson."],
      seasoning: "crème légère",
    },
    {
      title: "Soupe poireaux-pomme de terre",
      meal: "dinner",
      steps: ["Faire revenir le poireau 3 min.", "Ajouter le bouillon, mijoter 20 min, puis mixer."],
      seasoning: "pomme de terre, bouillon",
    },
    {
      title: "Poireaux vinaigrette",
      meal: "lunch",
      steps: ["Cuire le poireau entier 15 min à l'eau bouillante, égoutter et refroidir.", "Servir froid avec une vinaigrette moutarde."],
      seasoning: "vinaigrette moutarde",
    },
  ],
  lettuce: [
    {
      title: "Salade composée",
      meal: "lunch",
      steps: ["Disposer la salade en base.", "Ajouter la protéine au choix et les légumes de saison, vinaigrette en dernier."],
      seasoning: "protéine au choix, légumes de saison, vinaigrette",
    },
    {
      title: "Wrap en feuille de salade",
      meal: "snack",
      steps: ["Choisir de grandes feuilles de salade en remplacement de tortilla.", "Garnir au choix et rouler juste avant de manger."],
      seasoning: "garniture au choix",
    },
    {
      title: "Accompagnement simple",
      meal: "dinner",
      steps: ["Servir en accompagnement léger de n'importe quel plat principal."],
      standalone: false,
    },
  ],
  carrot: [
    {
      title: "Carottes râpées",
      meal: "lunch",
      steps: ["Râper les carottes.", "Assaisonner de citron et d'un peu d'huile d'olive juste avant de servir."],
      extras: ["lemon", "olive_oil"],
    },
    {
      title: "Bâtonnets à croquer",
      meal: "snack",
      steps: ["Couper en bâtonnets.", "Servir nature ou avec houmous, pratique à emporter."],
      seasoning: "houmous (optionnel)",
    },
    {
      title: "Carottes rôties au four",
      meal: "dinner",
      steps: ["Couper en bâtonnets, assaisonner de cumin et d'un filet d'huile d'olive.", "Four 20 min à 200°C."],
      extras: ["olive_oil"],
      seasoning: "cumin",
    },
  ],
  cauliflower: [
    {
      title: "Riz de chou-fleur",
      meal: "dinner",
      steps: ["Mixer le chou-fleur cru en petits grains.", "Sauter 5 min à la poêle, alternative légère au riz."],
    },
    {
      title: "Chou-fleur rôti",
      meal: "lunch",
      steps: ["Détailler en bouquets, assaisonner d'épices.", "Four 25 min à 200°C en retournant à mi-cuisson."],
      seasoning: "épices",
    },
    {
      title: "Purée de chou-fleur",
      meal: "dinner",
      steps: ["Cuire à la vapeur 15 min jusqu'à tendre.", "Mixer avec un peu de lait jusqu'à texture lisse."],
      extras: ["milk"],
    },
  ],
  asparagus: [
    {
      title: "Asperges grillées",
      meal: "dinner",
      steps: ["Napper d'huile d'olive.", "Griller à la poêle ou au four 8-10 min, finir avec un filet de citron."],
      extras: ["olive_oil", "lemon"],
    },
    {
      title: "Asperges-œuf mollet",
      meal: "breakfast",
      steps: ["Cuire les asperges à la vapeur 6-8 min.", "Cuire l'œuf mollet 6 min à l'eau bouillante, servir ensemble avec du sel."],
      extras: ["eggs"],
    },
    {
      title: "Risotto d'asperges",
      meal: "dinner",
      steps: ["Préparer le risotto classique (riz nacré dans le bouillon, en remuant).", "Incorporer les pointes d'asperges 5 min avant la fin de cuisson."],
      extras: ["rice"],
      seasoning: "bouillon",
    },
  ],
  pumpkin: [
    {
      title: "Soupe de potiron",
      meal: "dinner",
      steps: ["Faire revenir l'oignon 2 min, ajouter le potiron en cubes.", "Couvrir de bouillon, mijoter 20 min puis mixer avec une touche de crème légère."],
      extras: ["onion"],
      seasoning: "bouillon, crème légère",
    },
    {
      title: "Potiron rôti",
      meal: "lunch",
      steps: ["Couper en cubes, assaisonner d'épices.", "Four 25 min à 200°C."],
      seasoning: "épices",
    },
    {
      title: "Purée de potiron",
      meal: "dinner",
      steps: ["Cuire à la vapeur 15-18 min jusqu'à tendre.", "Écraser, servir en accompagnement d'une protéine."],
      seasoning: "protéine au choix en accompagnement",
    },
  ],
  mushroom: [
    {
      title: "Champignons à la poêle",
      meal: "dinner",
      steps: ["Couper les champignons en lamelles.", "Sauter 5-6 min à feu vif avec ail et persil."],
      extras: ["garlic"],
      seasoning: "persil",
    },
    {
      title: "Omelette aux champignons",
      meal: "breakfast",
      steps: ["Sauter les champignons 4 min jusqu'à évaporation de l'eau.", "Battre les œufs, verser dessus, cuire 4-5 min."],
      extras: ["eggs"],
    },
    {
      title: "Champignons farcis",
      meal: "lunch",
      steps: ["Retirer les pieds des champignons, garnir les chapeaux de fromage blanc et herbes.", "Four 15 min à 190°C."],
      extras: ["cottage_cheese"],
      seasoning: "herbes",
    },
  ],
  bell_pepper: [
    {
      title: "Poivrons sautés",
      meal: "dinner",
      steps: ["Couper en lanières.", "Sauter 6-8 min à la poêle avec l'oignon."],
      extras: ["onion"],
      standalone: false,
    },
    {
      title: "Poivrons farcis",
      meal: "dinner",
      steps: ["Évider les poivrons, garder le chapeau.", "Farcir de riz et protéine mélangés, four 25 min à 200°C."],
      extras: ["rice"],
      seasoning: "protéine au choix",
    },
    {
      title: "Bâtonnets crus",
      meal: "snack",
      steps: ["Couper en bâtonnets.", "Servir nature ou avec houmous."],
      seasoning: "houmous (optionnel)",
    },
  ],

  // ─── Fruits ───
  apple: [
    { title: "Encas nature", meal: "snack", steps: ["Croquer simplement, à emporter telle quelle."] },
    {
      title: "Pomme au four cannelle",
      meal: "dinner",
      steps: ["Évider la pomme, garnir le centre de cannelle.", "Four 20 min à 180°C."],
      seasoning: "cannelle",
    },
    {
      title: "Compote maison",
      meal: "breakfast",
      steps: ["Couper en morceaux, cuire avec un peu d'eau 10-12 min à couvert.", "Écraser grossièrement à la fourchette."],
    },
  ],
  banana: [
    {
      title: "Shake post-training",
      meal: "snack",
      steps: ["Mixer la banane avec whey et lait jusqu'à texture lisse."],
      extras: ["whey", "milk"],
    },
    {
      title: "Porridge banane",
      meal: "breakfast",
      steps: ["Écraser la banane à la fourchette.", "Incorporer aux flocons d'avoine en fin de cuisson."],
      extras: ["oats"],
    },
    {
      title: "Pancakes 2 ingrédients",
      meal: "breakfast",
      steps: ["Écraser la banane et la mélanger aux œufs battus.", "Cuire à la poêle 2 min par face à feu doux."],
      extras: ["eggs"],
    },
  ],
  strawberry: [
    {
      title: "Bowl fromage blanc-fraises",
      meal: "breakfast",
      steps: ["Couper les fraises en morceaux.", "Disposer sur le fromage blanc ou yaourt grec juste avant de servir."],
      extras: ["cottage_cheese"],
    },
    {
      title: "Smoothie fraise-banane",
      meal: "snack",
      steps: ["Mixer les fraises avec une banane et du lait ou yaourt."],
      extras: ["banana", "milk"],
    },
    { title: "Dessert léger", meal: "dinner", steps: ["Couper simplement en dessert de saison."], standalone: false },
  ],
  blueberry: [
    {
      title: "Topping porridge",
      meal: "breakfast",
      steps: ["Parsemer les myrtilles sur le porridge ou yaourt grec juste avant de servir."],
      extras: ["greek_yogurt"],
    },
    {
      title: "Smoothie myrtille",
      meal: "snack",
      steps: ["Mixer les myrtilles avec une banane et du lait."],
      extras: ["banana", "milk"],
    },
    { title: "Encas nature", meal: "snack", steps: ["Servir une poignée nature, riche en antioxydants."] },
  ],
  orange: [
    { title: "Jus pressé minute", meal: "breakfast", steps: ["Presser l'orange juste avant de servir.", "Boire dans les 10 minutes pour garder les vitamines."] },
    {
      title: "Salade d'orange",
      meal: "dinner",
      steps: ["Peler à vif et couper en quartiers.", "Saupoudrer d'une touche de cannelle, dessert léger."],
      seasoning: "cannelle",
      standalone: false,
    },
    { title: "Encas nature", meal: "snack", steps: ["Peler et manger simplement, riche en vitamine C."] },
  ],
  peach: [
    {
      title: "Pêche grillée",
      meal: "dinner",
      steps: ["Couper la pêche en deux, dénoyauter.", "Griller 3 min côté chair à la poêle, dessert léger."],
      standalone: false,
    },
    {
      title: "Bowl fromage blanc-pêche",
      meal: "breakfast",
      steps: ["Couper la pêche en tranches.", "Disposer sur le fromage blanc juste avant de servir."],
      extras: ["cottage_cheese"],
    },
    { title: "Encas nature", meal: "snack", steps: ["Croquer simplement, à emporter telle quelle."] },
  ],
  grape: [
    { title: "Encas nature", meal: "snack", steps: ["Servir une grappe, pratique et sucrée naturellement."] },
    {
      title: "Salade de saison",
      meal: "dinner",
      steps: ["Couper les grains en deux si besoin.", "Mélanger avec d'autres fruits de saison, en dessert."],
      seasoning: "autres fruits de saison au choix",
      standalone: false,
    },
    {
      title: "Topping fromage blanc",
      meal: "breakfast",
      steps: ["Parsemer quelques grains sur le fromage blanc juste avant de servir."],
      extras: ["cottage_cheese"],
    },
  ],
  clementine: [
    { title: "Encas nature", meal: "snack", steps: ["Éplucher et manger simplement, facile à emporter."] },
    {
      title: "Salade d'agrumes",
      meal: "dinner",
      steps: ["Peler la clémentine à vif.", "Mélanger avec quartiers d'orange, dessert léger d'hiver."],
      extras: ["orange"],
      standalone: false,
    },
    { title: "Boost vitamine C", meal: "breakfast", steps: ["Manger en complément du petit-déjeuner."], standalone: false },
  ],
  pear: [
    {
      title: "Poire pochée",
      meal: "dinner",
      steps: ["Pocher la poire pelée 10 min dans l'eau frémissante avec cannelle.", "Laisser tiédir avant de servir, dessert léger."],
      seasoning: "cannelle",
      standalone: false,
    },
    {
      title: "Bowl yaourt-poire",
      meal: "breakfast",
      steps: ["Couper la poire en tranches fines.", "Disposer sur le yaourt grec juste avant de servir."],
      extras: ["greek_yogurt"],
    },
    { title: "Encas nature", meal: "snack", steps: ["Croquer simplement, à emporter telle quelle."] },
  ],

  // ─── Laitier ───
  milk: [
    {
      title: "Porridge au lait",
      meal: "breakfast",
      steps: ["Verser le lait sur les flocons d'avoine.", "Cuire 3-4 min à feu doux en remuant."],
      extras: ["oats"],
    },
    {
      title: "Shake protéiné",
      meal: "snack",
      steps: ["Mixer le lait avec whey ou fruits jusqu'à texture lisse."],
      extras: ["whey"],
      seasoning: "fruits au choix",
    },
    {
      title: "Sauce béchamel légère",
      meal: "dinner",
      steps: ["Chauffer le lait à feu doux.", "Incorporer en remuant pour napper légumes ou gratins."],
      standalone: false,
    },
  ],
  plain_yogurt: [
    {
      title: "Bowl petit-déj",
      meal: "breakfast",
      steps: ["Verser le yaourt dans un bol.", "Ajouter fruits et flocons d'avoine par-dessus."],
      extras: ["oats"],
      seasoning: "fruits de saison",
    },
    {
      title: "Sauce pour crudités",
      meal: "lunch",
      steps: ["Mélanger le yaourt avec herbes ciselées et citron.", "Réserver au frais avant de servir avec des crudités."],
      extras: ["lemon"],
      seasoning: "herbes ciselées",
      standalone: false,
    },
    { title: "Collation simple", meal: "snack", steps: ["Servir nature avec un peu de miel."], seasoning: "miel" },
  ],
  cheese: [
    {
      title: "Tartine fromage-tomate",
      meal: "breakfast",
      steps: ["Déposer une tranche de fromage sur le pain complet.", "Ajouter une tranche de tomate par-dessus."],
      extras: ["bread_wheat", "tomato"],
    },
    {
      title: "Salade composée",
      meal: "lunch",
      steps: ["Couper le fromage en cubes.", "Mélanger avec des légumes de saison juste avant de servir."],
      seasoning: "légumes de saison au choix",
    },
    {
      title: "Gratin léger",
      meal: "dinner",
      steps: ["Disposer les légumes dans un plat à gratin.", "Parsemer de fromage râpé, four 20-25 min à 190°C."],
      seasoning: "légumes au choix",
      standalone: false,
    },
  ],

  // ─── Basiques (usages, pas des recettes en soi) ───
  garlic: [
    {
      title: "Base aromatique",
      meal: "dinner",
      steps: ["Émincer l'ail finement.", "Faire revenir 1 min en tout début de cuisson pour relever sautés et sauces tomate."],
      standalone: false,
    },
    {
      title: "Vinaigrette relevée",
      meal: "lunch",
      steps: ["Hacher une pointe d'ail.", "Incorporer à la vinaigrette juste avant de servir."],
      standalone: false,
    },
    {
      title: "Tartine grillée à l'ail",
      meal: "snack",
      steps: ["Griller la tartine.", "Frotter d'ail encore chaude, finir avec un filet d'huile d'olive."],
      extras: ["olive_oil"],
      standalone: false,
    },
  ],
  onion: [
    {
      title: "Base de sauce tomate",
      meal: "dinner",
      steps: ["Émincer l'oignon.", "Faire revenir 2-3 min en tout début de cuisson avant d'ajouter le reste."],
      standalone: false,
    },
    {
      title: "Oignons rouges marinés",
      meal: "lunch",
      steps: ["Émincer en fines lamelles.", "Couvrir de vinaigre 15 min avant de servir sur des salades."],
      seasoning: "vinaigre",
      standalone: false,
    },
    {
      title: "Soupe à l'oignon légère",
      meal: "dinner",
      steps: ["Émincer les oignons, les faire fondre doucement 10 min à la poêle.", "Couvrir de bouillon, mijoter 20-25 min."],
      seasoning: "bouillon",
    },
  ],
  lemon: [
    {
      title: "Vinaigrette citronnée",
      meal: "lunch",
      steps: ["Presser le citron.", "Mélanger avec l'huile d'olive, verser sur la salade juste avant de servir."],
      extras: ["olive_oil"],
      standalone: false,
    },
    {
      title: "Eau citronnée du matin",
      meal: "breakfast",
      steps: ["Presser un demi-citron dans un verre d'eau.", "Boire au réveil, avant le petit-déjeuner."],
      standalone: false,
    },
    {
      title: "Marinade poisson/poulet",
      meal: "dinner",
      steps: ["Presser le citron, mélanger avec des herbes.", "Mariner la viande ou le poisson 15 min avant cuisson."],
      seasoning: "herbes",
      standalone: false,
    },
  ],
}
