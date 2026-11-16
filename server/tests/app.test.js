import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'

let server
let base

before(async () => {
  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  base = `http://127.0.0.1:${server.address().port}`
})

after(() => server.close())

test('GET /api/health returns ok', async () => {
  const res = await fetch(`${base}/api/health`)
  assert.equal(res.status, 200)
  assert.equal((await res.json()).status, 'ok')
})

test('unknown /api route gives the standard 404 body', async () => {
  const res = await fetch(`${base}/api/nope`)
  assert.equal(res.status, 404)
  const { error } = await res.json()
  assert.equal(error.code, 'NOT_FOUND')
  assert.equal(error.details, null)
})

test('malformed JSON gives a 400 in the standard format', async () => {
  const res = await fetch(`${base}/api/health`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad',
  })
  assert.equal(res.status, 400)
  assert.equal((await res.json()).error.code, 'BAD_REQUEST')
})
