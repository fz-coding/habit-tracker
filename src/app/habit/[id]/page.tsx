"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useHabits } from "@/contexts/HabitContext";
import { getFrequencyLabel, getCompletionsForMonth } from "@/lib/habits";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
  isSameDay,
  isToday,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import Link from "next/link";

export default function HabitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const habitId = params.id as string;
  const { getHabitWithStatsById, completions, toggleCompletion, archiveHabit, deleteHabit } = useHabits();

  const habit = getHabitWithStatsById(habitId);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    const blanks = Array(adjustedStartDay).fill(null);
    return [...blanks, ...daysInMonth];
  }, [currentMonth]);

  const completedDates = useMemo(() => {
    if (!habit) return [];
    return getCompletionsForMonth(
      completions,
      habitId,
      currentMonth.getFullYear(),
      currentMonth.getMonth()
    );
  }, [completions, habitId, currentMonth, habit]);

  if (!habit) {
    return (
      <div className="px-4 pt-6">
        <p className="text-center text-gray-400 py-20">习惯未找到</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.icon}</span>
            <h1 className="text-xl font-bold">{habit.name}</h1>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-[140px]">
              <Link
                href={`/create?edit=${habit.id}`}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMenu(false)}
              >
                编辑习惯
              </Link>
              <button
                onClick={() => {
                  archiveHabit(habit.id);
                  router.push("/");
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                归档习惯
              </button>
              <button
                onClick={() => {
                  if (confirm("确定要删除这个习惯吗？删除后数据无法恢复。")) {
                    deleteHabit(habit.id);
                    router.push("/");
                  }
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
              >
                删除习惯
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold" style={{ color: habit.color }}>
            {habit.streak}
          </div>
          <div className="text-xs text-gray-400 mt-1">连续天数 🔥</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold" style={{ color: habit.color }}>
            {habit.totalCompletions}
          </div>
          <div className="text-xs text-gray-400 mt-1">总完成次数</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold" style={{ color: habit.color }}>
            {habit.completionRate}%
          </div>
          <div className="text-xs text-gray-400 mt-1">完成率</div>
        </div>
      </div>

      {habit.frequency.type === "weekly" && (
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">本周进度</span>
            <span className="text-sm font-bold" style={{ color: habit.color }}>
              {habit.weeklyProgress}/{habit.weeklyTarget}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: habit.color,
                width: `${Math.min(100, (habit.weeklyProgress / habit.weeklyTarget) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-semibold text-sm">
            {format(currentMonth, "yyyy年M月", { locale: zhCN })}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
            <div key={day} className="text-center text-xs text-gray-400 font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`blank-${index}`} className="aspect-square" />;
            }
            const dateStr = format(day, "yyyy-MM-dd");
            const isCompleted = completedDates.includes(dateStr);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={dateStr}
                onClick={() => toggleCompletion(habitId, dateStr)}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                  isCompleted
                    ? "text-white"
                    : isCurrentDay
                    ? "ring-2 ring-blue-300"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                style={
                  isCompleted
                    ? { backgroundColor: habit.color }
                    : undefined
                }
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 mb-4 text-center">
        <p className="text-xs text-gray-400">
          {getFrequencyLabel(habit.frequency)} · 点击日历可补打卡
        </p>
      </div>
    </div>
  );
}
