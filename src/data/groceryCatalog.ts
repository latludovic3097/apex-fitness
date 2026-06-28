// FITStark — Catalogue d'aliments pour la génération de liste de courses.
// Saisonnalité calibrée hémisphère nord ; pour l'hémisphère sud on décale le
// mois de 6 (voir effectiveMonth dans lib/grocery.ts) plutôt que de dupliquer
// les données — approximation suffisante pour une liste de courses, pas une
// base agronomique précise.

export type FoodCategory = "protein" | "carbs" | "fat" | "veg" | "fruit" | "dairy" | "other"

export interface GroceryCatalogItem {
  id: string
  name: string
  category: FoodCategory
  unit: string
  /** g de la macro principale pour 100g de l'aliment — protein/carbs/fat uniquement. */
  macroPer100g?: number
  /** Quantité de base par jour et par personne, dans `unit` — veg/fruit/dairy/other. */
  qtyPerDay?: number
  /** Mois (1-12) de pleine saison — absent = disponible toute l'année. */
  seasonMonths?: number[]
}

export const GROCERY_CATALOG: GroceryCatalogItem[] = [
  // ─── Protéines (g protéines / 100g) ───
  { id: "chicken_breast", name: "Blanc de poulet", category: "protein", unit: "g", macroPer100g: 23 },
  { id: "eggs", name: "Œufs", category: "protein", unit: "g", macroPer100g: 13 },
  { id: "tuna", name: "Thon (conserve)", category: "protein", unit: "g", macroPer100g: 25 },
  { id: "salmon", name: "Saumon", category: "protein", unit: "g", macroPer100g: 20 },
  { id: "beef_5", name: "Bœuf haché 5%", category: "protein", unit: "g", macroPer100g: 21 },
  { id: "tofu", name: "Tofu ferme", category: "protein", unit: "g", macroPer100g: 12 },
  { id: "lentils", name: "Lentilles cuites", category: "protein", unit: "g", macroPer100g: 9 },
  { id: "cottage_cheese", name: "Fromage blanc 0%", category: "protein", unit: "g", macroPer100g: 8 },
  { id: "greek_yogurt", name: "Yaourt grec", category: "protein", unit: "g", macroPer100g: 10 },
  { id: "whey", name: "Whey (poudre)", category: "protein", unit: "g", macroPer100g: 80 },

  // ─── Glucides (g glucides / 100g) ───
  { id: "rice", name: "Riz basmati", category: "carbs", unit: "g", macroPer100g: 78 },
  { id: "pasta_wheat", name: "Pâtes complètes", category: "carbs", unit: "g", macroPer100g: 70 },
  { id: "oats", name: "Flocons d'avoine", category: "carbs", unit: "g", macroPer100g: 60 },
  { id: "bread_wheat", name: "Pain complet", category: "carbs", unit: "g", macroPer100g: 45 },
  { id: "sweet_potato", name: "Patate douce", category: "carbs", unit: "g", macroPer100g: 20 },
  { id: "quinoa", name: "Quinoa", category: "carbs", unit: "g", macroPer100g: 64 },

  // ─── Lipides (g lipides / 100g) ───
  { id: "olive_oil", name: "Huile d'olive", category: "fat", unit: "mL", macroPer100g: 100 },
  { id: "almonds", name: "Amandes", category: "fat", unit: "g", macroPer100g: 50 },
  { id: "peanut_butter", name: "Beurre de cacahuète", category: "fat", unit: "g", macroPer100g: 50 },
  { id: "avocado", name: "Avocat", category: "fat", unit: "g", macroPer100g: 15 },

  // ─── Légumes (saison hémisphère nord) ───
  { id: "tomato", name: "Tomate", category: "veg", unit: "g", qtyPerDay: 120, seasonMonths: [6, 7, 8, 9] },
  { id: "zucchini", name: "Courgette", category: "veg", unit: "g", qtyPerDay: 120, seasonMonths: [6, 7, 8, 9] },
  { id: "broccoli", name: "Brocoli", category: "veg", unit: "g", qtyPerDay: 120, seasonMonths: [9, 10, 11, 12, 1, 2, 3] },
  { id: "spinach", name: "Épinards", category: "veg", unit: "g", qtyPerDay: 100, seasonMonths: [1, 2, 3, 4, 9, 10, 11, 12] },
  { id: "leek", name: "Poireau", category: "veg", unit: "g", qtyPerDay: 120, seasonMonths: [10, 11, 12, 1, 2, 3, 4] },
  { id: "lettuce", name: "Salade verte", category: "veg", unit: "g", qtyPerDay: 80, seasonMonths: [4, 5, 6, 7, 8, 9, 10] },
  { id: "carrot", name: "Carotte", category: "veg", unit: "g", qtyPerDay: 100 },
  { id: "cauliflower", name: "Chou-fleur", category: "veg", unit: "g", qtyPerDay: 120, seasonMonths: [9, 10, 11, 12, 1, 2, 3] },
  { id: "asparagus", name: "Asperge", category: "veg", unit: "g", qtyPerDay: 100, seasonMonths: [4, 5, 6] },
  { id: "pumpkin", name: "Potiron", category: "veg", unit: "g", qtyPerDay: 130, seasonMonths: [9, 10, 11, 12] },
  { id: "mushroom", name: "Champignon de Paris", category: "veg", unit: "g", qtyPerDay: 100 },
  { id: "bell_pepper", name: "Poivron", category: "veg", unit: "g", qtyPerDay: 100, seasonMonths: [6, 7, 8, 9] },

  // ─── Fruits (saison hémisphère nord) ───
  { id: "apple", name: "Pomme", category: "fruit", unit: "pièce", qtyPerDay: 1, seasonMonths: [8, 9, 10, 11, 12, 1, 2, 3] },
  { id: "banana", name: "Banane", category: "fruit", unit: "pièce", qtyPerDay: 1 },
  { id: "strawberry", name: "Fraise", category: "fruit", unit: "g", qtyPerDay: 150, seasonMonths: [5, 6, 7] },
  { id: "blueberry", name: "Myrtille", category: "fruit", unit: "g", qtyPerDay: 120, seasonMonths: [6, 7, 8] },
  { id: "orange", name: "Orange", category: "fruit", unit: "pièce", qtyPerDay: 1, seasonMonths: [11, 12, 1, 2, 3] },
  { id: "peach", name: "Pêche", category: "fruit", unit: "pièce", qtyPerDay: 1, seasonMonths: [6, 7, 8] },
  { id: "grape", name: "Raisin", category: "fruit", unit: "g", qtyPerDay: 150, seasonMonths: [8, 9, 10] },
  { id: "clementine", name: "Clémentine", category: "fruit", unit: "pièce", qtyPerDay: 2, seasonMonths: [11, 12, 1] },
  { id: "pear", name: "Poire", category: "fruit", unit: "pièce", qtyPerDay: 1, seasonMonths: [9, 10, 11, 12, 1] },

  // ─── Laitier ───
  { id: "milk", name: "Lait", category: "dairy", unit: "mL", qtyPerDay: 200 },
  { id: "plain_yogurt", name: "Yaourt nature", category: "dairy", unit: "pot", qtyPerDay: 1 },
  { id: "cheese", name: "Fromage", category: "dairy", unit: "g", qtyPerDay: 30 },

  // ─── Basiques ───
  { id: "garlic", name: "Ail", category: "other", unit: "tête", qtyPerDay: 0.15 },
  { id: "onion", name: "Oignon", category: "other", unit: "pièce", qtyPerDay: 0.3 },
  { id: "lemon", name: "Citron", category: "other", unit: "pièce", qtyPerDay: 0.25 },
]
