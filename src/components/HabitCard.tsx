"use client";

import { HabitWithStats } from "@/types/habit";
import { getFrequencyLabel } from "@/lib/habits";
import Link from "next/link";

interface HabitCardProps {
  habit: HabitWithStats;
  onToggle: () => void;
}

export default function HabitCard({ habit, onToggle }: HabitCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <button
        onClick={onToggle}
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-200"
        style={{
          backgroundColor: habit.isCompletedToday
            ? habit.color
            : `${habit.color}15`,
          transform: habit.isCompletedToday ? "scale(1.05)" : "scale(1)",
        }}
      >
        {habit.isCompletedToday ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span>{habit.icon}</span>
        )}
      </button>

      <Link href={`/habit/${habit.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm truncate">{habit.name}</h3>
          {habit.streak > 0 && (
            <span className="flex-shrink-0 inline-flex items-center gap-0.5 text-xs font-bold text-orange-500">
              🔥 {habit.streak}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {getFrequencyLabel(habit.frequency)}
          {habit.frequency.type === "weekly" && (
            <span className="ml-1">
              · 本周 {habit.weeklyProgress}/{habit.weeklyTarget}
            </span>
          )}
        </p>
      </Link>

      <Link
        href={`/habit/${habit.id}`}
        className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
