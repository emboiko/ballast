"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

const ToastContext = createContext(undefined)

const DEFAULT_TOAST_POSITION = "bottom-right"

const getDefaultDurationMs = (variant) => {
  if (variant === "success") {
    return 3000
  }
  if (variant === "warning") {
    return 5000
  }
  if (variant === "error") {
    return 6000
  }
  if (variant === "info") {
    return 4000
  }
  return 4000
}

const createToastId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID()
  }
  return `toast_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toastTimersRef = useRef(new Map())
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      for (const [, timerEntry] of toastTimersRef.current.entries()) {
        if (timerEntry?.timeoutId) {
          window.clearTimeout(timerEntry.timeoutId)
        }
      }
      toastTimersRef.current.clear()
    }
  }, [])

  const dismissToast = useCallback((toastId) => {
    const timerEntry = toastTimersRef.current.get(toastId)
    if (timerEntry?.timeoutId) {
      window.clearTimeout(timerEntry.timeoutId)
    }
    toastTimersRef.current.delete(toastId)

    setToasts((currentToasts) => {
      return currentToasts.filter((toast) => toast.id !== toastId)
    })
  }, [])

  const clearToasts = useCallback(() => {
    for (const [, timerEntry] of toastTimersRef.current.entries()) {
      if (timerEntry?.timeoutId) {
        window.clearTimeout(timerEntry.timeoutId)
      }
    }

    toastTimersRef.current.clear()
    setToasts([])
  }, [])

  const scheduleToastDismissal = useCallback(
    (toast) => {
      const durationMs = toast.durationMs
      if (!durationMs || durationMs <= 0) {
        return
      }

      const existingTimerEntry = toastTimersRef.current.get(toast.id)
      if (existingTimerEntry?.timeoutId) {
        window.clearTimeout(existingTimerEntry.timeoutId)
      }

      const timeoutId = window.setTimeout(() => {
        if (!isMountedRef.current) {
          return
        }
        dismissToast(toast.id)
      }, durationMs)

      toastTimersRef.current.set(toast.id, {
        timeoutId,
        startedAtMs: Date.now(),
        remainingMs: durationMs,
        isPaused: false,
      })
    },
    [dismissToast]
  )

  const pauseToast = useCallback((toastId) => {
    const timerEntry = toastTimersRef.current.get(toastId)
    if (!timerEntry || timerEntry.isPaused) {
      return
    }
    if (!timerEntry.timeoutId) {
      return
    }

    window.clearTimeout(timerEntry.timeoutId)

    const elapsedMs = Date.now() - timerEntry.startedAtMs
    let remainingMs = timerEntry.remainingMs - elapsedMs
    if (remainingMs < 0) {
      remainingMs = 0
    }

    toastTimersRef.current.set(toastId, {
      timeoutId: null,
      startedAtMs: timerEntry.startedAtMs,
      remainingMs,
      isPaused: true,
    })
  }, [])

  const resumeToast = useCallback(
    (toastId) => {
      const timerEntry = toastTimersRef.current.get(toastId)
      if (!timerEntry || !timerEntry.isPaused) {
        return
      }
      if (!timerEntry.remainingMs || timerEntry.remainingMs <= 0) {
        dismissToast(toastId)
        return
      }

      const timeoutId = window.setTimeout(() => {
        if (!isMountedRef.current) {
          return
        }
        dismissToast(toastId)
      }, timerEntry.remainingMs)

      toastTimersRef.current.set(toastId, {
        timeoutId,
        startedAtMs: Date.now(),
        remainingMs: timerEntry.remainingMs,
        isPaused: false,
      })
    },
    [dismissToast]
  )

  const showToast = useCallback(
    ({ message, variant, durationMs, position, id, isDismissable }) => {
      const toastId = id || createToastId()
      const toastVariant = variant || "neutral"
      const toastDurationMs =
        typeof durationMs === "number"
          ? durationMs
          : getDefaultDurationMs(toastVariant)

      let toastPosition = DEFAULT_TOAST_POSITION
      if (position) {
        toastPosition = position
      }

      let toastIsDismissable = true
      if (typeof isDismissable === "boolean") {
        toastIsDismissable = isDismissable
      }

      const newToast = {
        id: toastId,
        message,
        variant: toastVariant,
        durationMs: toastDurationMs,
        position: toastPosition,
        isDismissable: toastIsDismissable,
        createdAtMs: Date.now(),
      }

      setToasts((currentToasts) => {
        const filteredToasts = currentToasts.filter(
          (toast) => toast.id !== toastId
        )
        return [newToast, ...filteredToasts]
      })

      scheduleToastDismissal(newToast)

      return toastId
    },
    [scheduleToastDismissal]
  )

  const showSuccessToast = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, message, variant: "success" })
    },
    [showToast]
  )

  const showErrorToast = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, message, variant: "error" })
    },
    [showToast]
  )

  const showWarningToast = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, message, variant: "warning" })
    },
    [showToast]
  )

  const showInfoToast = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, message, variant: "info" })
    },
    [showToast]
  )

  const value = useMemo(() => {
    return {
      toasts,
      showToast,
      showSuccessToast,
      showErrorToast,
      showWarningToast,
      showInfoToast,
      dismissToast,
      clearToasts,
      pauseToast,
      resumeToast,
    }
  }, [
    clearToasts,
    dismissToast,
    pauseToast,
    resumeToast,
    showErrorToast,
    showInfoToast,
    showSuccessToast,
    showToast,
    showWarningToast,
    toasts,
  ])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
