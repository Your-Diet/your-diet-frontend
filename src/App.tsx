import { CssBaseline, ThemeProvider } from '@mui/material';
import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { theme } from './theme/theme';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { initSSEConnection, isAuthenticated } from './utils/auth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DietListPage from './pages/DietListPage';
import DietDetailPage from './pages/DietDetailPage';
import CreateDietPage from './pages/CreateDietPage';
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
  // Referência para controlar se o SSE já foi inicializado
  const isSSEInitialized = useRef(false);

  // Inicia a verificação automática do SSE apenas uma vez
  useEffect(() => {
    if (!isSSEInitialized.current) {
      initSSEConnection();
      isSSEInitialized.current = true;
    }
    console.log("batata")
  }, []); // O array vazio garante que só será executado uma vez

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <SidebarProvider>
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
                  <Route path="/dietas/novo" element={<CreateDietPage />} />
                  <Route path="/dietas/:dietId" element={<DietDetailPage />} />
                </Route>
                
                {/* Redirect any unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
        </SidebarProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
