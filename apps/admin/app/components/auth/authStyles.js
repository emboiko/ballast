import styled from "styled-components"

export const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
`

export const LoginCard = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`

export const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`

export const LoginTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
`

export const LoginSubtitle = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
`

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`

export const FormInput = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: var(--button-primary-bg);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`

export const SubmitButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--button-primary-text);
  background-color: var(--button-primary-bg);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;

  &:hover:not(:disabled) {
    background-color: var(--button-primary-hover);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const OAuthDivider = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.75rem;
  margin: 1.25rem 0 1rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const OAuthDividerLine = styled.span`
  height: 1px;
  background-color: var(--border-color);
`

export const OAuthDividerText = styled.span`
  white-space: nowrap;
`

export const OAuthButton = styled.button`
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    transform 0.1s;

  &:hover:not(:disabled) {
    background-color: var(--bg-tertiary);
    border-color: var(--button-primary-bg);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const LoadingState = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 1rem;
`
