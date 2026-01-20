import styled from "styled-components"

export const UserInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const UserInfoHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const UserInfoTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`

export const UserInfoDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const UserInfoFormLayout = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const UserInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

export const UserInfoFieldWrapper = styled.div`
  min-width: 0;

  ${(props) => {
    if (props.$span) {
      return `
        grid-column: span ${props.$span};
      `
    }
    return ""
  }}
`

export const UserInfoActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`

export const UserInfoHelperText = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const UserInfoSuccessText = styled.span`
  font-size: 0.875rem;
  color: var(--button-primary-bg);
  font-weight: 600;
`

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 1.25rem;

  label {
    line-height: 1.2;
  }
`

export const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`

export const TooltipIcon = styled.button`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const TooltipText = styled.span`
  visibility: hidden;
  opacity: 0;
  position: absolute;
  z-index: 5;
  top: 120%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  width: 240px;
  font-size: 0.75rem;
  line-height: 1.4;
  transition: opacity 0.2s;
  pointer-events: none;

  ${TooltipWrapper}:hover &,
  ${TooltipWrapper}:focus-within & {
    visibility: visible;
    opacity: 1;
  }
`

export const RequiredIndicator = styled.span`
  color: var(--error-color);
  margin-left: 0.25rem;
`
