export type HabitFrequency =
  | { type: "daily" }
  | { type: "weekly"; timesPerWeek: number };

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  frequency: HabitFrequency;
  reminderTime: string | null;
  archived: boolean;
  createdAt: string;
}

export interface CompletionRecord {
  habitId: string;
  date: string;
}

export interface HabitWithStats extends Habit {
  streak: number;
  totalCompletions: number;
  completionRate: number;
  isCompletedToday: boolean;
  weeklyProgress: number;
  weeklyTarget: number;
}
