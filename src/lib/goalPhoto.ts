import { supabase } from './supabase'

export const GOAL_PHOTO_BUCKET = 'goal-photos'
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
// Raw file, before compression — people will pick 5MB+ phone photos, this
// just stops something absurd (or non-image mislabeled as one) from
// hanging the browser in createImageBitmap.
export const MAX_INPUT_BYTES = 15 * 1024 * 1024

const MAX_DIMENSION = 1600
const OUTPUT_QUALITY = 0.82
// Regenerated fresh every time useSavingsGoals loads goals, so this only
// needs to outlive a single page visit.
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24

export function isAcceptedImageType(type: string): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(type)
}

// Resizes to at most MAX_DIMENSION on the long edge and re-encodes as WebP —
// normalizes every input format/size down to a small, predictable output
// (typically well under 500KB) regardless of what a phone camera produced.
// Every upload ends up at "{user_id}/{goal_id}.webp" because of this, so
// replacing a photo never leaves an orphaned file at a different extension.
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d context unavailable')
    ctx.drawImage(bitmap, 0, 0, width, height)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))),
        'image/webp',
        OUTPUT_QUALITY,
      )
    })
  } finally {
    bitmap.close()
  }
}

// Validates, compresses, and uploads in one step — callers just get back a
// path to persist on the goal row, or a French error to show. Storage RLS
// (see supabase/schema.sql) is what actually enforces Premium-only on the
// write; this function doesn't need to know the caller's plan.
export async function uploadGoalPhoto(
  userId: string,
  goalId: string,
  file: File,
): Promise<{ path: string | null; error: string | null }> {
  if (!isAcceptedImageType(file.type)) {
    return { path: null, error: 'Formats acceptés : JPG, PNG ou WebP.' }
  }
  if (file.size > MAX_INPUT_BYTES) {
    return { path: null, error: `Image trop grande (max ${Math.round(MAX_INPUT_BYTES / (1024 * 1024))} Mo).` }
  }

  let compressed: Blob
  try {
    compressed = await compressImage(file)
  } catch {
    return { path: null, error: "Impossible de traiter cette image — essaie-en une autre." }
  }

  const path = `${userId}/${goalId}.webp`
  const { error } = await supabase.storage
    .from(GOAL_PHOTO_BUCKET)
    .upload(path, compressed, { contentType: 'image/webp', upsert: true })
  if (error) {
    // Storage surfaces the RLS denial (Standard/Free trying to upload) as a
    // generic "new row violates row-level security policy" — not something
    // to show verbatim to a user who's just trying to add a photo.
    const isRlsDenial = error.message.toLowerCase().includes('row-level security')
    return {
      path: null,
      error: isRlsDenial ? "Photo d'objectif — fonctionnalité Premium." : error.message,
    }
  }
  return { path, error: null }
}

export async function deleteGoalPhoto(path: string): Promise<void> {
  await supabase.storage.from(GOAL_PHOTO_BUCKET).remove([path])
}

// Batched — Épargne shows every goal at once, one round trip beats N.
export async function signGoalPhotoUrls(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {}
  const { data, error } = await supabase.storage
    .from(GOAL_PHOTO_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_EXPIRY_SECONDS)
  if (error || !data) return {}
  const result: Record<string, string> = {}
  for (const entry of data) {
    if (entry.signedUrl && entry.path) result[entry.path] = entry.signedUrl
  }
  return result
}
