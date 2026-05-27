import { query } from './db'

export type SubscriptionStatus = 'free' | 'active' | 'pending' | 'cancelled' | 'expired'
export type SubscriptionPlan = 'free' | 'pro'

export type Subscription = {
  id: number
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  mp_preapproval_id: string | null
  mp_payment_id: string | null
  current_period_start: Date | null
  current_period_end: Date | null
  created_at: Date
  updated_at: Date
}

export type UsageRecord = {
  id: number
  user_id: string
  month: string // YYYY-MM
  query_count: number
}

const FREE_QUERY_LIMIT = 30

export async function ensureSubscriptionTables(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'free',
      mp_preapproval_id TEXT,
      mp_payment_id TEXT,
      current_period_start TIMESTAMP,
      current_period_end TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id)
    )
  `)
  await query(`
    CREATE TABLE IF NOT EXISTS usage_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      month TEXT NOT NULL,
      query_count INTEGER NOT NULL DEFAULT 0,
      UNIQUE(user_id, month)
    )
  `)
  try {
    await query(`CREATE INDEX IF NOT EXISTS idx_usage_user_month ON usage_records(user_id, month)`)
  } catch { /* ok */ }
}

export async function getSubscription(userId: number): Promise<Subscription | null> {
  await ensureSubscriptionTables()
  const result = await query<Subscription>(
    `SELECT * FROM subscriptions WHERE user_id = $1`,
    [userId]
  )
  return result.rows[0] || null
}

export async function createOrUpdateSubscription(
  userId: number,
  plan: SubscriptionPlan,
  status: SubscriptionStatus,
  mpPreapprovalId?: string
): Promise<Subscription> {
  await ensureSubscriptionTables()
  const result = await query<Subscription>(
    `INSERT INTO subscriptions (user_id, plan, status, mp_preapproval_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id)
     DO UPDATE SET
       plan = EXCLUDED.plan,
       status = EXCLUDED.status,
       mp_preapproval_id = COALESCE(NULLIF(EXCLUDED.mp_preapproval_id, ''), subscriptions.mp_preapproval_id),
       updated_at = NOW()
     RETURNING *`,
    [userId, plan, status, mpPreapprovalId || null]
  )
  return result.rows[0]
}

export async function activateSubscription(
  userId: number,
  mpPreapprovalId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<Subscription> {
  await ensureSubscriptionTables()
  const result = await query<Subscription>(
    `UPDATE subscriptions
     SET status = 'active',
         plan = 'pro',
         mp_preapproval_id = $2,
         current_period_start = $3,
         current_period_end = $4,
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING *`,
    [userId, mpPreapprovalId, periodStart, periodEnd]
  )
  return result.rows[0]
}

export async function cancelSubscription(userId: number): Promise<void> {
  await query(
    `UPDATE subscriptions SET status = 'cancelled', updated_at = NOW() WHERE user_id = $1`,
    [userId]
  )
}

export async function expireSubscription(userId: number): Promise<void> {
  await query(
    `UPDATE subscriptions SET status = 'expired', plan = 'free', updated_at = NOW() WHERE user_id = $1`,
    [userId]
  )
}

export async function getOrCreateUsageRecord(
  userId: number,
  month: string
): Promise<UsageRecord> {
  await ensureSubscriptionTables()
  const result = await query<UsageRecord>(
    `INSERT INTO usage_records (user_id, month, query_count)
     VALUES ($1, $2, 0)
     ON CONFLICT (user_id, month)
     DO UPDATE SET query_count = usage_records.query_count
     RETURNING *`,
    [userId, month]
  )
  return result.rows[0]
}

export async function incrementQueryCount(userId: number, month: string): Promise<number> {
  await ensureSubscriptionTables()
  const result = await query<UsageRecord>(
    `INSERT INTO usage_records (user_id, month, query_count)
     VALUES ($1, $2, 1)
     ON CONFLICT (user_id, month)
     DO UPDATE SET query_count = usage_records.query_count + 1
     RETURNING *`,
    [userId, month]
  )
  return result.rows[0].query_count
}

export async function checkUsageLimit(userId: number): Promise<{
  allowed: boolean
  used: number
  limit: number
  plan: SubscriptionPlan
}> {
  await ensureSubscriptionTables()

  const sub = await getSubscription(userId)
  const plan: SubscriptionPlan = sub?.status === 'active' ? 'pro' : 'free'

  if (plan === 'pro') {
    return { allowed: true, used: 0, limit: Infinity, plan }
  }

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const usage = await getOrCreateUsageRecord(userId, month)

  return {
    allowed: usage.query_count < FREE_QUERY_LIMIT,
    used: usage.query_count,
    limit: FREE_QUERY_LIMIT,
    plan,
  }
}

export async function resetExpiredSubscriptions(): Promise<void> {
  await query(
    `UPDATE subscriptions
     SET status = 'expired', plan = 'free', updated_at = NOW()
     WHERE status = 'active'
       AND current_period_end IS NOT NULL
       AND current_period_end < NOW()`
  )
}
