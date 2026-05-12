import { supabase, supabaseAdmin } from '@/lib/supabase'

export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar?: string
  timezone: string
  goal_description?: string
  created_at: string
  updated_at: string
}

export async function createUserProfile(userId: string, email: string, name?: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{ id: userId, email, name }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteUserProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', userId)
  
  if (error) throw error
}