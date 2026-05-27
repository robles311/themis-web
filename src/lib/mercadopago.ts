import { MercadoPagoConfig, PreApproval } from 'mercadopago'

export function getMpClient(): MercadoPagoConfig {
  const token = process.env.MERCADO_ACCESS_TOKEN
  if (!token) {
    throw new Error('MERCADO_ACCESS_TOKEN no está configurado')
  }
  return new MercadoPagoConfig({
    accessToken: token,
    options: { timeout: 5000 },
  })
}

export function getPreApprovalClient(): PreApproval {
  const client = getMpClient()
  return new PreApproval(client)
}

/**
 * Crea una suscripción (preapproval) en MercadoPago
 * El usuario es redirigido a MercadoPago para autorizar el pago recurrente
 */
export async function createPreApproval({
  payerEmail,
  backUrl,
  planAmount = 19000,
  planTitle = 'Themis Pro',
  externalReference,
}: {
  payerEmail: string
  backUrl: string
  planAmount?: number
  planTitle?: string
  externalReference?: string
}) {
  const preApproval = getPreApprovalClient()

  const result = await preApproval.create({
    body: {
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: planAmount,
        currency_id: 'CLP',
      },
      payer_email: payerEmail,
      back_url: backUrl,
      reason: planTitle,
      external_reference: externalReference,
    },
  })

  return result
}

/**
 * Obtiene el estado de una preapproval
 */
export async function getPreApprovalStatus(id: string) {
  const preApproval = getPreApprovalClient()
  return await preApproval.get({ id })
}

/**
 * Cancela una preapproval en MercadoPago
 */
export async function cancelPreApproval(id: string) {
  const preApproval = getPreApprovalClient()
  return await preApproval.update({
    id,
    body: { status: 'cancelled' },
  })
}
