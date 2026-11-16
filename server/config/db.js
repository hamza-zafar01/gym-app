import mongoose from 'mongoose'

// Connects to MongoDB; failures become short messages (the URI is never printed).
export async function connectDb(uri) {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
  } catch (err) {
    throw new Error(describeConnectionError(err))
  }
}

export function disconnectDb() {
  return mongoose.disconnect()
}

function describeConnectionError(err) {
  const text = `${err?.name ?? ''} ${err?.message ?? ''}`
  if (/auth/i.test(text)) return 'MongoDB rejected the username or password in MONGODB_URI.'
  if (/ENOTFOUND|querySrv|EBADNAME/i.test(text)) return 'Could not find the MongoDB host in MONGODB_URI. Check the cluster address.'
  if (/ServerSelection|timed out|ECONNREFUSED/i.test(text)) {
    return 'Could not reach MongoDB. Check MONGODB_URI, your internet connection, and that your IP is allowed in Atlas (Network Access).'
  }
  if (/Invalid|URI|scheme/i.test(text)) return 'MONGODB_URI is not a valid MongoDB connection string.'
  return `Could not connect to MongoDB (${err?.name ?? 'unknown error'}).`
}
