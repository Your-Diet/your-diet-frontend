export interface Substitutes {
  description: string;
  quantity: number;
  unit: string;
  substitutes: Substitutes[] | null;
}

export interface Ingredient {
  description: string;
  quantity: number;
  unit: string;
  substitutes: Substitutes[] | null;
}

export interface Meal {
  name: string;
  description: string;
  time_of_day: string;
  ingredients: Ingredient[];
}

export interface Diet {
  id: string;
  user_email: string;
  name: string;
  duration_in_days: number;
  status: string;
  meals: Meal[];
  observations: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
