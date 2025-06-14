import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { theme } from './theme/theme';
import { SnackbarProvider } from './contexts/SnackbarContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DietListPage from './pages/DietListPage';
import DietDetailPage from './pages/DietDetailPage';

const PrivateRoute = () => {
  const isAuthenticated = !!localStorage.getItem('authData');
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<DietListPage />} />
              <Route path="/dietas" element={<DietListPage />} />
              <Route path="/dietas/:dietId" element={<DietDetailPage />} />
            </Route>
            
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
