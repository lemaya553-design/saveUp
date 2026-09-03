import { Link } from 'react-router-dom'
import { isAcceptedImageType, MAX_INPUT_BYTES } from '../lib/goalPhoto'

// Shared between AddGoalCard (create) and SavingsGoalCard's edit mode
// (replace/remove) — same picker, same Premium gate, same validation.
export function GoalPhotoPicker({
  photoUrl,
  isPremium,
  uploading,
  error,
  onSelectFile,
  onError,
  onRemove,
}: {
  photoUrl: string | null
  isPremium: boolean
  uploading: boolean
  error: string | null
  onSelectFile: (file: File) => void
  onError: (message: string) => void
  onRemove?: () => void
}) {
  if (!isPremium) {
    return (
      <Link
        to="/tarifs"
        className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/25"
      >
        🔒 Photo de l'objectif — Premium
      </Link>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!isAcceptedImageType(file.type)) {
      onError('Formats acceptés : JPG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_INPUT_BYTES) {
      onError(`Image trop grande (max ${Math.round(MAX_INPUT_BYTES / (1024 * 1024))} Mo).`)
      return
    }
    onSelectFile(file)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-overlay/15 text-lg text-muted"
          >
            📷
          </div>
        )}
        <div className="flex flex-col items-start gap-1">
          <label
            className={`text-xs font-medium text-accent hover:text-accent/80 ${
              uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'
            }`}
          >
            {uploading ? 'Envoi en cours...' : photoUrl ? 'Remplacer la photo' : 'Ajouter une photo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={handleChange}
            />
          </label>
          {photoUrl && onRemove && !uploading && (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Supprimer la photo
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
