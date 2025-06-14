import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../theme/theme';
import RegisterForm from '../components/Register/RegisterForm';

const RegisterPage = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RegisterForm />
    </ThemeProvider>
  );
};

export default RegisterPage;
