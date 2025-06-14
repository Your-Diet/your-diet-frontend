import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../theme/theme';
import Login from '../components/Login/Login';

const LoginPage = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Login />
    </ThemeProvider>
  );
};

export default LoginPage;
