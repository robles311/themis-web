import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findUserByEmail, updateUser, updatePassword } from '@/lib/user-db'

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found in session' }, { status: 400 })
    }

    const user = await findUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, currentPassword, newPassword } = body

    // Update profile fields
    if (name !== undefined || body.email !== undefined) {
      const updated = await updateUser(userEmail, {
        name: name !== undefined ? name : undefined,
        email: body.email !== undefined ? body.email : undefined,
      })
      if (!updated) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }
      return NextResponse.json({ message: 'Profile updated successfully', user: updated })
    }

    // Change password
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
      { error: 'Nothing to update. Provide name or newPassword.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
