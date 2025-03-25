export const jwtConfig = {
    jwtAccessTokenSecret: process.env.JWT_SECRET || 'default_secret',
    refreshSecret: process.env.REFRESH_SECRET || 'default_refresh_secret',
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15d',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  };
  