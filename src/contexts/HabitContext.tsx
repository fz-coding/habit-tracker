"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { Habit, CompletionRecord, HabitWithStats } from "@/types/habit";
import { loadHabits, saveHabits, loadCompletions, saveCompletions, generateId } from "@/lib/storage";
import { getHabitWithStats, getTodayStr } from "@/lib/habits";

interface State {
  habits: Habit[];
  completions: CompletionRecord[];
  loaded: boolean;
}

type Action =
  | { type: "LOAD"; habits: Habit[]; completions: CompletionRecord[] }
  | { type: "ADD_HABIT"; habit: Habit }
  | { type: "UPDATE_HABIT"; habit: Habit }
  | { type: "DELETE_HABIT"; id: string }
  | { type: "ARCHIVE_HABIT"; id: string }
  | { type: "UNARCHIVE_HABIT"; id: string }
  | { type: "TOGGLE_COMPLETION"; habitId: string; date: string }
  | { type: "REMOVE_COMPLETION"; habitId: string; date: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { ...state, habits: action.habits, completions: action.completions, loaded: true };
    case "ADD_HABIT":
      return { ...state, habits: [...state.habits, action.habit] };
    case "UPDATE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.habit.id ? action.habit : h)),
      };
    case "DELETE_HABIT":
      return {
        ...state,
        habits: state.habits.filter((h) => h.id !== action.id),
        completions: state.completions.filter((c) => c.habitId !== action.id),
      };
    case "ARCHIVE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id ? { ...h, archived: true } : h
        ),
      };
    case "UNARCHIVE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id ? { ...h, archived: false } : h
        ),
      };
    case "TOGGLE_COMPLETION": {
      const exists = state.completions.some(
        (c) => c.habitId === action.habitId && c.date === action.date
      );
      if (exists) return state;
      return {
        ...state,
        completions: [
          ...state.completions,
          { habitId: action.habitId, date: action.date },
        ],
      };
    }
    case "REMOVE_COMPLETION":
      return {
        ...state,
        completions: state.completions.filter(
          (c) => !(c.habitId === action.habitId && c.date === action.date)
        ),
      };
    default:
      return state;
  }
}

interface HabitContextType {
  habits: Habit[];
  completions: CompletionRecord[];
  loaded: boolean;
  activeHabits: Habit[];
  archivedHabits: Habit[];
  habitsWithStats: HabitWithStats[];
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "archived">) => Habit;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  unarchiveHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date?: string) => void;
  isCompleted: (habitId: string, date?: string) => boolean;
  getHabitById: (id: string) => Habit | undefined;
  getHabitWithStatsById: (id: string) => HabitWithStats | undefined;
}

const HabitContext = createContext<HabitContextType | null>(null);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    habits: [],
    completions: [],
    loaded: false,
  });

  useEffect(() => {
    const habits = loadHabits();
    const completions = loadCompletions();
    dispatch({ type: "LOAD", habits, completions });
  }, []);

  useEffect(() => {
    if (state.loaded) {
      saveHabits(state.habits);
    }
  }, [state.habits, state.loaded]);

  useEffect(() => {
    if (state.loaded) {
      saveCompletions(state.completions);
    }
  }, [state.completions, state.loaded]);

  const activeHabits = state.habits.filter((h) => !h.archived);
  const archivedHabits = state.habits.filter((h) => h.archived);
  const habitsWithStats = activeHabits.map((h) => getHabitWithStats(h, state.completions));

  const addHabit = useCallback(
    (habitData: Omit<Habit, "id" | "createdAt" | "archived">): Habit => {
      const habit: Habit = {
        ...habitData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        archived: false,
      };
      dispatch({ type: "ADD_HABIT", habit });
      return habit;
    },
    []
  );

  const updateHabit = useCallback((habit: Habit) => {
    dispatch({ type: "UPDATE_HABIT", habit });
  }, []);

  const deleteHabit = useCallback((id: string) => {
    dispatch({ type: "DELETE_HABIT", id });
  }, []);

  const archiveHabit = useCallback((id: string) => {
    dispatch({ type: "ARCHIVE_HABIT", id });
  }, []);

  const unarchiveHabit = useCallback((id: string) => {
    dispatch({ type: "UNARCHIVE_HABIT", id });
  }, []);

  const toggleCompletion = useCallback(
    (habitId: string, date?: string) => {
      const dateStr = date || getTodayStr();
      const isCompleted = state.completions.some(
        (c) => c.habitId === habitId && c.date === dateStr
      );
      if (isCompleted) {
        dispatch({ type: "REMOVE_COMPLETION", habitId, date: dateStr });
      } else {
        dispatch({ type: "TOGGLE_COMPLETION", habitId, date: dateStr });
      }
    },
    [state.completions]
  );

  const isCompleted = useCallback(
    (habitId: string, date?: string) => {
      const dateStr = date || getTodayStr();
      return state.completions.some(
        (c) => c.habitId === habitId && c.date === dateStr
      );
    },
    [state.completions]
  );

  const getHabitById = useCallback(
    (id: string) => state.habits.find((h) => h.id === id),
    [state.habits]
  );

  const getHabitWithStatsById = useCallback(
    (id: string) => {
      const habit = state.habits.find((h) => h.id === id);
      if (!habit) return undefined;
      return getHabitWithStats(habit, state.completions);
    },
    [state.habits, state.completions]
  );

  return (
    <HabitContext.Provider
      value={{
        habits: state.habits,
        completions: state.completions,
        loaded: state.loaded,
        activeHabits,
        archivedHabits: state.habits.filter((h) => h.archived),
        habitsWithStats,
        addHabit,
        updateHabit,
        deleteHabit,
        archiveHabit,
        unarchiveHabit,
        toggleCompletion,
        isCompleted,
        getHabitById,
        getHabitWithStatsById,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return context;
}
