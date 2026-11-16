// Errors always use { error: { code, message, details } }. 500s never leak internals.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  // Malformed JSON or a body over the size limit.
  if (err.type === 'entity.parse.failed') return send(res, 400, 'BAD_REQUEST', 'Request body is not valid JSON.')
  if (err.type === 'entity.too.large') return send(res, 400, 'BAD_REQUEST', 'Request body is too large.')

  if (err.status && err.status < 500 && err.expose) {
    return send(res, err.status, err.code ?? 'BAD_REQUEST', err.message, err.details)
  }

  console.error(err)
  return send(res, 500, 'INTERNAL_ERROR', 'Something went wrong on the server.')
}

function send(res, status, code, message, details = null) {
  res.status(status).json({ error: { code, message, details } })
}
