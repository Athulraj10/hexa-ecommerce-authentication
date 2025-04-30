import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
// import * as dotenv from "dotenv";
import { Client } from "pg"; 
import { User } from "./entities/user.entity";
import { Address } from "./entities/address.entity";
import { RefreshToken } from "./entities/refreshToken.entity";
import configuration from "src/config/configuration";
// import * as dotenv from 'dotenv';
// dotenv.config();
const config = configuration();

const databaseConfig: DataSourceOptions = {
  type: "postgres",
  host: config.DB_HOST,
  port: Number(config.DB_PORT),
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  entities: [User, Address, RefreshToken],
  migrations: [__dirname + "/../migrations/*.{ts,js}"],
  synchronize: false,
  logging: config.NODE_ENV === "development",
  ssl: config.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  migrationsTableName: "custom_migrations_table",
};


export const AppDataSource = new DataSource(databaseConfig);

async function ensureDatabaseExists() {
  const client = new Client({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: "postgres", // Connect to default DB first
  });

  try {
    await client.connect();
    const result = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [config.DB_NAME]);

    if (result.rowCount === 0) {
      console.log(`Database "${config.DB_NAME}" does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${config.DB_NAME}" WITH ENCODING 'UTF8' OWNER "${config.DB_USERNAME}";`);
      console.log(`✅ Database "${config.DB_NAME}" created successfully.`);
    } else {
      console.log(`✅ Database "${config.DB_NAME}" already exists.`);
    }
  } catch (error) {
    console.error("❌ Error checking/creating database:", error);
  } finally {
    await client.end();
  }
}

async function initializeDatabase() {
  await ensureDatabaseExists();
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

export { initializeDatabase };
