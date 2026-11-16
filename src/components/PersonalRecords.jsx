import { Medal } from 'lucide-react'

export default function PersonalRecords({ records }) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>Personal Records</h2>
      </div>
      {records.length === 0 ? (
        <p className="muted empty-state">Log a workout with weights to see your records.</p>
      ) : (
        <div className="pr-grid">
          {records.map((pr) => (
            <div key={pr.key} className="pr-item">
              <Medal size={18} />
              <p className="muted">{pr.name}</p>
              <p className="pr-value">{pr.prKg} kg</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
