import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSubscription, ensureSubscriptionTables } from '@/lib/subscription-db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')

    if (!userIdParam) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (userIdParam !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await ensureSubscriptionTables()
    const userId = parseInt(userIdParam, 10)
    const sub = await getSubscription(userId)

    if (sub) {
      return NextResponse.json({
        userId: String(sub.user_id),
        status: sub.status,
        plan: sub.plan,
        periodEnd: sub.current_period_end,
      })
    }

    // Default: free tier
    return NextResponse.json({
      userId: userIdParam,
      status: 'free',
      plan: 'free',
      priceId: null,
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
