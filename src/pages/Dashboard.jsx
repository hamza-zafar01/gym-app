import { useState } from 'react'
import { Play, Trophy, Scale, Flame, CalendarCheck } from 'lucide-react'
import StatCard from '../components/StatCard'
import WeeklyActivityChart from '../components/WeeklyActivityChart'
import WeightChart from '../components/WeightChart'
import RecentWorkouts from '../components/RecentWorkouts'
import PersonalRecords from '../components/PersonalRecords'
import QuickActions from '../components/QuickActions'
import { useProgressData } from '../hooks/useProgressData'
import { todayISO } from '../utils/workoutModel'
import { buildProgress } from '../utils/progress'
import {
  weeklyActivity, workoutStreak, recentWorkouts, weeklyGoal, weightSeries, topRecords,
} from '../utils/dashboard'
import { displayName } from '../utils/profile'
import { getGreeting, formatLongDate } from '../utils/dashboardHeader'
import '../styles/dashboard.css'

export default function Dashboard({ onNavigate, profile }) {
  const { workouts, weightData, goals } = useProgressData()
  const [now] = useState(() => new Date())
  const today = todayISO()

  // Every number below is worked out from the user's own records.
  const progress = buildProgress(workouts, weightData, today)
  const { weight } = progress
  const goal = weeklyGoal(goals)
  const streak = workoutStreak(workouts, today)
  const changeText =
    weight.changeKg === null
      ? 'Log a weigh-in to track it'
      : `${weight.changeKg > 0 ? '+' : ''}${weight.changeKg} kg since start`

  return (
    <div className="dashboard">
      <section className="dash-hero">
        <div>
          <h2 className="dash-greeting">{getGreeting(now)}, {displayName(profile)}!</h2>
          <p className="muted">{formatLongDate(now)}</p>
        </div>
        <button className="primary-btn hero-btn" onClick={() => onNavigate('workouts')}>
          <Play size={16} /> Start Workout
        </button>
      </section>

      <h2 className="section-title">Fitness Overview</h2>
      <div className="stats-grid">
        <StatCard icon={Trophy} label="Workouts" value={progress.totalWorkouts} hint="Total logged" />
        <StatCard
          icon={Scale}
          label="Weight"
          value={weight.currentKg === null ? '—' : `${weight.currentKg} kg`}
          hint={changeText}
        />
        <StatCard icon={Flame} label="Streak" value={`${streak} ${streak === 1 ? 'day' : 'days'}`} hint="Consecutive days" />
        <StatCard
          icon={CalendarCheck}
          label="This Week"
          value={goal ? `${progress.thisWeek} / ${goal}` : progress.thisWeek}
          progress={goal ? (progress.thisWeek / goal) * 100 : undefined}
          hint={goal ? 'Weekly goal' : 'Set a weekly goal in My Goals'}
        />
      </div>

      <div className="grid-main">
        <WeeklyActivityChart data={weeklyActivity(workouts, today)} />
        <WeightChart data={weightSeries(weightData.entries)} />
      </div>

      <RecentWorkouts workouts={recentWorkouts(workouts)} />

      <div className="grid-main">
        <PersonalRecords records={topRecords(workouts)} />
        <QuickActions onNavigate={onNavigate} />
      </div>

    </div>
  )
}
