import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)

    const totalHabits = await prisma.habit.count({
      where: { userId, archived: false },
    })

    const completedToday = await prisma.completionRecord.count({
      where: {
        userId,
        completedAt: {
          gte: new Date(today.toDateString()),
        },
      },
    })

    const completedThisWeek = await prisma.completionRecord.count({
      where: {
        userId,
        completedAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    })

    const completedThisMonth = await prisma.completionRecord.count({
      where: {
        userId,
        completedAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    const totalCompletions = await prisma.completionRecord.count({
      where: { userId },
    })

    const habitsWithStreaks = await prisma.habit.findMany({
      where: { userId, archived: false },
      include: {
        completionRecords: true,
      },
    })

    const maxStreak = habitsWithStreaks.reduce((max, habit) => {
      const dates = habit.completionRecords
        .map(r => r.completedAt)
        .sort((a, b) => b.getTime() - a.getTime())
      
      let streak = 0
      let checkDate = new Date()
      
      if (!dates.some(d => Math.abs(d.getTime() - checkDate.getTime()) < 24 * 60 * 60 * 1000)) {
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000)
      }
      
      for (let i = 0; i < 365; i++) {
        const checkDateStr = checkDate.toDateString()
        if (dates.some(d => d.toDateString() === checkDateStr)) {
          streak++
          checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000)
        } else {
          break
        }
      }
      
      return Math.max(max, streak)
    }, 0)

    return NextResponse.json({
      totalHabits,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      totalCompletions,
      maxStreak,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 })
  }
}