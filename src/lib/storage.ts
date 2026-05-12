import { Habit, CompletionRecord } from "@/types/habit";

const HABITS_KEY = "habit-tracker-habits";
const COMPLETIONS_KEY = "habit-tracker-completions";

export function loadHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function loadCompletions(): CompletionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(COMPLETIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCompletions(completions: CompletionRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
