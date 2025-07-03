export interface TokenPayload {
    permissions?: string[];
    exp?: number;
    [key: string]: any;
  }