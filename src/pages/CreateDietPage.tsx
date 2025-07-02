import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  IconButton,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Add as AddIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';


// ---- Type Definitions ----
interface Substitute {
  id: string;
  description: string;
  quantity: number;
  unit: string;
}

interface Ingredient {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  substitutes: Substitute[];
}

interface Meal {
  id: string;
  name: string;
  description: string;
  time_of_day: string;
  ingredients: Ingredient[];
}

const timeOfDayOptions = [
  { value: 'café_da_manhã', label: 'Café da Manhã' },
  { value: 'lanche_da_manhã', label: 'Lanche da Manhã' },
  { value: 'almoço', label: 'Almoço' },
  { value: 'lanche_da_tarde', label: 'Lanche da Tarde' },
  { value: 'jantar', label: 'Jantar' },
  { value: 'ceia', label: 'Ceia' },
];

const unitOptions = [
  'g',
  'ml',
  'un',
  'fatia(s)',
  'xícara(s)',
  'colher(es)',
];

export default function CreateDietPage() {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(30);
  const [userEmail, setUserEmail] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [observations, setObservations] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ---- Helper creators ----
  const createNewSubstitute = (): Substitute => ({
    id: uuidv4(),
    description: '',
    quantity: 0,
    unit: 'un',
  });

  const createNewIngredient = (): Ingredient => ({
    id: uuidv4(),
    description: '',
    quantity: 0,
    unit: 'un',
    substitutes: [],
  });

  const createNewMeal = (): Meal => ({
    id: uuidv4(),
    name: '',
    description: '',
    time_of_day: 'café_da_manhã',
    ingredients: [createNewIngredient()],
  });

  // ---- Meal handlers ----
  const addMeal = () => setMeals([...meals, createNewMeal()]);
  const removeMeal = (id: string) => setMeals(meals.filter(m => m.id !== id));
  const updateMealField = (id: string, field: keyof Meal, value: any) => {
    setMeals(meals.map(m => (m.id === id ? { ...m, [field]: value } : m)));
  };

  // ---- Ingredient handlers ----
  const addIngredient = (mealId: string) => {
    setMeals(meals.map(m =>
      m.id === mealId ? { ...m, ingredients: [...m.ingredients, createNewIngredient()] } : m
    ));
  };
  const removeIngredient = (mealId: string, ingredientId: string) => {
    setMeals(meals.map(m =>
      m.id === mealId ? { ...m, ingredients: m.ingredients.filter(i => i.id !== ingredientId) } : m
    ));
  };
  const updateIngredientField = (
    mealId: string,
    ingredientId: string,
    field: keyof Ingredient,
    value: any
  ) => {
    setMeals(meals.map(m =>
      m.id === mealId
        ? {
            ...m,
            ingredients: m.ingredients.map(i =>
              i.id === ingredientId ? { ...i, [field]: value } : i
            ),
          }
        : m
    ));
  };

  // ---- Substitute handlers ----
  const addSubstitute = (mealId: string, ingredientId: string) => {
    setMeals(meals.map(m =>
      m.id === mealId
        ? {
            ...m,
            ingredients: m.ingredients.map(i =>
              i.id === ingredientId
                ? { ...i, substitutes: [...i.substitutes, createNewSubstitute()] }
                : i
            ),
          }
        : m
    ));
  };
  const removeSubstitute = (
    mealId: string,
    ingredientId: string,
    substituteId: string
  ) => {
    setMeals(meals.map(m =>
      m.id === mealId
        ? {
            ...m,
            ingredients: m.ingredients.map(i =>
              i.id === ingredientId
                ? { ...i, substitutes: i.substitutes.filter(s => s.id !== substituteId) }
                : i
            ),
          }
        : m
    ));
  };
  const updateSubstituteField = (
    mealId: string,
    ingredientId: string,
    substituteId: string,
    field: keyof Substitute,
    value: any
  ) => {
    setMeals(meals.map(m =>
      m.id === mealId
        ? {
            ...m,
            ingredients: m.ingredients.map(i =>
              i.id === ingredientId
                ? {
                    ...i,
                    substitutes: i.substitutes.map(s =>
                      s.id === substituteId ? { ...s, [field]: value } : s
                    ),
                  }
                : i
            ),
          }
        : m
    ));
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const email = userEmail.trim();

      const response = await api.createDiet({
        user_email: email,
        name,
        duration_in_days: duration,
        observations,
        meals: meals.map(({ id, ...rest }) => ({
          ...rest,
          ingredients: rest.ingredients.map(({ id, ...ingRest }) => ({
            ...ingRest,
            substitutes: ingRest.substitutes.map(({ id, ...subRest }) => subRest),
          })),
        }))
      });

      if (response.error) {
        throw new Error(response.error);
      }

      navigate('/dietas');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao criar dieta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={3}>
          Criar Dieta
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Nome da Dieta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Email do Usuário"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
            <TextField
              label="Duração (dias)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
              required
            />
            <TextField
              label="Observações"
              multiline
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />

          </Stack>

          {/* ----- Meals Section ----- */}
          <Box mt={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6">Refeições</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addMeal}>Adicionar Refeição</Button>
            </Box>

            {meals.map(meal => (
              <Accordion key={meal.id} defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{meal.name || 'Refeição sem nome'}</Typography>
                  <Box flexGrow={1} />
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeMeal(meal.id); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <TextField
                      label="Nome da Refeição"
                      value={meal.name}
                      onChange={(e) => updateMealField(meal.id, 'name', e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Descrição"
                      value={meal.description}
                      onChange={(e) => updateMealField(meal.id, 'description', e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                    />
                    <TextField
                      label="Horário"
                      select
                      value={meal.time_of_day}
                      onChange={(e) => updateMealField(meal.id, 'time_of_day', e.target.value)}
                      fullWidth
                    >
                      {timeOfDayOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </TextField>

                    {/* Ingredients */}
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1">Ingredientes</Typography>
                        <Button size="small" startIcon={<AddIcon />} onClick={() => addIngredient(meal.id)}>Adicionar Ingrediente</Button>
                      </Box>
                      {meal.ingredients.map(ing => (
                        <Paper key={ing.id} sx={{ p: 2, mb: 2 }} variant="outlined">
                          <Grid container spacing={2} alignItems="center">
                            <Grid>
                              <TextField
                                label="Descrição"
                                value={ing.description}
                                onChange={(e) => updateIngredientField(meal.id, ing.id, 'description', e.target.value)}
                                fullWidth
                              />
                            </Grid>
                            <Grid>
                              <TextField
                                label="Qtd"
                                type="number"
                                value={ing.quantity}
                                onChange={(e) => updateIngredientField(meal.id, ing.id, 'quantity', parseFloat(e.target.value) || 0)}
                                fullWidth
                              />
                            </Grid>
                            <Grid>
                              <TextField
                                label="Unidade"
                                select
                                value={ing.unit}
                                onChange={(e) => updateIngredientField(meal.id, ing.id, 'unit', e.target.value)}
                                fullWidth
                              >
                                {unitOptions.map(u => (
                                  <MenuItem key={u} value={u}>{u}</MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                            <Grid>
                              <IconButton onClick={() => removeIngredient(meal.id, ing.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Grid>
                          </Grid>

                          {/* Substitutes */}
                          <Box mt={2} ml={1}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2">Substitutos</Typography>
                              <Button size="small" startIcon={<AddIcon />} onClick={() => addSubstitute(meal.id, ing.id)}>Adicionar Substituto</Button>
                            </Box>
                            {ing.substitutes.map(sub => (
                              <Grid container spacing={2} alignItems="center" key={sub.id} sx={{ mb: 1 }}>
                                <Grid>
                                  <TextField
                                    label="Descrição"
                                    value={sub.description}
                                    onChange={(e) => updateSubstituteField(meal.id, ing.id, sub.id, 'description', e.target.value)}
                                    fullWidth
                                    size="small"
                                  />
                                </Grid>
                                <Grid>
                                  <TextField
                                    label="Qtd"
                                    type="number"
                                    value={sub.quantity}
                                    onChange={(e) => updateSubstituteField(meal.id, ing.id, sub.id, 'quantity', parseFloat(e.target.value) || 0)}
                                    fullWidth
                                    size="small"
                                  />
                                </Grid>
                                <Grid>
                                  <TextField
                                    label="Unidade"
                                    select
                                    value={sub.unit}
                                    onChange={(e) => updateSubstituteField(meal.id, ing.id, sub.id, 'unit', e.target.value)}
                                    fullWidth
                                    size="small"
                                  >
                                    {unitOptions.map(u => (
                                      <MenuItem key={u} value={u}>{u}</MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>
                                <Grid>
                                  <IconButton size="small" onClick={() => removeSubstitute(meal.id, ing.id, sub.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            ))}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Box mt={3}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Salvando…' : 'Salvar'}
            </Button>
          </Box>

        </form>
      </Paper>
    </Container>
  );
}