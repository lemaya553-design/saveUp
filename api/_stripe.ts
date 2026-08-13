// Shared clients for the serverless functions in this directory. Never
// imported from src/ — these hold secrets (Stripe secret key, Supabase
// service role key) that must never reach the browser bundle.
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export function getStripe(): Stripe {
  return new Stripe(requireEnv('STRIPE_SECRET_KEY'))
}

// Service role key bypasses RLS — used only to (a) verify who a request's
// bearer token belongs to and (b) write subscription status after Stripe
// confirms a payment. Never exposed to the client.
export function getSupabaseAdmin() {
  return createClient(requireEnv('VITE_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'))
}

// Validates the Supabase access token a frontend request sends in its
// Authorization header and returns the user it belongs to, or null if the
// token is missing/invalid — callers should respond 401 in that case.
export async function getUserFromAuthHeader(authHeader: string | undefined) {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null
  if (!token) return null
  const { data, error } = await getSupabaseAdmin().auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}
