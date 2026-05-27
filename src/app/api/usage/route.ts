import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { checkUsageLimit, ensureSubscriptionTables } from '@/lib/subscription-db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 })
    }

    await ensureSubscriptionTables()
    const usage = await checkUsageLimit(userId)

    return NextResponse.json({
      plan: usage.plan,
      used: usage.used,
      limit: usage.limit === Infinity ? null : usage.limit,
      allowed: usage.allowed,
    })
  } catch (error) {
    console.error('Usage status error:', error)
    return NextResponse.json(
      { error: 'Error al obtener uso' },
      { status: 500 }
    )
  }
}
