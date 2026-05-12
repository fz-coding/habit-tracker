import { supabase, supabaseAdmin } from '@/lib/supabase'
import { Habit, HabitLog, HabitWithStats } from '@/types/habit'

export async function getHabitsByUserId(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getHabitById(habitId: string, userId: string): Promise<Habit | null> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', habitId)
    .eq('user_id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert([habit])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteHabit(habitId: string): Promise<void> {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
  
  if (error) throw error
}

export async function getHabitLogs(habitId: string): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .order('completed_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getLogsByUserId(userId: string): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createHabitLog(habitId: string, userId: string, notes?: string): Promise<HabitLog> {
  const { data, error } = await supabase
    .from('habit_logs')
    .insert([{ habit_id: habitId, user_id: userId, notes }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteHabitLog(logId: string): Promise<void> {
  const { error } = await supabase
    .from('habit_logs')
    .delete()
    .eq('id', logId)
  
  if (error) throw error
}

export async function getHabitStats(habitId: string, userId: string): Promise<HabitWithStats> {
  const [habit, logs] = await Promise.all([
    getHabitById(habitId, userId),
    getHabitLogs(habitId)
  ])
  
  if (!habit) throw new Error('Habit not found')
  
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const isCompletedToday = logs.some(log => 
    log.completed_at.split('T')[0] === todayStr
  )
  
  const totalCompletions = logs.length
  
  const streak = calculateStreak(logs)
  
  const completionRate = calculateCompletionRate(logs, habit.created_at)
  
  const weeklyProgress = calculateWeeklyProgress(logs)
  const weeklyTarget = habit.frequency_type === 'weekly' ? habit.frequency_value || 7 : 7
  
  return {
    ...habit,
    streak,
    totalCompletions,
    completionRate,
    isCompletedToday,
    weeklyProgress,
    weeklyTarget
  }
}

function calculateStreak(logs: HabitLog[]): number {
  if (logs.length === 0) return 0
  
  const dates = logs
    .map(log => log.completed_at.split('T')[0])
    .sort()
    .reverse()
  
  let streak = 0
  let checkDate = new Date()
  
  const todayStr = checkDate.toISOString().split('T')[0]
  if (!dates.includes(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1)
  }
  
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0]
    if (dates.includes(dateStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
}

function calculateCompletionRate(logs: HabitLog[], createdAt: string): number {
  if (logs.length === 0) return 0
  
  const createdDate = new Date(createdAt)
  const today = new Date()
  const totalDays = Math.max(1, Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  
  return Math.round((logs.length / totalDays) * 100)
}

function calculateWeeklyProgress(logs: HabitLog[]): number {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1)
  
  return logs.filter(log => {
    const logDate = new Date(log.completed_at)
    return logDate >= weekStart && logDate <= today
  }).length
}

export async function subscribeToHabits(userId: string, callback: (habits: Habit[]) => void) {
  return supabase
    .channel('habits')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'habits',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      getHabitsByUserId(userId).then(callback)
    })
    .subscribe()
}

export async function subscribeToLogs(userId: string, callback: (logs: HabitLog[]) => void) {
  return supabase
    .channel('habit_logs')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'habit_logs',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      getLogsByUserId(userId).then(callback)
    })
    .subscribe()
}