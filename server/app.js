import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import mongoose from 'mongoose'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting']

// The Express app without listen(), so tests can import it.
export function createApp({ serveClient = false, distDir = DIST } = {}) {
  const app = express()
  app.use(express.json({ limit: '100kb' }))

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: DB_STATES[mongoose.connection.readyState] ?? 'unknown' })
  })

  app.use('/api', notFound)

  // Production: the built React app is served from the same origin.
  if (serveClient && fs.existsSync(path.join(distDir, 'index.html'))) {
    app.use(express.static(distDir))
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next()
      res.sendFile(path.join(distDir, 'index.html'))
    })
  }

  app.use(errorHandler)
  return app
}
