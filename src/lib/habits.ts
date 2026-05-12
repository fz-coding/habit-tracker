import { Habit, CompletionRecord, HabitWithStats, HabitFrequency } from "@/types/habit";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subDays,
  isSameDay,
  parseISO,
} from "date-fns";

export function getTodayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function isCompletedOnDate(
  completions: CompletionRecord[],
  habitId: string,
  dateStr: string
): boolean {
  return completions.some(
    (c) => c.habitId === habitId && c.date === dateStr
  );
}

export function getStreak(
  completions: CompletionRecord[],
  habit: Habit
): number {
  const habitCompletions = completions
    .filter((c) => c.habitId === habit.id)
    .map((c) => c.date)
    .sort()
    .reverse();

  if (habitCompletions.length === 0) return 0;

  if (habit.frequency.type === "daily") {
    let streak = 0;
    let checkDate = new Date();

    if (!isCompletedOnDate(completions, habit.id, format(checkDate, "yyyy-MM-dd"))) {
      checkDate = subDays(checkDate, 1);
    }

    for (let i = 0; i < 365; i++) {
      const dateStr = format(subDays(checkDate, i), "yyyy-MM-dd");
      if (habitCompletions.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  if (habit.frequency.type === "weekly") {
    let streak = 0;
    let weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

    if (!isWeekCompleted(completions, habit, weekStart)) {
      weekStart = subDays(weekStart, 7);
    }

    for (let i = 0; i < 52; i++) {
      const currentWeekStart = subDays(weekStart, i * 7);
      if (isWeekCompleted(completions, habit, currentWeekStart)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  return 0;
}

export function isWeekCompleted(
  completions: CompletionRecord[],
  habit: Habit,
  weekStartDate: Date
): boolean {
  if (habit.frequency.type !== "weekly") return false;
  const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStartDate, end: weekEndDate });
  const weekCompletions = days.filter((day) =>
    isCompletedOnDate(completions, habit.id, format(day, "yyyy-MM-dd"))
  );
  return weekCompletions.length >= habit.frequency.timesPerWeek;
}

export function getWeeklyProgress(
  completions: CompletionRecord[],
  habit: Habit
): number {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  return days.filter((day) =>
    isCompletedOnDate(completions, habit.id, format(day, "yyyy-MM-dd"))
  ).length;
}

export function getCompletionRate(
  completions: CompletionRecord[],
  habit: Habit
): number {
  const createdDate = parseISO(habit.createdAt);
  const today = new Date();
  const totalDays = Math.max(
    1,
    Math.ceil(
      (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
  );

  const habitCompletions = completions.filter(
    (c) => c.habitId === habit.id
  ).length;

  if (habit.frequency.type === "daily") {
    return Math.round((habitCompletions / totalDays) * 100);
  }

  if (habit.frequency.type === "weekly") {
    const createdWeek = startOfWeek(createdDate, { weekStartsOn: 1 });
    const currentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const totalWeeks = Math.max(
      1,
      Math.ceil(
        (currentWeek.getTime() - createdWeek.getTime()) / (7 * 24 * 60 * 60 * 1000)
      ) + 1
    );
    const completedWeeks = countCompletedWeeks(completions, habit, createdDate, today);
    return Math.round((completedWeeks / totalWeeks) * 100);
  }

  return 0;
}

function countCompletedWeeks(
  completions: CompletionRecord[],
  habit: Habit,
  startDate: Date,
  endDate: Date
): number {
  if (habit.frequency.type !== "weekly") return 0;
  let count = 0;
  const start = startOfWeek(startDate, { weekStartsOn: 1 });
  const end = startOfWeek(endDate, { weekStartsOn: 1 });
  let current = start;
  while (current <= end) {
    if (isWeekCompleted(completions, habit, current)) {
      count++;
    }
    current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  return count;
}

export function shouldShowToday(habit: Habit): boolean {
  return !habit.archived;
}

export function isHabitDueToday(habit: Habit): boolean {
  return !habit.archived;
}

export function getHabitWithStats(
  habit: Habit,
  completions: CompletionRecord[]
): HabitWithStats {
  const todayStr = getTodayStr();
  return {
    ...habit,
    streak: getStreak(completions, habit),
    totalCompletions: completions.filter((c) => c.habitId === habit.id).length,
    completionRate: getCompletionRate(completions, habit),
    isCompletedToday: isCompletedOnDate(completions, habit.id, todayStr),
    weeklyProgress: getWeeklyProgress(completions, habit),
    weeklyTarget:
      habit.frequency.type === "weekly"
        ? habit.frequency.timesPerWeek
        : 7,
  };
}

export const HABIT_ICONS = [
  "🏃", "💪", "📚", "🧘", "💧", "🎯", "✍️", "🎵",
  "💤", "🥗", "🧠", "💊", "🌅", "🛌", "📱", "☕",
  "🚴", "🏋️", "🎨", "📝", "🌿", "🍎", "🧹", "🙏",
];

export const HABIT_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#84CC16",
  "#22C55E", "#14B8A6", "#06B6D4", "#3B82F6",
  "#6366F1", "#8B5CF6", "#A855F7", "#EC4899",
];

export const DEFAULT_CATEGORIES = [
  "健康", "学习", "工作", "生活", "运动", "其他",
];

export function getFrequencyLabel(frequency: HabitFrequency): string {
  if (frequency.type === "daily") return "每天";
  return `每周${frequency.timesPerWeek}次`;
}

export function getCompletionsForMonth(
  completions: CompletionRecord[],
  habitId: string,
  year: number,
  month: number
): string[] {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  return completions
    .filter((c) => c.habitId === habitId && c.date.startsWith(prefix))
    .map((c) => c.date);
}
