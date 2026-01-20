"use client"

import { useMemo } from "react"
import { useToast } from "@/contexts/ToastContext"
import {
  ToastCloseButton,
  ToastItem,
  ToastMessage,
  ToastRow,
  ToastViewportBottomLeft,
  ToastViewportBottomRight,
  ToastViewportTopLeft,
  ToastViewportTopRight,
} from "@/components/ui/uiStyles"

const getToastRole = (variant) => {
  if (variant === "error") {
    return "alert"
  }
  return "status"
}

const getViewportComponent = (position) => {
  if (position === "top-left") {
    return ToastViewportTopLeft
  }
  if (position === "top-right") {
    return ToastViewportTopRight
  }
  if (position === "bottom-left") {
    return ToastViewportBottomLeft
  }
  return ToastViewportBottomRight
}

const ALL_POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"]

export default function ToastViewport() {
  const { toasts, dismissToast, pauseToast, resumeToast } = useToast()

  const renderCloseButton = (toast) => {
    if (!toast.isDismissable) {
      return null
    }

    return (
      <ToastCloseButton
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismissToast(toast.id)}
      >
        ×
      </ToastCloseButton>
    )
  }

  const toastsByPosition = useMemo(() => {
    const grouped = new Map()
    for (const position of ALL_POSITIONS) {
      grouped.set(position, [])
    }

    for (const toast of toasts) {
      const position = toast.position || "bottom-right"
      const existing = grouped.get(position) || []
      existing.push(toast)
      grouped.set(position, existing)
    }

    return grouped
  }, [toasts])

  return (
    <>
      {ALL_POSITIONS.map((position) => {
        const viewportToasts = toastsByPosition.get(position) || []
        if (viewportToasts.length === 0) {
          return null
        }

        const ViewportComponent = getViewportComponent(position)

        return (
          <ViewportComponent
            key={position}
            aria-live="polite"
            aria-atomic="true"
          >
            {viewportToasts.map((toast) => {
              return (
                <ToastItem
                  key={toast.id}
                  $variant={toast.variant}
                  role={getToastRole(toast.variant)}
                  aria-atomic="true"
                  onMouseEnter={() => pauseToast(toast.id)}
                  onMouseLeave={() => resumeToast(toast.id)}
                >
                  <ToastRow>
                    <ToastMessage>{toast.message}</ToastMessage>
                    {renderCloseButton(toast)}
                  </ToastRow>
                </ToastItem>
              )
            })}
          </ViewportComponent>
        )
      })}
    </>
  )
}
