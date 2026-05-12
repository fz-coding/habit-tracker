"use client";

import { useState, useMemo } from "react";
import { useHabits } from "@/contexts/HabitContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
  isToday,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import Link from "next/link";

export default function CalendarPage() {
  const { activeHabits, completions, toggleCompletion, loaded } = useHabits();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState<string | "all">("all");

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    const blanks = Array(adjustedStartDay).fill(null);
    return [...blanks, ...daysInMonth];
  }, [currentMonth]);

  const getCompletionCountForDate = (dateStr: string) => {
    if (selectedHabitId === "all") {
      return completions.filter((c) => c.date === dateStr).length;
    }
    return completions.filter(
      (c) => c.habitId === selectedHabitId && c.date === dateStr
    ).length;
  };

  const getTotalForDate = (dateStr: string) => {
    if (selectedHabitId === "all") {
      return activeHabits.length;
    }
    return 1;
  };

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
        <h1 className="text-2xl font-bold">日历</h1>
        <p className="text-sm text-gray-500 mt-1">回顾你的习惯完成情况</p>
      </header>

      {activeHabits.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
          <button
            onClick={() => setSelectedHabitId("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedHabitId === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部
          </button>
          {activeHabits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => setSelectedHabitId(habit.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                selectedHabitId === habit.id
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={
                selectedHabitId === habit.id
                  ? { backgroundColor: habit.color }
                  : undefined
              }
            >
              <span>{habit.icon}</span>
              <span>{habit.name}</span>
            </button>
          ))}
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
            const completed = getCompletionCountForDate(dateStr);
            const total = getTotalForDate(dateStr);
            const isCurrentDay = isToday(day);
            const ratio = total > 0 ? completed / total : 0;

            let bgColor = "transparent";
            let textColor = "text-gray-600";
            if (ratio > 0 && ratio < 1) {
              bgColor = "#DBEAFE";
              textColor = "text-blue-700";
            } else if (ratio >= 1) {
              bgColor = "#3B82F6";
              textColor = "text-white";
            }

            return (
              <Link
                key={dateStr}
                href={selectedHabitId !== "all" ? `/habit/${selectedHabitId}` : "#"}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                  isCurrentDay ? "ring-2 ring-blue-300" : ""
                } ${textColor}`}
                style={{ backgroundColor: bgColor }}
              >
                {format(day, "d")}
              </Link>
            );
          })}
        </div>
      </div>

      {activeHabits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">还没有习惯，去创建一个吧</p>
          <Link
            href="/create"
            className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            创建习惯
          </Link>
        </div>
      )}
    </div>
  );
}
