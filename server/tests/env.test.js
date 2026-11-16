import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadEnv, ConfigError } from '../config/env.js'

const URI = 'mongodb+srv://u:p@cluster.example.net/fittrack'

test('valid env gives the URI and the default port', () => {
  const env = loadEnv({ MONGODB_URI: URI })
  assert.equal(env.mongodbUri, URI)
  assert.equal(env.port, 3001)
})

test('PORT is read when set', () => {
  assert.equal(loadEnv({ MONGODB_URI: URI, PORT: '4000' }).port, 4000)
})

test('missing MONGODB_URI fails with a clear message', () => {
  assert.throws(() => loadEnv({}), (e) => e instanceof ConfigError && /MONGODB_URI is not set/.test(e.message))
})

test('wrong MONGODB_URI scheme fails', () => {
  assert.throws(() => loadEnv({ MONGODB_URI: 'http://example.com' }), /must start with "mongodb/)
})

test('bad PORT fails', () => {
  assert.throws(() => loadEnv({ MONGODB_URI: URI, PORT: 'abc' }), /PORT must be/)
  assert.throws(() => loadEnv({ MONGODB_URI: URI, PORT: '70000' }), /PORT must be/)
})
