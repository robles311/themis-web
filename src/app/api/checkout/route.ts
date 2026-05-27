import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createPreApproval } from '@/lib/mercadopago'
import { createOrUpdateSubscription, ensureSubscriptionTables } from '@/lib/subscription-db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = parseInt(session.user.id, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { plan } = body

    if (plan !== 'pro') {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Si no hay token de MercadoPago, modo demo
    if (!process.env.MERCADO_ACCESS_TOKEN) {
      await ensureSubscriptionTables()
      await createOrUpdateSubscription(userId, 'pro', 'active')
      return NextResponse.json({
        url: `${appUrl}/dashboard?checkout=mock`,
        demo: true,
      })
    }

    // Crear preapproval en MercadoPago
    const preapproval = await createPreApproval({
      payerEmail: session.user.email || '',
      backUrl: `${appUrl}/dashboard`,
      planAmount: 19000,
      planTitle: 'Themis Pro - Mensual',
      externalReference: String(userId),
    })

    // Guardar referencia en DB
    await createOrUpdateSubscription(
      userId,
      'pro',
      'pending',
      preapproval.id
    )

    const resp = preapproval as any
    const initPoint = resp.init_point || resp.sandbox_init_point
    if (!initPoint) {
      return NextResponse.json(
        { error: 'No se pudo generar el link de pago' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: initPoint })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Error al iniciar el proceso de pago' },
      { status: 500 }
    )
  }
}
