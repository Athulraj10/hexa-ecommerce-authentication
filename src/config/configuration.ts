import { registerAs } from '@nestjs/config';

export default registerAs('appEnvConfig', () => ({
    NODE_ENV:process.env.NODE_ENV,
    RABBITMQ_URL:process.env.RABBITMQ_URL,
    DATABASE_URL:process.env.DATABASE_URL,
    
    
    
    JWT_SECRET :process.env.JWT_SECRET,
    REFRESH_SECRET :process.env.REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRES_IN :process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN :process.env.REFRESH_TOKEN_EXPIRES_IN,
    
    
    DB_HOST:process.env.DB_HOST,
    DB_PORT:process.env.DB_PORT,
    DB_USERNAME:process.env.DB_USERNAME,
    DB_PASSWORD:process.env.DB_PASSWORD,
    DB_NAME:process.env.DB_NAME,
    
    GRPC_PORT:process.env.GRPC_PORT,
    HTTP_PORT:process.env.HTTP_PORT
}));