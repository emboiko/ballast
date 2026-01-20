import styled from "styled-components"

export const AppLayout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

export const AppHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`

export const AppTitleLink = styled.a`
  text-decoration: none;
  color: inherit;
  border-radius: 4px;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const AppTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  cursor: pointer;

  &:hover {
    color: var(--button-primary-bg);
  }
`

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

export const HeaderCartLink = styled.a`
  position: relative;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0.5rem;
  transition: opacity 0.2s;
  border-radius: 4px;

  &:hover {
    opacity: 0.8;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const CartIcon = styled.span`
  font-size: 1.25rem;
`

export const CartBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem;
`

export const UserEmail = styled.span`
  font-size: 0.875rem;
  color: var(--text-primary);
  transition: color 0.2s;
`

export const HeaderUserLink = styled.a`
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  transition: color 0.2s;
  border-radius: 4px;

  &:hover {
    ${UserEmail} {
      color: var(--link-color);
    }
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const HeaderLinkButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.5rem 0.75rem;
  transition: color 0.2s;
  border-radius: 4px;

  &:hover {
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const HeaderSuccessBanner = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: var(--status-success-bg-strong);
  border: 1px solid var(--status-success-border);
  border-radius: 6px;
`

export const HeaderSuccessMessage = styled.span`
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
`

export const HeaderSuccessDismiss = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
  border-radius: 4px;

  &:hover {
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const AppFooter = styled.footer`
  margin-top: auto;
  padding: 2rem 1rem;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
`

export const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`

export const FooterSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => (props.$isLinks ? "1.5rem" : "0")};
`

export const FooterText = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
`

export const FooterLink = styled.a`
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
  border-radius: 2px;

  &:hover {
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const Main = styled.main`
  padding: ${(props) => (props.$isFullWidth ? "0" : "2rem")};
  max-width: ${(props) => (props.$isFullWidth ? "none" : "1200px")};
  width: 100%;
  margin: ${(props) => (props.$isFullWidth ? "0" : "0 auto")};
  box-sizing: border-box;
`

export const Landing = styled.div`
  text-align: center;
  padding: 3rem 0;
`

export const LandingTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`

export const LandingDescription = styled.p`
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
`

export const LandingActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
`

export const LandingFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`

export const FeatureCard = styled.div`
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  text-align: left;

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`

export const Button = styled.a`
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: var(--button-primary-text);
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ButtonPrimary = styled(Button)`
  background-color: var(--button-primary-bg);

  &:hover {
    background-color: var(--button-primary-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ButtonSecondary = styled.button`
  padding: 0.5rem 1rem;
  cursor: pointer;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--border-color);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ButtonDanger = styled.button`
  padding: 0.5rem 1rem;
  cursor: pointer;
  background-color: var(--button-danger-bg);
  color: white;
  border: 1px solid var(--button-danger-bg);
  border-radius: 4px;
  font-size: 1rem;
  transition:
    background-color 0.2s,
    border-color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--button-danger-hover);
    border-color: var(--button-danger-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ButtonSuccess = styled(ButtonPrimary).attrs({ as: "button" })`
  background-color: var(--button-primary-bg);
  opacity: 0.8;
  cursor: not-allowed;
`

export const ButtonLarge = styled(ButtonPrimary)`
  padding: 1rem 2rem;
  font-size: 1.1rem;
`

export const ButtonSuccessLarge = styled(ButtonLarge).attrs({ as: "button" })`
  background-color: var(--button-primary-bg);
  opacity: 0.8;
  cursor: not-allowed;
`

export const DevThemeToggleContainer = styled.button`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px var(--shadow-medium);
  transition:
    background-color 0.2s,
    transform 0.2s;
  z-index: 999;

  &:hover {
    background-color: var(--bg-secondary);
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px var(--focus-ring),
      0 2px 8px var(--shadow-medium);
  }

  &:active {
    transform: scale(0.95);
  }
`

export const Card = styled.div`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  transition:
    border-color 0.2s,
    background-color 0.2s;

  h2 {
    margin-top: 0;
  }
`

export const ErrorText = styled.p`
  color: var(--error-color);
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
  align-items: stretch;
  width: 100%;

  > * {
    min-width: 0;
    width: 100%;
  }
`

export const TextSecondary = styled.p`
  color: var(--text-secondary);
`

export const TextCentered = styled.p`
  text-align: center;
  color: var(--text-secondary);
`

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
  }

  input,
  textarea {
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: box-shadow 0.2s;
    resize: vertical;
  }

  textarea {
    min-height: 80px;
  }

  input:focus:not(:disabled):not([readonly]),
  textarea:focus:not(:disabled):not([readonly]) {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  input:disabled,
  textarea:disabled {
    background-color: var(--bg-secondary);
    cursor: not-allowed;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover {
    -webkit-box-shadow: 0 0 0 1000px var(--bg-primary) inset;
    -webkit-text-fill-color: var(--text-primary);
    caret-color: var(--text-primary);
  }

  input:-webkit-autofill:focus:not(:disabled):not([readonly]) {
    -webkit-box-shadow: 0 0 0 1000px var(--bg-primary) inset;
    -webkit-text-fill-color: var(--text-primary);
    caret-color: var(--text-primary);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const FormError = styled.div`
  min-height: 1.5rem;
  color: var(--error-color);
  font-size: 0.875rem;
`

export const ContentPage = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;
`

export const ContentTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
`

export const ContentSection = styled.section`
  margin-bottom: 2.5rem;
`

export const ContentHeading = styled.h2`
  font-size: 1.75rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`

export const ContentSubheading = styled.h3`
  font-size: 1.25rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
`

export const ContentParagraph = styled.p`
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
`

export const ContentInlineLink = styled.a`
  color: var(--link-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  border-radius: 4px;

  &:hover {
    color: var(--link-hover);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ContentList = styled.ul`
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  color: var(--text-primary);
`

export const ContentListItem = styled.li`
  margin-bottom: 0.5rem;
  line-height: 1.6;
`

export const ContentOrderedList = styled.ol`
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  color: var(--text-primary);
`

export const ContentOrderedListItem = styled.li`
  margin-bottom: 0.5rem;
  line-height: 1.6;
`

export const SuccessMessage = styled(ContentParagraph)`
  color: var(--button-primary-bg);
  margin-bottom: 1rem;
`

export const FormHelpText = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
`

export const OptionalLabel = styled.span`
  color: var(--text-secondary);
`

export const ReadOnlyInput = styled.input`
  background-color: var(--bg-secondary);
  cursor: not-allowed;
`

export const Spacer = styled.div`
  height: ${(props) => props.$height || "1rem"};
  width: ${(props) => props.$width || "auto"};
`

export const ScrollableCard = styled(Card)`
  max-height: 60vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-secondary);
`

export const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem 0 0.25rem;
`

// ============================================================================
// Modal Components
// ============================================================================

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
`

export const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
`

export const ModalClose = styled.button`
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
  flex-shrink: 0;
  margin-left: 1rem;

  &:hover {
    color: var(--text-primary);
    background-color: var(--bg-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ModalBody = styled.div`
  color: var(--text-secondary);
  font-size: 0.9375rem;
  line-height: 1.5;
`

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`

export const ModalButton = styled.button`
  padding: 0.625rem 1.25rem;
  border-radius: 4px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const ModalButtonSecondary = styled(ModalButton)`
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);

  &:hover:not(:disabled) {
    background-color: var(--border-color);
  }
`

export const ModalButtonDanger = styled(ModalButton)`
  background-color: var(--button-danger-bg);
  border: 1px solid var(--button-danger-bg);
  color: white;

  &:hover:not(:disabled) {
    background-color: var(--button-danger-hover);
    border-color: var(--button-danger-hover);
  }
`
