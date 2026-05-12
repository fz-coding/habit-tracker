"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHabits } from "@/contexts/HabitContext";
import { HABIT_ICONS, HABIT_COLORS, DEFAULT_CATEGORIES } from "@/lib/habits";
import { Habit, HabitFrequency } from "@/types/habit";

export default function CreateHabitPage() {
  const router = useRouter();
  const { addHabit, updateHabit, getHabitById } = useHabits();

  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const editId = searchParams?.get("edit") || null;
  const existingHabit = editId ? getHabitById(editId) : null;

  const [name, setName] = useState(existingHabit?.name || "");
  const [icon, setIcon] = useState(existingHabit?.icon || "🎯");
  const [color, setColor] = useState(existingHabit?.color || "#3B82F6");
  const [category, setCategory] = useState(existingHabit?.category || "健康");
  const [customCategory, setCustomCategory] = useState("");
  const [frequencyType, setFrequencyType] = useState<HabitFrequency["type"]>(
    existingHabit?.frequency.type || "daily"
  );
  const [timesPerWeek, setTimesPerWeek] = useState(
    existingHabit?.frequency.type === "weekly"
      ? existingHabit.frequency.timesPerWeek
      : 3
  );
  const [reminderTime, setReminderTime] = useState(
    existingHabit?.reminderTime || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = category === "自定义" ? customCategory.trim() : category;

    const habitData = {
      name: name.trim(),
      icon,
      color,
      category: finalCategory || "其他",
      frequency:
        frequencyType === "daily"
          ? { type: "daily" as const }
          : { type: "weekly" as const, timesPerWeek },
      reminderTime: reminderTime || null,
    };

    if (existingHabit) {
      updateHabit({ ...existingHabit, ...habitData });
    } else {
      addHabit(habitData);
    }
    router.push("/");
  };

  return (
    <div className="px-4 pt-6">
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">
          {existingHabit ? "编辑习惯" : "创建新习惯"}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            习惯名称
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：早起、运动、阅读..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择图标
          </label>
          <div className="grid grid-cols-8 gap-2">
            {HABIT_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                  icon === i
                    ? "bg-blue-50 ring-2 ring-blue-500 scale-110"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择颜色
          </label>
          <div className="flex gap-2 flex-wrap">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-full transition-all ${
                  color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分类
          </label>
          <div className="flex gap-2 flex-wrap">
            {DEFAULT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCategory("自定义")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                category === "自定义"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              自定义
            </button>
          </div>
          {category === "自定义" && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="输入自定义分类名称"
              className="mt-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            频率
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFrequencyType("daily")}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                frequencyType === "daily"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              每天
            </button>
            <button
              type="button"
              onClick={() => setFrequencyType("weekly")}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                frequencyType === "weekly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              每周N次
            </button>
          </div>
          {frequencyType === "weekly" && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-gray-500">每周完成</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTimesPerWeek(Math.max(1, timesPerWeek - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-lg">
                  {timesPerWeek}
                </span>
                <button
                  type="button"
                  onClick={() => setTimesPerWeek(Math.min(7, timesPerWeek + 1))}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500">次</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            提醒时间 <span className="text-gray-400 font-normal">（可选）</span>
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          {existingHabit ? "保存修改" : "创建习惯"}
        </button>
      </form>
    </div>
  );
}
