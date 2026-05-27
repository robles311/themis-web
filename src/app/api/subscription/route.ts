import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStripe } from '../../../lib/stripe'

// DEMO: In-memory subscription store (replace with a real DB in production)
const subscriptions: Map<string, { userId: string; status: string; priceId: string }> = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceId, userId } = body

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'priceId and userId are required' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      // DEMO: Return mock checkout URL when Stripe is not configured
      const mockUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?checkout=mock&priceId=${priceId}&userId=${userId}`
      subscriptions.set(userId, { userId, status: 'active', priceId })
      return NextResponse.json({ url: mockUrl })
    }

    const stripeClient = getStripe()
    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // DEMO: Check in-memory store first
    const sub = subscriptions.get(userId)
    if (sub) {
      return NextResponse.json({
        userId: sub.userId,
        status: sub.status,
        priceId: sub.priceId,
      })
    }

    // DEMO: Default to free tier if no subscription found
    return NextResponse.json({
      userId,
      status: 'free',
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
