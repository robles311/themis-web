import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findUserByEmail, listUsers, updatePassword, updateUser } from '@/lib/user-db'

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
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, currentPassword, newPassword } = body

    // Get the current user from DB
    const userEmail = session.user.email
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found in session' }, { status: 400 })
    }

    const user = await findUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update name if provided
    if (name !== undefined) {
      const updated = await updateUser(userEmail, { name })
      if (!updated) {
        return NextResponse.json({ error: 'Failed to update name' }, { status: 500 })
      }
      return NextResponse.json({ message: 'Profile updated successfully', user: updated })
    }

    // Change password if provided
    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }

      const updated = await updatePassword(userEmail, newPassword)
      if (!updated) {
        return NextResponse.json(
          { error: 'Failed to update password' },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: 'Password updated successfully' })
    }

    return NextResponse.json(
      { error: 'Nothing to update. Provide name, or newPassword.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
