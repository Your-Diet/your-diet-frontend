interface TokenPayload {
  permissions?: string[];
  exp?: number;
  [key: string]: any;
}

export const getToken = (): string | null => {
  const authData = localStorage.getItem('authData');
  if (!authData) return null;
  try {
    const parsedData = JSON.parse(authData);
    return parsedData.token || null;
  } catch (error) {
    console.error('Error parsing auth data:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const payload = getDecodedToken();
  if (!payload) return false;
  
  // Verificar se o token expirou
  if (payload.exp && typeof payload.exp === 'number') {
    const isExpired = payload.exp * 1000 < Date.now();
    if (isExpired) {
      console.log('Token expirado em:', new Date(payload.exp * 1000));
      return false;
    }
  }
  
  return true;
};

export const getDecodedToken = (): TokenPayload | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Dividir o token em partes
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token inválido: formato incorreto');
      return null;
    }
    
    // Decodificar o payload (parte do meio)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Erro ao decodificar o token:', error);
    return null;
  }
};

export const getUserPermissions = (): string[] => {
  const payload = getDecodedToken();
  if (!payload) return [];
  
  console.log('Payload do token:', payload);
  return Array.isArray(payload.permissions) ? payload.permissions : [];
};

export const hasPermission = (requiredPermission: string): boolean => {
  if (!requiredPermission) return true; // Se não houver permissão requerida, permite
  
  const permissions = getUserPermissions();
  const hasPerm = permissions.includes(requiredPermission);
  
  console.log(`Verificando permissão ${requiredPermission} - Possui: ${hasPerm}`, {
    todasPermissoes: permissions
  });
  
  return hasPerm;
};

export const logout = (): void => {
  localStorage.removeItem('authData');
  // Force a page reload to clear any application state
  window.location.href = '/';
};
