"use client";

import { useHabits } from "@/contexts/HabitContext";
import { getFrequencyLabel } from "@/lib/habits";
import Link from "next/link";

export default function StatsPage() {
  const { habitsWithStats, loaded } = useHabits();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalHabits = habitsWithStats.length;
  const totalCompletions = habitsWithStats.reduce(
    (sum, h) => sum + h.totalCompletions,
    0
  );
  const avgCompletionRate =
    totalHabits > 0
      ? Math.round(
          habitsWithStats.reduce((sum, h) => sum + h.completionRate, 0) /
            totalHabits
        )
      : 0;
  const longestStreak = Math.max(0, ...habitsWithStats.map((h) => h.streak));
  const completedToday = habitsWithStats.filter((h) => h.isCompletedToday).length;

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">统计</h1>
        <p className="text-sm text-gray-500 mt-1">了解你的进步</p>
      </header>

      {totalHabits === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-gray-400 text-sm mb-4">
            创建习惯后即可查看统计数据
          </p>
          <Link
            href="/create"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            创建习惯
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-blue-600">
                {completedToday}
              </div>
              <div className="text-xs text-gray-400 mt-1">今日已完成</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-green-600">
                {avgCompletionRate}%
              </div>
              <div className="text-xs text-gray-400 mt-1">平均完成率</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-orange-500">
                {longestStreak}
              </div>
              <div className="text-xs text-gray-400 mt-1">最长连续天数</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-purple-600">
                {totalCompletions}
              </div>
              <div className="text-xs text-gray-400 mt-1">总打卡次数</div>
            </div>
          </div>

          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            各习惯详情
          </h2>
          <div className="space-y-3">
            {habitsWithStats
              .sort((a, b) => b.completionRate - a.completionRate)
              .map((habit) => (
                <Link
                  key={habit.id}
                  href={`/habit/${habit.id}`}
                  className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{habit.icon}</span>
                      <span className="font-semibold text-sm">
                        {habit.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {habit.streak > 0 && (
                        <span className="text-xs font-bold text-orange-500">
                          🔥 {habit.streak}
                        </span>
                      )}
                      <span
                        className="text-sm font-bold"
                        style={{ color: habit.color }}
                      >
                        {habit.completionRate}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: habit.color,
                        width: `${habit.completionRate}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{getFrequencyLabel(habit.frequency)}</span>
                    <span>共完成 {habit.totalCompletions} 次</span>
                  </div>
                </Link>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
