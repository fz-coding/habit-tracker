export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  category: string
  frequency_type: string
  frequency_value?: number
  reminder_time?: string
  description?: string
  archived: boolean
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  notes?: string
  metadata?: Record<string, unknown>
}

export interface HabitWithStats extends Habit {
  streak: number
  totalCompletions: number
  completionRate: number
  isCompletedToday: boolean
  weeklyProgress: number
  weeklyTarget: number
}

export type HabitFrequency =
  | { type: 'daily' }
  | { type: 'weekly'; timesPerWeek: number }
  | { type: 'monthly'; timesPerMonth: number }