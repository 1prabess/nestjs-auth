import { registerAs } from "@nestjs/config";

export default registerAs("databaseConfig", () => ({
    databaseUrl: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USERNAME ?? '',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'nestjs-auth',
}))