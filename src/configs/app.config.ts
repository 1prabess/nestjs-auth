import {registerAs} from "@nestjs/config"

export default registerAs("appConfig", ()=> ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
}))