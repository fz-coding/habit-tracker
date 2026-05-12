import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    const habit = await prisma.habit.findUnique({
      where: { id },
      include: {
        completionRecords: true,
      },
    })

    if (!habit) {
      return NextResponse.json({ error: '习惯不存在' }, { status: 404 })
    }

    return NextResponse.json(habit, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: '获取习惯详情失败' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { name, icon, color, category, frequencyType, frequencyValue, reminderTime, archived } = await request.json()

    const habit = await prisma.habit.update({
      where: { id },
      data: {
        name,
        icon,
        color,
        category,
        frequencyType,
        frequencyValue,
        reminderTime,
        archived,
      },
    })

    return NextResponse.json(habit, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: '更新习惯失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    await prisma.completionRecord.deleteMany({
      where: { habitId: id },
    })

    await prisma.habit.delete({
      where: { id },
    })

    return NextResponse.json({ message: '删除成功' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: '删除习惯失败' }, { status: 500 })
  }
}