"use client"

import { useEffect, useCallback } from "react"
import {
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalClose,
  ModalBody,
  ModalActions,
  ModalButtonSecondary,
  ModalButtonPrimary,
  ModalButtonDanger,
} from "@/components/ui/uiStyles"

/**
 * Reusable confirmation modal component
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {() => void} props.onClose - Called when modal should close
 * @param {() => void} props.onConfirm - Called when user confirms action
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal body content
 * @param {string} [props.confirmText="Confirm"] - Confirm button text
 * @param {string} [props.cancelText="Cancel"] - Cancel button text
 * @param {"primary" | "danger"} [props.confirmVariant="primary"] - Confirm button style
 * @param {boolean} [props.isLoading=false] - Whether action is in progress
 * @param {boolean} [props.confirmDisabled=false] - Whether confirm button is disabled
 * @param {string} [props.maxWidth] - Max width of modal
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
  confirmDisabled = false,
  maxWidth,
}) {
  const handleEscape = useCallback(
    (event) => {
      if (event.key === "Escape" && isOpen && !isLoading) {
        onClose()
      }
    },
    [isOpen, isLoading, onClose]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [handleEscape])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !isLoading) {
      onClose()
    }
  }

  const ConfirmButton =
    confirmVariant === "danger" ? ModalButtonDanger : ModalButtonPrimary

  return (
    <ModalBackdrop onClick={handleBackdropClick}>
      <ModalContent $maxWidth={maxWidth} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalClose onClick={onClose} disabled={isLoading} aria-label="Close">
            ×
          </ModalClose>
        </ModalHeader>

        <ModalBody>{children}</ModalBody>

        <ModalActions>
          <ModalButtonSecondary onClick={onClose} disabled={isLoading}>
            {cancelText}
          </ModalButtonSecondary>
          <ConfirmButton
            onClick={onConfirm}
            disabled={isLoading || confirmDisabled}
          >
            {isLoading ? "Processing..." : confirmText}
          </ConfirmButton>
        </ModalActions>
      </ModalContent>
    </ModalBackdrop>
  )
}
