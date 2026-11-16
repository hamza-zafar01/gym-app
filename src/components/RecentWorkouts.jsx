import { formatDate } from '../utils/progress'

export default function RecentWorkouts({ workouts }) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>Recent Workouts</h2>
      </div>
      {workouts.length === 0 ? (
        <p className="muted empty-state">No workouts yet. Use Add Workout to log your first one.</p>
      ) : (
        <div className="table-wrap">
          <table className="workout-table">
            <thead>
              <tr>
                <th>Workout</th>
                <th>Date</th>
                <th>Exercises</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((w) => (
                <tr key={w.id}>
                  <td className="workout-name">{w.name}</td>
                  <td>{formatDate(w.date, true)}</td>
                  <td>{w.exercises.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
