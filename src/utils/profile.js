// The user's profile. Only the display name for now.
//
// Profile = { name: string }  (empty string = not set yet)
export const PROFILE_STORAGE_KEY = 'fittrack.profile.v1'

export const DEFAULT_NAME = 'Athlete'
export const MAX_NAME_LENGTH = 30

export const EMPTY_PROFILE = { name: '' }

export const cleanProfileName = (s) => String(s ?? '').trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH)

// What to show in greetings.
export const displayName = (profile) => profile.name || DEFAULT_NAME

// Never throws: bad/missing/corrupt data gives an empty profile.
export function loadProfile(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(PROFILE_STORAGE_KEY))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return EMPTY_PROFILE
    return { name: typeof parsed.name === 'string' ? cleanProfileName(parsed.name) : '' }
  } catch {
    return EMPTY_PROFILE
  }
}

// Returns true if saved, false if the browser refused.
export function saveProfile(profile, storage = globalThis.localStorage) {
  try {
    storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
    return true
  } catch {
    return false
  }
}
