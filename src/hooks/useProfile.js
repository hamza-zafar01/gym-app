import { useState } from 'react'
import { loadProfile, saveProfile, cleanProfileName } from '../utils/profile.js'

// Owns the profile (display name): state + localStorage sync.
export function useProfile() {
  const [profile, setProfile] = useState(loadProfile)

  function setName(name) {
    const next = { ...profile, name: cleanProfileName(name) }
    setProfile(next)
    saveProfile(next)
  }

  // After an Import the stored profile changed underneath us.
  const reload = () => setProfile(loadProfile())

  return { profile, setName, reload }
}
