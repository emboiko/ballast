import styled from "styled-components"
import { scrollbarStyles } from "@/components/ui/scrollbarStyles"

export const CatalogLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const CatalogHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const CatalogTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 650;
  color: var(--text-primary);
`

export const CatalogSubtitle = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
`

export const CatalogPanel = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-primary);
  box-shadow: 0 10px 28px var(--shadow-light);
  overflow: hidden;
`

export const CatalogPanelHeader = styled.div`
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`

export const CatalogPanelTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 650;
  color: var(--text-primary);
`

export const CatalogPanelHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`

export const CatalogPanelBody = styled.div`
  padding: 1rem;
`

export const CatalogForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.875rem;
`

export const FormField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  position: relative;
`

export const FormFieldLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  position: relative;
  line-height: 1.1;
`

export const FormFieldLabel = styled.span`
  color: var(--text-secondary);
`

export const FormFieldHint = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--button-primary-bg);
  background-color: var(--status-success-bg);
  border: 1px solid var(--status-success-border);
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
  position: absolute;
  top: 50%;
  right: 5px;
  pointer-events: none;
  white-space: nowrap;
  transform: translateY(-50%);
`

export const TextInput = styled.input`
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;

  &[type="number"] {
    -moz-appearance: textfield;
  }

  &[type="number"]::-webkit-outer-spin-button,
  &[type="number"]::-webkit-inner-spin-button {
    margin: 0;
    -webkit-appearance: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  resize: vertical;
  ${scrollbarStyles()}

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
`

export const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
`

export const FormActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
`

export const FormActionsButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`

export const PrimaryButton = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--button-primary-bg);
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--button-primary-hover);
    border-color: var(--button-primary-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const SecondaryButton = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--bg-primary);
    border-color: var(--text-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const DangerButton = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--button-danger-bg);
  background-color: var(--status-error-bg);
  color: var(--button-danger-bg);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--button-danger-bg);
    border-color: var(--button-danger-bg);
    color: white;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const CatalogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const CatalogListScrollArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  padding-right: 0.35rem;
  ${scrollbarStyles({ trackColor: "var(--bg-secondary)" })}
`

export const CatalogItemCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-secondary);
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const CatalogItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`

export const CatalogItemTitle = styled.div`
  font-weight: 650;
  color: var(--text-primary);
  font-size: 0.95rem;
`

export const CatalogItemMeta = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

export const CatalogItemBadge = styled.span`
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  font-size: 0.7rem;
  font-weight: 600;

  ${(props) => {
    if (props.$variant === "active") {
      return `
        background-color: var(--status-success-bg-strong);
        color: var(--button-primary-bg);
      `
    }
    return `
      background-color: var(--status-warning-bg);
      color: var(--button-warning-bg);
    `
  }}
`

export const CatalogItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

export const EmptyState = styled.div`
  padding: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
`

export const InlineError = styled.div`
  color: var(--status-error-border);
  font-size: 0.85rem;
`

export const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

export const CatalogSearchField = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
`

export const CatalogSearchInput = styled.input`
  min-width: 220px;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.85rem;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const CatalogFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
`

export const CatalogFormSectionTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-primary);
`

export const CatalogFormSplit = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

export const CatalogDropzone = styled.div`
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
  color: var(--text-secondary);
  transition:
    border-color 0.2s,
    background-color 0.2s;
  cursor: pointer;

  ${(props) => {
    if (props.$isActive) {
      return `
        border-color: var(--button-primary-bg);
        background-color: var(--bg-tertiary);
      `
    }
    return ""
  }}

  ${(props) => {
    if (props.$isDisabled) {
      return `
        cursor: not-allowed;
        opacity: 0.6;
      `
    }
    return ""
  }}
`

export const CatalogDropzoneTitle = styled.div`
  font-weight: 600;
  color: var(--text-primary);
`

export const CatalogDropzoneHint = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`

export const CatalogImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
`

export const CatalogImageCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
`

export const CatalogImagePreview = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

export const CatalogImagePreviewButton = styled.button`
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const CatalogImageMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  min-height: 3.5rem;
  flex-shrink: 0;
`

export const CatalogImageFilename = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
`

export const CatalogImagePrimaryBadge = styled.span`
  align-self: flex-start;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background-color: var(--status-success-bg-strong);
  color: var(--button-primary-bg);
  border: 1px solid var(--status-success-border);
  flex-shrink: 0;
  height: 1.5rem;
  display: flex;
  align-items: center;
`

export const CatalogImageBadgeSpacer = styled.div`
  height: 1.5rem;
  flex-shrink: 0;
`

export const CatalogImageActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: auto;
`

export const CatalogImageActionRow = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
`

export const CatalogImageActionButton = styled.button`
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s,
    color 0.2s;

  &:hover:not(:disabled) {
    border-color: var(--text-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const CatalogImageActionButtonFull = styled(CatalogImageActionButton)`
  flex: 1;
  min-width: 0;
`

export const CatalogImageDeleteButton = styled(CatalogImageActionButton)`
  border-color: var(--button-danger-bg);
  color: var(--button-danger-bg);
  width: 100%;

  &:hover:not(:disabled) {
    background-color: var(--button-danger-bg);
    color: white;
  }
`

export const CatalogImageModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(6, 10, 22, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1.5rem;
`

export const CatalogImageModalContent = styled.div`
  max-width: min(94vw, 1120px);
  max-height: min(94vh, 820px);
  width: 100%;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  min-height: 0;
`

export const CatalogImageModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`

export const CatalogImageModalTitle = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const CatalogImageModalCloseButton = styled.button`
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const CatalogImageModalBody = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  min-height: 0;
`

export const CatalogImageModalImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`

export const FilterChip = styled.button`
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;

  ${(props) => {
    if (props.$active) {
      return `
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
        border-color: var(--text-secondary);
        font-weight: 600;
      `
    }
    return ""
  }}

  &:hover {
    background-color: var(--bg-tertiary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`
