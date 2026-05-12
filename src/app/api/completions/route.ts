import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { userId, habitId } = await request.json()
    
    if (!userId || !habitId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const existingRecord = await prisma.completionRecord.findFirst({
      where: {
        habitId,
        completedAt: {
          gte: new Date(new Date().toDateString()),
          lt: new Date(new Date().toDateString()).getTime() + 24 * 60 * 60 * 1000,
        },
      },
    })

    if (existingRecord) {
      return NextResponse.json({ error: '今日已完成' }, { status: 400 })
    }

    const record = await prisma.completionRecord.create({
      data: {
        userId,
        habitId,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '打卡失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { habitId } = await request.json()
    
    if (!habitId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const existingRecord = await prisma.completionRecord.findFirst({
      where: {
        habitId,
        completedAt: {
          gte: new Date(new Date().toDateString()),
          lt: new Date(new Date().toDateString()).getTime() + 24 * 60 * 60 * 1000,
        },
      },
    })

    if (!existingRecord) {
      return NextResponse.json({ error: '今日未打卡' }, { status: 400 })
    }

    await prisma.completionRecord.delete({
      where: { id: existingRecord.id },
    })

    return NextResponse.json({ message: '取消打卡成功' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: '取消打卡失败' }, { status: 500 })
  }
}