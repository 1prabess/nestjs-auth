export interface AuthTokens extends AccessToken, RefreshToken {}

export interface AccessToken {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface RefreshToken {
  refreshToken: string;
}
