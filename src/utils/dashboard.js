// Pure logic for the Dashboard. Nothing is stored: every number is worked out
// from the workouts, weigh-ins and goals the user has logged.
import { weekRange, formatDate, exerciseRecords } from './progress.js'
import { sortByDate } from './weight.js'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const pad = (n) => String(n).padStart(2, '0')

function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Built from parts so time zones can't shift the day.
function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const valid = (workouts) =>
  workouts.filter((w) => w && typeof w.date === 'string' && Array.isArray(w.exercises))

// Workouts logged on each day of the current week (Mon-Sun).
export function weeklyActivity(workouts, today) {
  const counts = {}
  for (const w of valid(workouts)) counts[w.date] = (counts[w.date] ?? 0) + 1
  const day = fromISO(weekRange(today).start)
  return DAY_LABELS.map((label) => {
    const result = { day: label, workouts: counts[toISO(day)] ?? 0 }
    day.setDate(day.getDate() + 1)
    return result
  })
}

// Consecutive days with a workout, ending today. If nothing is logged today the
// streak is still alive when yesterday has one (today is not over yet).
export function workoutStreak(workouts, today) {
  const days = new Set(valid(workouts).map((w) => w.date))
  const d = fromISO(today)
  if (!days.has(toISO(d))) d.setDate(d.getDate() - 1)
  let streak = 0
  while (days.has(toISO(d))) {
    streak += 1
    d.setDate(d.getDate() - 1)
  }
  return streak
}

// Newest first, for the Recent Workouts table.
export function recentWorkouts(workouts, limit = 4) {
  return valid(workouts)
    .sort((a, b) => b.date.localeCompare(a.date) || String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
    .slice(0, limit)
}

// The weekly-workouts target from My Goals (newest one still open), or null.
export function weeklyGoal(goals) {
  const open = goals
    .filter((g) => g.type === 'workouts' && !g.completed)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  return open[0]?.target ?? null
}

// Points for the weight chart, oldest first.
export function weightSeries(entries) {
  return sortByDate(entries).map((e) => ({ date: formatDate(e.date), weight: e.weightKg }))
}

// The heaviest lifts, for Personal Records.
export function topRecords(workouts, limit = 3) {
  return [...exerciseRecords(workouts)].sort((a, b) => b.prKg - a.prKg).slice(0, limit)
}
