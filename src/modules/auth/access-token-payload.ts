export interface AccessTokenPayload {
  sub: string;
  email: string;
  jti: string;
  iat?: number;
  exp?: number;
}
