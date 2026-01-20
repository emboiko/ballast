import styled from "styled-components"
import Link from "next/link"
import { scrollbarStyles } from "@/components/ui/scrollbarStyles"

// ============================================================================
// Main Layout
// ============================================================================

export const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background-color: var(--bg-primary);
`

export const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`

export const Content = styled.div`
  flex: 1;
  padding: 1.5rem 2rem;
  overflow-y: auto;
  scrollbar-gutter: stable;
`

// ============================================================================
// Header
// ============================================================================

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 2rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  min-height: 60px;
  position: sticky;
  top: 0;
  z-index: 900;
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const getSidebarToggleLayoutStyles = (isCollapsed) => {
  if (isCollapsed) {
    return `
  padding: 0 8px 0 14px;
  margin-left: calc(-2rem - 1px);
  border-left: none;
  border-right: 1px solid var(--border-color);
  border-radius: 0 999px 999px 0;

  &::before {
    left: 6px;
    right: auto;
    box-shadow: 3px 0 0 var(--border-color);
  }
    `
  }

  return `
  padding: 0 14px 0 8px;
  margin-left: calc(-2rem - 26px);
  border-right: none;
  border-left: 1px solid var(--border-color);
  border-radius: 999px 0 0 999px;

  &::before {
    left: auto;
    right: 6px;
    box-shadow: -3px 0 0 var(--border-color);
  }
  `
}

