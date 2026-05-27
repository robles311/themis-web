import { query } from './db'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

export type User = {
  id: string
  email: string
  name: string
  created_at: Date
}

type UserRow = User & { password_hash: string }

export async function ensureUsersTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  try {
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`, [])
  } catch { /* ok */ }
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':')
  const hash = scryptSync(password, salt, 64).toString('hex')
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(key))
  } catch {
    return false
  }
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  await ensureUsersTable()
  const hash = hashPassword(password)
  const result = await query<UserRow>(
    `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at`,
    [email, name || email.split('@')[0], hash]
  )
  return result.rows[0]
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  await ensureUsersTable()
  const result = await query<UserRow>(
    `SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1`,
    [email]
  )
  return result.rows[0] || null
}

export async function validatePassword(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email)
  if (!user) return null
  if (!verifyPassword(password, user.password_hash)) return null
  const { password_hash, ...safeUser } = user
  return safeUser
}

export async function updatePassword(email: string, newPassword: string): Promise<boolean> {
  const hash = hashPassword(newPassword)
  const result = await query(
    `UPDATE users SET password_hash = $1 WHERE email = $2`,
    [hash, email]
  )
  return (result.rowCount ?? 0) > 0
}

export async function updateUser(email: string, data: { name?: string; email?: string }): Promise<User | null> {
  const sets: string[] = []
  const values: any[] = []
  let idx = 1

  if (data.name !== undefined) {
    sets.push(`name = $${idx++}`)
    values.push(data.name)
  }
  if (data.email !== undefined) {
    sets.push(`email = $${idx++}`)
    values.push(data.email)
  }

  if (sets.length === 0) return null

  values.push(email)
  const result = await query<UserRow>(
    `UPDATE users SET ${sets.join(', ')} WHERE email = $${idx}
     RETURNING id, email, name, created_at`,
    values
  )
  return result.rows[0] || null
}

export async function listUsers(): Promise<User[]> {
  await ensureUsersTable()
  const result = await query<UserRow>(
    `SELECT id, email, name, created_at FROM users ORDER BY created_at DESC`
  )
  return result.rows
}
