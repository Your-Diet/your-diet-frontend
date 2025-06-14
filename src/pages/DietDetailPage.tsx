import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import type { Diet, Meal, Ingredient } from '../types/diet';

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

const IngredientItem: React.FC<{ ingredient: Ingredient }> = ({ ingredient }) => {
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const hasSubstitutes = ingredient.substitutes && ingredient.substitutes.length > 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography>
          {ingredient.quantity} {ingredient.unit} de {ingredient.description}
        </Typography>
        {hasSubstitutes && (
          <Chip
            label={showSubstitutes ? 'Ocultar substitutos' : 'Mostrar substitutos'}
            size="small"
            onClick={() => setShowSubstitutes(!showSubstitutes)}
            sx={{ ml: 1, cursor: 'pointer' }}
          />
        )}
      </Box>
      
      {showSubstitutes && hasSubstitutes && (
        <Box sx={{ ml: 3, mt: 1, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Substitutos:
          </Typography>
          {ingredient.substitutes?.map((sub, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography>
                {sub.quantity} {sub.unit} de {sub.description}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

const MealAccordion: React.FC<{ meal: Meal }> = ({ meal }) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <Typography>{meal.name}</Typography>
          <Chip 
            label={meal.time_of_day.replace('_', ' ')}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" paragraph>
          {meal.description}
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          Ingredientes:
        </Typography>
        <List dense>
          {meal.ingredients.map((ingredient, idx) => (
            <React.Fragment key={idx}>
              <ListItem>
                <IngredientItem ingredient={ingredient} />
              </ListItem>
              {idx < meal.ingredients.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

const DietDetailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const diet = location.state?.diet as Diet | undefined;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no diet was passed in location state, show error
    if (!diet) {
      setError('Dieta não encontrada');
    }
  }, [diet]);

  // If diet data is not available yet, show loading or error state
  if (!diet) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <CircularProgress />
        )}
      </Box>
    );
  }

  if (error || !diet) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">
          {error || 'Dieta não encontrada'}
        </Typography>
      </Container>
    );
  }

  const handleBack = () => {
    navigate('/dietas');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton 
            onClick={handleBack}
            aria-label="Voltar"
            size="small"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h4" component="h1">
            {diet.name}
          </Typography>
        </Stack>
        
        <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`Início: ${formatDate(diet.created_at)}`}
            variant="outlined"
          />
          <Chip
            label={`Duração: ${diet.duration_in_days} dias`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {diet.observations && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Observações:
            </Typography>
            <Typography>{diet.observations}</Typography>
          </Box>
        )}
      </Paper>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Refeições
      </Typography>
      
      <Box sx={{ '& .MuiAccordion-root': { mb: 2 } }}>
        {diet.meals.map((meal, index) => (
          <MealAccordion key={index} meal={meal} />
        ))}
      </Box>
    </Container>
  );
};

export default DietDetailPage;
