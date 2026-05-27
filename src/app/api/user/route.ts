import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findUserByEmail, listUsers } from '@/lib/user-db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      const user = await findUserByEmail(email)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      if (String(user.id) !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const { password_hash, ...safe } = user
      return NextResponse.json({ user: safe })
    }

    // Admin only: list all users
    const users = await listUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
