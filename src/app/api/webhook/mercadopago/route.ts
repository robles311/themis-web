import { NextRequest, NextResponse } from 'next/server'
import { activateSubscription, cancelSubscription, ensureSubscriptionTables } from '@/lib/subscription-db'
import { getPreApprovalStatus } from '@/lib/mercadopago'

/**
 * Webhook IPN (Instant Payment Notification) de MercadoPago
 * MercadoPago envía notificaciones aquí cuando cambia el estado de una suscripción
 *
 * Tipos de notificación relevantes:
 * - preapproval.created  — se creó la preapproval
 * - preapproval.updated  — se actualizó la preapproval
 * - preapproval.payment  — se procesó un pago recurrente
 */
export async function POST(request: NextRequest) {
  try {
    await ensureSubscriptionTables()

    const body = await request.json()
    const { action, data } = body

    console.log('[MP Webhook] Received:', action, JSON.stringify(data))

    if (!action || !data?.id) {
      return NextResponse.json({ message: 'OK' })
    }

    // Nos interesa cuando se aprueba una preapproval (suscripción)
    if (action === 'preapproval.created' || action === 'preapproval.updated') {
      const preapprovalId = data.id
      const status = await getPreApprovalStatus(preapprovalId)

      const mpData = status as any

      if (mpData.status === 'authorized' || mpData.status === 'active') {
        const externalRef = mpData.external_reference
        if (externalRef) {
          const userId = parseInt(externalRef, 10)
          if (!isNaN(userId)) {
            const start = mpData.auto_recurring?.next_payment_date
              ? new Date(mpData.auto_recurring.next_payment_date)
              : new Date()
            const end = new Date(start)
            end.setMonth(end.getMonth() + 1)

            await activateSubscription(userId, preapprovalId, start, end)
            console.log(`[MP Webhook] User ${userId} subscription activated`)
          }
        }
      } else if (mpData.status === 'cancelled') {
        const externalRef = mpData.external_reference
        if (externalRef) {
          const userId = parseInt(externalRef, 10)
          if (!isNaN(userId)) {
            await cancelSubscription(userId)
            console.log(`[MP Webhook] User ${userId} subscription cancelled`)
          }
        }
      }
    }

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    // Siempre responder 200 a MercadoPago aunque falle, o reenviará la notificación
    console.error('[MP Webhook] Error:', error)
    return NextResponse.json({ message: 'OK' })
  }
}

// MercadoPago puede enviar GET para verificar el webhook
export async function GET() {
  return NextResponse.json({ message: 'Webhook activo' })
}
