import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import {
  buildBackup, backupFileName, parseBackup, describeData, restoreAll,
} from '../utils/appStorage'

// Export / Import buttons for the sidebar footer.
export default function DataBackup({ onImported }) {
  const fileInput = useRef(null)
  const [status, setStatus] = useState(null) // { ok, text }

  function handleExport() {
    const json = JSON.stringify(buildBackup(), null, 2)
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName()
    link.click()
    URL.revokeObjectURL(url)
    setStatus({ ok: true, text: 'Backup downloaded.' })
  }

  async function handleFile(e) {
    const file = e.target.files[0]
    e.target.value = '' // lets the same file be chosen again
    if (!file) return
    const result = parseBackup(await file.text())
    if (!result.ok) return setStatus({ ok: false, text: result.error })

    const summary = describeData(result.data)
    if (!window.confirm(`Importing will replace ALL your current data with this backup (${summary}). Continue?`)) {
      return setStatus(null)
    }
    if (restoreAll(result.data)) {
      onImported()
      setStatus({ ok: true, text: `Imported ${summary}.` })
    } else {
      setStatus({ ok: false, text: 'Could not save the imported data. Nothing was changed.' })
    }
  }

  return (
    <div className="sidebar-footer">
      <button className="nav-item" onClick={handleExport} title="Export data">
        <Download size={20} />
        <span className="nav-label">Export Data</span>
      </button>
      <button className="nav-item" onClick={() => fileInput.current.click()} title="Import data">
        <Upload size={20} />
        <span className="nav-label">Import Data</span>
      </button>
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={handleFile} />
      {status && (
        <p className={`backup-status ${status.ok ? '' : 'error'}`} role="status">{status.text}</p>
      )}
    </div>
  )
}
