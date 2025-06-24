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
  const token = getToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

export const getUserPermissions = (): string[] => {
  const token = getToken();
  if (!token) return [];
  
  try {
    const payload: TokenPayload = JSON.parse(atob(token.split('.')[1]));
    return payload.permissions || [];
  } catch (error) {
    console.error('Error decoding token:', error);
    return [];
  }
};

export const hasPermission = (requiredPermission: string): boolean => {
  const permissions = getUserPermissions();
  return permissions.includes(requiredPermission);
};
