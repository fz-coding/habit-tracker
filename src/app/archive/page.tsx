"use client";

import { useHabits } from "@/contexts/HabitContext";
import { getFrequencyLabel } from "@/lib/habits";
import Link from "next/link";

export default function ArchivePage() {
  const { habits, loaded, unarchiveHabit, deleteHabit } = useHabits();

  const archivedHabits = habits.filter((h) => h.archived);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">归档</h1>
        <p className="text-sm text-gray-500 mt-1">已归档的习惯</p>
      </header>

      {archivedHabits.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-400 text-sm">没有已归档的习惯</p>
        </div>
      ) : (
        <div className="space-y-3">
          {archivedHabits.map((habit) => (
            <div
              key={habit.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl opacity-50">{habit.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-500 truncate">
                    {habit.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {getFrequencyLabel(habit.frequency)} · {habit.category}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => unarchiveHabit(habit.id)}
                  className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  恢复
                </button>
                <button
                  onClick={() => {
                    if (confirm("确定要永久删除这个习惯吗？")) {
                      deleteHabit(habit.id);
                    }
                  }}
                  className="flex-1 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
