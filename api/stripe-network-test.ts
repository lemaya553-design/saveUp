import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    })

    const text = await response.text()

    return res.status(200).json({
      fetchWorked: true,
      stripeStatus: response.status,
      stripeResponse: text.slice(0, 300),
    })
  } catch (err) {
    return res.status(500).json({
      fetchWorked: false,
      error: err instanceof Error ? err.message : 'Erreur inconnue',
    })
  }
}
