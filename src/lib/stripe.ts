import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(key, {
      apiVersion: '2025-04-30' as any,
      typescript: true,
    })
  }
  return stripeInstance
}
