import { useState } from 'react'
import { Menu, Pencil } from 'lucide-react'
import Logo from './Logo'
import { displayName, MAX_NAME_LENGTH } from '../utils/profile'
import '../styles/header.css'

export default function Header({ onMenuClick, profile, onNameChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function startEdit() {
    setDraft(profile.name)
    setEditing(true)
  }

  function finish(save) {
    if (save) onNameChange(draft)
    setEditing(false)
  }

  return (
    <header className="header">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={22} />
      </button>

      {/* Logo only shows here on mobile/tablet; the sidebar has it on desktop */}
      <div className="header-logo">
        <Logo />
      </div>

      <div className="header-welcome">
        <h1>
          Welcome back,{' '}
          {editing ? (
            <input
              className="name-input"
              value={draft}
              maxLength={MAX_NAME_LENGTH}
              placeholder="Your name"
              aria-label="Your name"
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => finish(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') finish(true)
                if (e.key === 'Escape') finish(false)
              }}
            />
          ) : (
            <button className="name-edit" onClick={startEdit} title="Change your name">
              {displayName(profile)} <Pencil size={14} />
            </button>
          )}{' '}
          👋
        </h1>
        <p>Let&apos;s make today count.</p>
      </div>
    </header>
  )
}
