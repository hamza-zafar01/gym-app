import { loadEnv } from './config/env.js'
import { connectDb } from './config/db.js'
import { createApp } from './app.js'

try {
  const { mongodbUri, port, isProduction } = loadEnv()
  await connectDb(mongodbUri)
  createApp({ serveClient: isProduction }).listen(port, () => {
    console.log(`FitTrack server ready on http://localhost:${port} (MongoDB connected)`)
  })
} catch (err) {
  console.error(`Server not started: ${err.message}`)
  process.exit(1)
}
