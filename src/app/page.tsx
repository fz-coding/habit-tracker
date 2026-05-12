"use client";

import { useHabits } from "@/contexts/HabitContext";
import HabitCard from "@/components/HabitCard";
import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useMemo } from "react";

export default function HomePage() {
  const { habitsWithStats, loaded, toggleCompletion } = useHabits();

  const groupedHabits = useMemo(() => {
    const groups: Record<string, typeof habitsWithStats> = {};
    habitsWithStats.forEach((habit) => {
      const category = habit.category || "其他";
      if (!groups[category]) groups[category] = [];
      groups[category].push(habit);
    });
    return groups;
  }, [habitsWithStats]);

  const todayStr = format(new Date(), "M月d日 EEEE", { locale: zhCN });
  const completedCount = habitsWithStats.filter((h) => h.isCompletedToday).length;
  const totalCount = habitsWithStats.length;

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
        <h1 className="text-2xl font-bold">习惯追踪器</h1>
        <p className="text-sm text-gray-500 mt-1">{todayStr}</p>
        {totalCount > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>今日进度</span>
              <span className="font-semibold text-gray-700">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                style={{
                  width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%",
                }}
              />
            </div>
          </div>
        )}
      </header>

      {totalCount === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            开始你的第一个习惯
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            每一个伟大的改变，都从一个小习惯开始
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            创建习惯
          </Link>
        </div>
      ) : (
        <>
          {Object.entries(groupedHabits).map(([category, habits]) => (
            <div key={category} className="mb-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                {category}
              </h2>
              <div className="space-y-2">
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggle={() => toggleCompletion(habit.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          <Link
            href="/create"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">添加新习惯</span>
          </Link>
        </>
      )}
    </div>
  );
}
