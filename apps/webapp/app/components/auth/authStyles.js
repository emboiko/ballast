import styled from "styled-components"

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: var(--backdrop-color);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

export const ModalContent = styled.div`
  position: relative;
  background-color: var(--bg-primary);
  border-radius: 8px;
  max-width: 450px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px var(--shadow-color);
  padding: 1.5rem;

  .auth-form-container {
    margin: 0;
    border: none;
    background: transparent;
    padding: 0;
  }
`

export const ModalClose = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition:
    color 0.2s,
    background-color 0.2s;

  &:hover {
    color: var(--text-primary);
    background-color: var(--bg-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const AuthFormContainer = styled.div`
  margin: 0 auto;
  padding: 0;
  border: none;
  border-radius: 0;
  background-color: transparent;

  h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    text-align: center;
  }
`

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  button[type="submit"] {
    margin-top: 0.5rem;
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
    background-color: var(--bg-secondary);
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

export const AuthSwitch = styled.p`
  margin-top: 1.5rem;
  margin-bottom: 0;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
`

export const AuthMessage = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
`

export const ResetPasswordContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 200px);
  padding: 2rem 1rem;

  .auth-form-container {
    max-width: 400px;
    width: 100%;
  }
`

export const AuthRequired = styled.div`
  text-align: center;
  padding: 2rem;
`

export const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`

export const VerificationMessage = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`

export const EmailHighlight = styled.p`
  font-weight: bold;
  color: var(--button-primary-bg);
  margin: 0.5rem 0;
`

export const VerificationActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`

export const InfoText = styled.div`
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1rem;
`

export const Centered = styled.div`
  margin: 0 auto;
`

export const TurnstileContainer = styled.div`
  margin-top: 5px;
  margin: 0 auto;

  > div {
    outline: none;
  }
`

export const LoginButton = styled.button`
  margin-top: 10px;
`

export const LinkButton = styled.button`
  background: none;
  border: none;
  color: var(--button-primary-bg);
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  padding: 0;
  border-radius: 2px;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`
