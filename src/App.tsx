import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { theme } from './theme/theme';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { isAuthenticated } from './utils/auth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DietListPage from './pages/DietListPage';
import DietDetailPage from './pages/DietDetailPage';
import MainLayout from './components/Layout/MainLayout';

const PrivateRoute = () => {
  return isAuthenticated() ? (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ) : (
    <Navigate to="/login" />
  );
};

const PublicRoute = () => {
  return !isAuthenticated() ? <Outlet /> : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            
            {/* Protected routes with layout */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<DietListPage />} />
              <Route path="/dietas" element={<DietListPage />} />
              <Route path="/dietas/novo" element={<div>Nova Dieta</div>} />
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
