import { useState, useRef, useCallback } from 'react'

// Approved file constraints (from REQUIREMENTS.md FR-1.1)
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp'
const MAX_SIZE_MB = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

/**
 * Dropzone — Drag-and-drop + click-to-browse image picker.
 *
 * Props:
 *   onFileSelected(file, previewUrl) — called when a valid file is chosen
 *   selectedFile  — the currently selected File object (or null)
 *   previewUrl    — blob URL string for the preview image (or null)
 *   onRemove()    — called when user clicks "Remove" to clear selection
 */
function Dropzone({ onFileSelected, selectedFile, previewUrl, onRemove }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  /* ── Validate and accept a File object ── */
  const processFile = useCallback((file) => {
    setError('')

    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, and WEBP images are accepted. Please choose a valid image file.')
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.`)
      return
    }

    // Create a blob URL for the image preview
    const url = URL.createObjectURL(file)
    onFileSelected(file, url)
  }, [onFileSelected])

  /* ── Drag & drop events ── */
  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    processFile(file)
  }

  /* ── File input change ── */
  function handleInputChange(e) {
    const file = e.target.files[0]
    processFile(file)
    // Reset the input value so the same file can be re-selected after removal
    e.target.value = ''
  }

  /* ── Remove selected file ── */
  function handleRemove(e) {
    // Stop the click from bubbling up to the dropzone (which would open file dialog)
    e.stopPropagation()
    setError('')
    onRemove()
  }

  /* ── If a file is already selected, show preview state ── */
  if (selectedFile && previewUrl) {
    return (
      <div className="space-y-4">
        {/* Image preview card */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-brand-300 bg-brand-50/30 shadow-subtle">
          {/* Preview image */}
          <img
            src={previewUrl}
            alt="Selected product label"
            className="w-full max-h-72 object-contain bg-slate-50"
          />

          {/* Overlay: file info + actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-brand-100 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* File type icon */}
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500">{(selectedFile.size / 1024).toFixed(0)} KB · {selectedFile.type.split('/')[1].toUpperCase()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Replace button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50"
              >
                Replace
              </button>
              {/* Remove button */}
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Hidden file input for Replace */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            className="hidden"
            onChange={handleInputChange}
          />

          {/* Success badge top-right */}
          <div className="absolute top-3 right-3 bg-brand-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Ready
          </div>
        </div>

        {/* Microcopy */}
        <p className="text-center text-[11px] text-slate-400">
          Looking good! Click <strong>Analyze Product</strong> when you're ready, or replace/remove the image above.
        </p>
      </div>
    )
  }

  /* ── Empty / drag-over state ── */
  return (
    <div className="space-y-3">
      {/* Dropzone area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Upload product label image — click or drag and drop"
        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group select-none ${
          isDragOver
            ? 'border-brand-500 bg-brand-50/70 scale-[1.01] shadow-subtle'
            : 'border-brand-200 bg-brand-50/20 hover:bg-brand-50/40 hover:border-brand-400 hover:shadow-subtle'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleInputChange}
        />

        {/* Upload icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-200 ${
          isDragOver
            ? 'bg-brand-200 text-brand-800 scale-110'
            : 'bg-brand-100 text-brand-700 group-hover:scale-110 group-hover:bg-brand-200'
        }`}>
          {isDragOver ? (
            // Arrow-down icon when dragging
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            // Upload icon at rest
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Headline */}
        <h3 className="text-base font-bold text-slate-900 mb-1.5">
          {isDragOver ? 'Drop it here!' : 'Drop your label photo here'}
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-slate-500 mb-5 leading-relaxed max-w-xs">
          Supports <strong>JPG, PNG, WEBP</strong> — up to {MAX_SIZE_MB} MB<br />
          Works with flat labels, curved bottles, and folded packaging
        </p>

        {/* Browse button (visual only — entire zone is clickable) */}
        <span className="inline-flex items-center gap-2 bg-brand-900 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm group-hover:bg-brand-800 transition-colors pointer-events-none">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Browse Files
        </span>
      </div>

      {/* Validation error */}
      {error && (
        <div className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Supported formats footnote */}
      <p className="text-center text-[11px] text-slate-400 font-medium">
        Supports food, cosmetics, supplements, and personal-care product labels.
      </p>
    </div>
  )
}

export default Dropzone