export const SidebarToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 34px;
  ${(props) => getSidebarToggleLayoutStyles(props.$isCollapsed)}
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;
  position: relative;

  &:hover {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border-color: var(--text-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 14px;
    border-radius: 999px;
    background-color: var(--border-color);
  }
`

export const HeaderSearchWrapper = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
`

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

// ============================================================================
// Sidebar
// ============================================================================

export const SidebarContainer = styled.aside`
  width: ${(props) => (props.$isCollapsed ? "60px" : "240px")};
  min-width: ${(props) => (props.$isCollapsed ? "60px" : "240px")};
  height: 100vh;
  position: sticky;
  top: 0;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  transition:
    width 0.2s ease,
    min-width 0.2s ease;
  overflow: hidden;
`

export const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  height: 60px;
  padding: 0 1rem;
  border-bottom: 1px solid var(--border-color);
  min-height: 60px;
`

export const SidebarLogoLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
  border-radius: 6px;
  overflow: hidden;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
`

export const LogoIcon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`

export const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  opacity: ${(props) => (props.$isCollapsed ? "0" : "1")};
  transition: opacity 0.2s;
`

export const SidebarNav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 0.5rem;
  gap: 0.25rem;
  overflow-y: auto;
  scrollbar-gutter: stable;
  ${scrollbarStyles({ trackColor: "var(--bg-secondary)" })}
`

export const NavItem = styled.a`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  gap: ${(props) => (props.$isCollapsed ? "0" : "0.75rem")};
  padding: 0.75rem;
  border-radius: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  transition:
    background-color 0.2s,
    color 0.2s;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const NavItemActive = styled(NavItem)`
  background-color: var(--bg-primary);
  color: var(--button-primary-bg);
  font-weight: 500;
`

export const NavIcon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
`

export const NavLabel = styled.span`
  display: ${(props) => (props.$isCollapsed ? "none" : "inline")};
`

export const SidebarFooter = styled.div`
  padding: ${(props) => (props.$isCollapsed ? "0.5rem" : "1rem")};
  border-top: 1px solid var(--border-color);
`

export const SidebarBottomButtons = styled.div`
  display: flex;
  flex-direction: ${(props) => (props.$isCollapsed ? "column" : "row")};
  gap: 0.5rem;
  margin-top: 0.5rem;
`

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 4px;
  overflow: hidden;
`

export const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
`

export const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
  opacity: ${(props) => (props.$isCollapsed ? "0" : "1")};
  transition: opacity 0.2s;
`

export const UserEmail = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const UserRole = styled.div`
  font-size: 0.625rem;
  color: var(--button-primary-bg);
  text-transform: uppercase;
  font-weight: 600;
`

export const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  gap: ${(props) => (props.$isCollapsed ? "0" : "0.75rem")};
  ${"" /* width: 100%; */}
  flex: ${(props) => (props.$isCollapsed ? "0 0 auto" : "1 1 auto")};
  padding: 0.75rem;
  background: none;
  border: ${(props) =>
    props.$isCollapsed ? "none" : "1px solid var(--border-color)"};
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background-color: var(--status-error-bg);
    color: var(--button-danger-bg);
    border-color: var(--button-danger-bg);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ThemeToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  ${"" /* width: ${(props) => (props.$isCollapsed ? "100%" : "44px")}; */}
  ${"" /* min-width: ${(props) => (props.$isCollapsed ? "auto" : "44px")}; */}
  flex: ${(props) => (props.$isCollapsed ? "0 0 auto" : "0 0 auto")};
  padding: 0.75rem;
  background: none;
  border: ${(props) =>
    props.$isCollapsed ? "none" : "1px solid var(--border-color)"};
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border-color: var(--text-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

// ============================================================================
// Page Components
// ============================================================================

export const PageHeader = styled.div`
  margin-bottom: 1.5rem;
`

export const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`

export const PageSubtitle = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0 0;
`

// ============================================================================
// Section nav
// ============================================================================

export const SectionNavContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

export const SectionNavHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-width: 0;
`

export const SectionNavTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`

export const SectionNavTitle = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 650;
  color: var(--text-primary);
  line-height: 1.1;
`

export const SectionNavSubtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const SectionNavRow = styled.nav`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

export const SectionNavLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;

  &:hover {
    background-color: var(--bg-secondary);
    border-color: var(--text-secondary);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const SectionNavLinkActive = styled(SectionNavLink)`
  background-color: var(--status-success-bg-strong);
  border-color: var(--status-success-border);
  color: var(--button-primary-bg);
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
  max-width: ${(props) => props.$maxWidth || "450px"};
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

export const ModalButtonPrimary = styled(ModalButton)`
  background-color: var(--button-primary-bg);
  border: 1px solid var(--button-primary-bg);
  color: var(--button-primary-text);

  &:hover:not(:disabled) {
    background-color: var(--button-primary-hover);
    border-color: var(--button-primary-hover);
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

export const ModalWarning = styled.div`
  background-color: var(--status-warning-bg);
  border: 1px solid var(--status-warning-border);
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-primary);
`

export const ModalDangerWarning = styled.div`
  background-color: var(--status-error-bg);
  border: 1px solid var(--status-error-border);
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-primary);
`

export const ModalInput = styled.input`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9375rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ModalCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin-top: 1rem;

  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  }
`

// ============================================================================
// Toasts
// ============================================================================

export const ToastViewportContainer = styled.div`
  position: fixed;
  z-index: 1100;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: min(420px, calc(100vw - 2rem));
`

export const ToastViewportTopLeft = styled(ToastViewportContainer)`
  top: 1rem;
  left: 1rem;
  align-items: flex-start;
`

export const ToastViewportTopRight = styled(ToastViewportContainer)`
  top: 1rem;
  right: 1rem;
  align-items: flex-end;
`

export const ToastViewportBottomLeft = styled(ToastViewportContainer)`
  bottom: 1rem;
  left: 1rem;
  align-items: flex-start;
  flex-direction: column-reverse;
`

export const ToastViewportBottomRight = styled(ToastViewportContainer)`
  bottom: 1rem;
  right: 1rem;
  align-items: flex-end;
  flex-direction: column-reverse;
`

export const ToastItem = styled.div`
  pointer-events: auto;
  position: relative;
  width: 100%;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 10px 28px var(--shadow-medium);
  padding: 0.75rem 0.875rem;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background-color: var(--border-color);
  }

  ${(props) => {
    if (props.$variant === "success") {
      return `
        background-color: var(--status-success-bg-strong);
        border-color: var(--status-success-border);
      `
    }
    if (props.$variant === "warning") {
      return `
        background-color: var(--status-warning-bg);
        border-color: var(--status-warning-border);
      `
    }
    if (props.$variant === "error") {
      return `
        background-color: var(--status-error-bg-strong);
        border-color: var(--status-error-border);
      `
    }
    if (props.$variant === "info") {
      return `
        background-color: var(--status-info-bg);
        border-color: var(--status-info-border);
      `
    }
    return ""
  }}

  ${(props) => {
    if (props.$variant === "success") {
      return `
        &::before { background-color: var(--button-primary-bg); }
      `
    }
    if (props.$variant === "warning") {
      return `
        &::before { background-color: var(--button-warning-bg); }
      `
    }
    if (props.$variant === "error") {
      return `
        &::before { background-color: var(--button-danger-bg); }
      `
    }
    if (props.$variant === "info") {
      return `
        &::before { background-color: var(--text-secondary); }
      `
    }
    return `
      &::before { background-color: var(--text-secondary); }
    `
  }}
`

export const ToastRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`

export const ToastMessage = styled.div`
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.35;
  word-break: break-word;
`

export const ToastCloseButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover {
    background-color: var(--overlay-hover-light);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`
