import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Container, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Diet {
  id: string;
  name: string;
  // Add other fields as needed
}

const DietListPage: React.FC = () => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiets = async () => {
      try {
        const authData = localStorage.getItem('authData');
        if (!authData) {
          navigate('/login');
          return;
        }

        const { token } = JSON.parse(authData);
        const response = await fetch('http://localhost:8080/v1/diets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch diets');
        }

        const data = await response.json();
        setDiets(data);
      } catch (err) {
        setError('Failed to load diets. Please try again.');
        console.error('Error fetching diets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiets();
  }, [navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }


  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Minhas Dietas
      </Typography>
      <List>
        {diets.map((diet) => (
          <ListItem 
            key={diet.id}
            disablePadding
            sx={{
              mb: 2,
              borderRadius: 1,
              boxShadow: 1,
              '&:hover': {
                boxShadow: 3,
              },
            }}
          >
            <ListItemButton 
              component="a"
              href={`/dietas/${diet.id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/dietas/${diet.id}`, { state: { diet } });
              }}
              sx={{
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemText primary={diet.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default DietListPage;
