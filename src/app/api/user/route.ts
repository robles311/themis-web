import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findUserByEmail, listUsers, updatePassword } from '@/lib/user-db'

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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, newPassword } = body

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and newPassword are required' },
        { status: 400 }
      )
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updated = await updatePassword(email, newPassword)
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
