import 'dotenv/config'

export class ConfigError extends Error {}

// Reads and checks environment variables. Throws ConfigError with a clear message.
export function loadEnv(env = process.env) {
  const uri = (env.MONGODB_URI ?? '').trim()
  if (!uri) {
    throw new ConfigError('MONGODB_URI is not set. Copy .env.example to .env and add your MongoDB Atlas connection string.')
  }
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new ConfigError('MONGODB_URI must start with "mongodb://" or "mongodb+srv://".')
  }

  const rawPort = (env.PORT ?? '').trim()
  const port = rawPort === '' ? 3001 : Number(rawPort)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError(`PORT must be a whole number from 1 to 65535 (got "${rawPort}").`)
  }

  return { mongodbUri: uri, port, isProduction: env.NODE_ENV === 'production' }
}
