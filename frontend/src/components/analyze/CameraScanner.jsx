import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * Camera states — makes the logic easy to follow and debug.
 * IDLE       → component just mounted, nothing started yet
 * REQUESTING → waiting for the user to grant/deny camera permission
 * STREAMING  → camera is live and showing video feed
 * CAPTURED   → user has taken a photo, showing the still image
 * ERROR      → camera is unavailable or permission was denied
 */
const CAM_STATE = {
  IDLE:       'idle',
  REQUESTING: 'requesting',
  STREAMING:  'streaming',
  CAPTURED:   'captured',
  ERROR:      'error',
}

/**
 * CameraScanner — HTML5 MediaDevices webcam capture.
 *
 * Workflow:
 *   Idle → click "Start Camera" → request permission → live video stream
 *   → click "Capture" → still image preview → confirm or retake
 *
 * Props:
 *   onCapture(file, previewUrl) — called with the captured image as a File + blob URL
 *   onCancel()                  — called when user cancels/closes the camera
 */
function CameraScanner({ onCapture, onCancel }) {
  const [camState, setCamState] = useState(CAM_STATE.IDLE)
  const [errorMsg, setErrorMsg] = useState('')
  const [capturedUrl, setCapturedUrl] = useState(null)   // blob URL of the still image

  const videoRef   = useRef(null)   // <video> element for live feed
  const canvasRef  = useRef(null)   // <canvas> used to snapshot a frame
  const streamRef  = useRef(null)   // MediaStream — we keep this to stop it later

  /* ── Stop the camera stream on unmount to avoid the browser keeping the mic/cam active ── */
  useEffect(() => {
    return () => stopStream()
  }, [])

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  /* ── Request camera permission and start streaming ── */
  const startCamera = useCallback(async () => {
    setCamState(CAM_STATE.REQUESTING)
    setErrorMsg('')

    try {
      // Ask for the rear camera on mobile, fallback to any camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },  // prefer rear camera on phones
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      setCamState(CAM_STATE.STREAMING)

      // Attach the stream to the video element
      // We use a short setTimeout to ensure the video element is in the DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      }, 100)

    } catch (err) {
      stopStream()

      // Provide a meaningful message based on the error type
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Camera access was denied. Please allow camera permission in your browser settings, then try again.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No camera was found on this device. Please use the file upload option instead.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMsg('Camera is already in use by another app. Close that app and try again.')
      } else if (!navigator.mediaDevices) {
        setErrorMsg('Camera access is not supported on this browser or connection. Use HTTPS or try Chrome/Firefox.')
      } else {
        setErrorMsg(`Camera error: ${err.message || 'Unknown error occurred.'}`)
      }

      setCamState(CAM_STATE.ERROR)
    }
  }, [])

  /* ── Capture a still frame from the video stream ── */
  function capturePhoto() {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Match canvas size to the actual video feed dimensions
    canvas.width  = video.videoWidth  || 1280
    canvas.height = video.videoHeight || 720

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Stop the video stream — we have our photo
    stopStream()

    // Convert canvas to a blob URL for preview
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      setCapturedUrl(url)
      setCamState(CAM_STATE.CAPTURED)
    }, 'image/jpeg', 0.92)  // JPEG at 92% quality
  }

  /* ── Retake — go back to live streaming ── */
  function retake() {
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl)
      setCapturedUrl(null)
    }
    startCamera()
  }

  /* ── Confirm captured photo ── */
  function confirmCapture() {
    if (!capturedUrl) return

    // Convert the blob URL back to a File object for AnalysisContext
    fetch(capturedUrl)
      .then(r => r.blob())
      .then(blob => {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
        const file = new File([blob], `parakh-capture-${timestamp}.jpg`, { type: 'image/jpeg' })
        onCapture(file, capturedUrl)
      })
  }

  /* ── Cancel — stop stream and call parent ── */
  function handleCancel() {
    stopStream()
    if (capturedUrl) URL.revokeObjectURL(capturedUrl)
    onCancel()
  }

  /* ────────────────────────────────────────────
     RENDER — based on camState
  ─────────────────────────────────────────────── */

  // Hidden canvas (always rendered so ref is available)
  const hiddenCanvas = <canvas ref={canvasRef} className="hidden" />

  /* ── IDLE: Show the "Start Camera" prompt ── */
  if (camState === CAM_STATE.IDLE) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-5 text-center">
        {hiddenCanvas}

        {/* Camera icon */}
        <div className="w-20 h-20 rounded-3xl bg-brand-50 border-2 border-brand-200 flex items-center justify-center text-brand-600">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">Use Your Camera</h3>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            Point your camera at the product ingredient label. We'll capture a clear photo for analysis.
          </p>
        </div>

        {/* Tips */}
        <div className="bg-brand-50/60 rounded-xl border border-brand-100 px-5 py-4 text-left max-w-sm w-full space-y-2">
          <p className="text-[11px] font-bold text-brand-800 uppercase tracking-wide mb-2">Tips for best results</p>
          {[
            'Hold the camera steady and close to the label',
            'Ensure the label is well-lit and in focus',
            'Capture the full ingredient list in one frame',
          ].map(tip => (
            <div key={tip} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <p className="text-xs text-slate-600">{tip}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full max-w-sm">
          <button
            onClick={handleCancel}
            className="flex-1 btn-secondary text-sm py-3"
          >
            Cancel
          </button>
          <button
            onClick={startCamera}
            className="flex-1 btn-primary text-sm py-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Start Camera
          </button>
        </div>
      </div>
    )
  }

  /* ── REQUESTING: Waiting for permission ── */
  if (camState === CAM_STATE.REQUESTING) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
        {hiddenCanvas}
        <div className="w-16 h-16 rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center">
          <svg className="w-7 h-7 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-slate-800">Requesting camera access…</p>
          <p className="text-sm text-slate-500 mt-1">Please click <strong>Allow</strong> in the browser permission prompt.</p>
        </div>
      </div>
    )
  }

  /* ── STREAMING: Live camera feed ── */
  if (camState === CAM_STATE.STREAMING) {
    return (
      <div className="space-y-4">
        {hiddenCanvas}

        {/* Live video with reticle overlay */}
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-card aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Reticle corners */}
          {[
            'top-3 left-3 border-t-2 border-l-2',
            'top-3 right-3 border-t-2 border-r-2',
            'bottom-16 left-3 border-b-2 border-l-2',
            'bottom-16 right-3 border-b-2 border-r-2',
          ].map((cls, i) => (
            <div key={i} className={`absolute w-6 h-6 border-brand-400 pointer-events-none ${cls}`} />
          ))}

          {/* Scan line */}
          <div
            className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-scan-line pointer-events-none"
            style={{ top: 0 }}
          />

          {/* Live indicator */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-bold text-white tracking-wide uppercase">Live</span>
          </div>

          {/* Bottom action bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="text-xs font-semibold text-white/80 hover:text-white transition-colors px-3 py-2"
            >
              Cancel
            </button>

            {/* Capture shutter button */}
            <button
              onClick={capturePhoto}
              className="w-14 h-14 rounded-full bg-white border-4 border-brand-400 flex items-center justify-center hover:bg-brand-50 transition-colors shadow-lg active:scale-95"
              title="Capture photo"
              aria-label="Take photo"
            >
              <div className="w-9 h-9 rounded-full bg-brand-500" />
            </button>

            {/* Right spacer for symmetry */}
            <div className="w-16" />
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Frame the ingredient label clearly, then tap the shutter button to capture.
        </p>
      </div>
    )
  }

  /* ── CAPTURED: Still image preview ── */
  if (camState === CAM_STATE.CAPTURED && capturedUrl) {
    return (
      <div className="space-y-4">
        {hiddenCanvas}

        {/* Captured image */}
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-card">
          <img
            src={capturedUrl}
            alt="Captured label"
            className="w-full max-h-72 object-contain bg-slate-900"
          />
          {/* "Photo taken" chip */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
            <svg className="w-3 h-3 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] font-bold text-white tracking-wide uppercase">Photo Taken</span>
          </div>
        </div>

        {/* Caption */}
        <p className="text-center text-sm font-medium text-slate-700">
          Does the ingredient label look clear and readable?
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={retake}
            className="flex-1 btn-secondary text-sm py-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retake
          </button>
          <button
            onClick={confirmCapture}
            className="flex-1 btn-primary text-sm py-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Use This Photo
          </button>
        </div>
      </div>
    )
  }

  /* ── ERROR: Permission denied or no camera found ── */
  if (camState === CAM_STATE.ERROR) {
    return (
      <div className="space-y-4">
        {hiddenCanvas}

        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
          {/* Error icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Error message */}
          <div className="max-w-xs">
            <p className="font-semibold text-slate-800 mb-1">Camera Unavailable</p>
            <p className="text-sm text-slate-500 leading-relaxed">{errorMsg}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            <button
              onClick={handleCancel}
              className="flex-1 btn-secondary text-sm py-2.5"
            >
              Use Upload Instead
            </button>
            <button
              onClick={startCamera}
              className="flex-1 btn-primary text-sm py-2.5"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default CameraScanner
