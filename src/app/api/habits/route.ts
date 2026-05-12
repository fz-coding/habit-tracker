import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 })
    }

    const habits = await prisma.habit.findMany({
      where: { userId, archived: false },
      include: {
        completionRecords: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(habits, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: '获取习惯列表失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, name, icon, color, category, frequencyType, frequencyValue, reminderTime } = await request.json()
    
    if (!userId || !name) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const habit = await prisma.habit.create({
      data: {
        userId,
        name,
        icon,
        color,
        category,
        frequencyType,
        frequencyValue,
        reminderTime,
      },
    })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '创建习惯失败' }, { status: 500 })
  }
}