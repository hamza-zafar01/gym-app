// One place that knows every saved collection, for backup and restore.
//
// Each collection keeps its own load/save (and its own localStorage key) in its
// own util file. This registry lists them together so Export/Import can treat
// them as one dataset. Each collection is plain JSON with ids and ISO dates,
// so it maps 1:1 to a database collection later.
import { loadWorkouts, saveWorkouts } from './workoutStorage.js'
import { loadPlans, savePlans } from './planner.js'
import { loadWeightData, saveWeightData } from './weight.js'
import { loadGoals, saveGoals } from './goals.js'
import { loadProfile, saveProfile } from './profile.js'

export const BACKUP_APP = 'fittrack'
export const BACKUP_SCHEMA_VERSION = 1

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

// isValid: quick check on a backup's raw value; load/save: the collection's own functions.
export const COLLECTIONS = {
  workouts: { label: 'workouts', load: loadWorkouts, save: saveWorkouts, isValid: Array.isArray, count: (d) => d.length },
  planner: { label: 'planned workouts', load: loadPlans, save: savePlans, isValid: Array.isArray, count: (d) => d.length },
  weight: {
    label: 'weigh-ins',
    load: loadWeightData,
    save: saveWeightData,
    isValid: (v) => isObject(v) && Array.isArray(v.entries),
    count: (d) => d.entries.length,
  },
  goals: { label: 'goals', load: loadGoals, save: saveGoals, isValid: Array.isArray, count: (d) => d.length },
  profile: { label: 'profile', load: loadProfile, save: saveProfile, isValid: isObject, count: (d) => (d.name ? 1 : 0) },
}

// Reads every collection (each loader already drops bad records).
export function loadAll(storage = globalThis.localStorage) {
  return Object.fromEntries(Object.entries(COLLECTIONS).map(([name, c]) => [name, c.load(storage)]))
}

// The backup file's content, as an object.
export function buildBackup(storage = globalThis.localStorage, now = new Date()) {
  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    data: loadAll(storage),
  }
}

export function backupFileName(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `fittrack-backup-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`
}

// A throwaway in-memory storage, so the normal loaders clean imported data
// exactly like they clean saved data.
function memoryStorage() {
  const map = new Map()
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) }
}

// Checks backup text without touching real storage.
// Returns { ok: true, data } with cleaned collections, or { ok: false, error }.
export function parseBackup(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' }
  }
  if (!isObject(parsed) || parsed.app !== BACKUP_APP || !isObject(parsed.data)) {
    return { ok: false, error: 'That file is not a FitTrack backup.' }
  }
  if (!Number.isInteger(parsed.schemaVersion) || parsed.schemaVersion > BACKUP_SCHEMA_VERSION) {
    return { ok: false, error: 'This backup was made by a newer version of FitTrack.' }
  }

  const scratch = memoryStorage()
  const data = {}
  for (const [name, c] of Object.entries(COLLECTIONS)) {
    const raw = parsed.data[name]
    if (raw === undefined) {
      data[name] = c.load(scratch) // missing collection = empty
    } else if (!c.isValid(raw)) {
      return { ok: false, error: `The "${name}" data in this backup is damaged.` }
    } else {
      c.save(raw, scratch)
      data[name] = c.load(scratch)
    }
  }
  return { ok: true, data }
}

// "12 workouts, 3 goals" for the confirmation message.
export function describeData(data) {
  const parts = Object.entries(COLLECTIONS)
    .filter(([name, c]) => name !== 'profile' && c.count(data[name]) > 0)
    .map(([name, c]) => `${c.count(data[name])} ${c.label}`)
  return parts.length ? parts.join(', ') : 'no records'
}

// Writes cleaned backup data over everything. Returns true only if every
// collection saved; on failure the previous data is put back.
export function restoreAll(data, storage = globalThis.localStorage) {
  const previous = loadAll(storage)
  const saved = Object.entries(COLLECTIONS).every(([name, c]) => c.save(data[name], storage))
  if (!saved) {
    for (const [name, c] of Object.entries(COLLECTIONS)) c.save(previous[name], storage)
  }
  return saved
}
