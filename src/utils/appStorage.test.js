import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildBackup, parseBackup, restoreAll, loadAll, describeData, backupFileName } from './appStorage.js'
import { saveWorkouts, loadWorkouts } from './workoutStorage.js'
import { saveWeightData } from './weight.js'
import { saveGoals } from './goals.js'
import { saveProfile } from './profile.js'
import { weeklyActivity, workoutStreak, recentWorkouts, weeklyGoal, weightSeries, topRecords } from './dashboard.js'

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
  }
}

const workout = (id, date, exercises = []) => ({ id, date, name: `W${id}`, notes: '', exercises, createdAt: `${date}T10:00:00Z` })
const lift = (name, weightKg) => ({ id: name, name, sets: 3, reps: 5, weightKg })

test('empty storage loads as empty collections (no dummy data)', () => {
  const all = loadAll(fakeStorage())
  assert.deepEqual(all.workouts, [])
  assert.deepEqual(all.planner, [])
  assert.deepEqual(all.goals, [])
  assert.deepEqual(all.weight.entries, [])
  assert.equal(all.profile.name, '')
})

test('backup round-trips through export, parse and restore', () => {
  const a = fakeStorage()
  saveWorkouts([workout('1', '2026-11-02', [lift('Squat', 100)])], a)
  saveWeightData({ entries: [{ id: 'w', date: '2026-11-01', weightKg: 80 }], startingKg: 82, targetKg: 75 }, a)
  saveGoals([{ id: 'g', type: 'workouts', target: 4, exercise: '', baselineKg: null, completed: false, completedAt: null, createdAt: 'x' }], a)
  saveProfile({ name: 'Sam' }, a)

  const text = JSON.stringify(buildBackup(a, new Date(2026, 10, 9)))
  const parsed = parseBackup(text)
  assert.equal(parsed.ok, true)

  const b = fakeStorage()
  assert.equal(restoreAll(parsed.data, b), true)
  assert.deepEqual(loadAll(b), loadAll(a))
  assert.match(describeData(parsed.data), /1 workouts, 1 weigh-ins, 1 goals/)
})

test('parseBackup rejects bad input and leaves nothing to write', () => {
  assert.equal(parseBackup('not json').ok, false)
  assert.equal(parseBackup('{"hello":1}').ok, false)
  assert.equal(parseBackup(JSON.stringify({ app: 'fittrack', schemaVersion: 99, data: {} })).ok, false)
  assert.equal(parseBackup(JSON.stringify({ app: 'fittrack', schemaVersion: 1, data: { workouts: 'oops' } })).ok, false)
})

test('parseBackup treats missing collections as empty', () => {
  const r = parseBackup(JSON.stringify({ app: 'fittrack', schemaVersion: 1, data: {} }))
  assert.equal(r.ok, true)
  assert.deepEqual(r.data.workouts, [])
})

test('restoreAll puts old data back when saving fails', () => {
  const store = fakeStorage()
  saveWorkouts([workout('keep', '2026-11-01')], store)
  let writes = 0
  const flaky = {
    getItem: store.getItem,
    setItem: (k, v) => {
      writes += 1
      if (writes === 2) throw new Error('quota')
      store.setItem(k, v)
    },
  }
  const incoming = parseBackup(JSON.stringify({ app: 'fittrack', schemaVersion: 1, data: { workouts: [workout('new', '2026-11-05')] } })).data
  assert.equal(restoreAll(incoming, flaky), false)
  assert.equal(loadWorkouts(store)[0].id, 'keep')
})

test('backupFileName uses the local date', () => {
  assert.equal(backupFileName(new Date(2026, 10, 9)), 'fittrack-backup-2026-11-09.json')
})

test('weeklyActivity counts workouts per day, Monday first', () => {
  // 2026-11-09 is a Monday
  const w = [workout('1', '2026-11-09'), workout('2', '2026-11-09'), workout('3', '2026-11-11'), workout('4', '2026-11-01')]
  const days = weeklyActivity(w, '2026-11-11')
  assert.deepEqual(days.map((d) => d.workouts), [2, 0, 1, 0, 0, 0, 0])
  assert.equal(days[0].day, 'Mon')
})

test('workoutStreak counts back from today, or from yesterday', () => {
  const w = [workout('1', '2026-11-07'), workout('2', '2026-11-08'), workout('3', '2026-11-09')]
  assert.equal(workoutStreak(w, '2026-11-09'), 3)
  assert.equal(workoutStreak(w, '2026-11-10'), 3)
  assert.equal(workoutStreak(w, '2026-11-11'), 0)
  assert.equal(workoutStreak([], '2026-11-09'), 0)
})

test('recentWorkouts is newest first and limited', () => {
  const w = [1, 2, 3, 4, 5].map((n) => workout(String(n), `2026-11-0${n}`))
  assert.deepEqual(recentWorkouts(w, 2).map((x) => x.id), ['5', '4'])
})

test('weeklyGoal uses the newest open weekly-workouts goal', () => {
  const g = (target, createdAt, completed = false) => ({ type: 'workouts', target, createdAt, completed })
  assert.equal(weeklyGoal([]), null)
  assert.equal(weeklyGoal([g(3, '2026-01-01'), g(5, '2026-02-01'), g(9, '2026-03-01', true)]), 5)
})

test('weightSeries is oldest first; topRecords sorted by weight', () => {
  const series = weightSeries([
    { id: 'b', date: '2026-11-05', weightKg: 79 },
    { id: 'a', date: '2026-11-01', weightKg: 80 },
  ])
  assert.deepEqual(series.map((p) => p.weight), [80, 79])

  const records = topRecords([workout('1', '2026-11-01', [lift('Squat', 100), lift('Bench', 60), lift('Row', 70), lift('Curl', 20)])])
  assert.deepEqual(records.map((r) => r.name), ['Squat', 'Row', 'Bench'])
})
