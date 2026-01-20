import styled from "styled-components"

export const AccountLayout = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
`

export const AccountSidebar = styled.div`
  max-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const AccountNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const AccountNavItem = styled.a`
  padding: 0.75rem 1rem;
  border-radius: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover:not(.disabled) {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const AccountNavItemActive = styled(AccountNavItem)`
  background-color: var(--bg-secondary);
  color: var(--button-primary-bg);
  font-weight: 600;
`

export const AccountNavItemDisabled = styled.span`
  padding: 0.75rem 1rem;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.5;
`

export const AccountSidebarFooter = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;

  button {
    width: 100%;
  }
`

export const AccountMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

export const AccountSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const OrdersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const OrderItem = styled.li`
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
`

export const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`

export const OrderIdLink = styled.a`
  font-weight: 600;
  font-family: var(--font-mono), monospace;
  color: var(--link-color);
  text-decoration: none;
  transition: color 0.2s;
  border-radius: 2px;

  &:hover {
    color: var(--link-hover);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const OrderStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${(props) => {
    if (props.$status === "succeeded") {
      return "var(--status-success-bg-strong)"
    }
    if (props.$status === "pending") {
      return "var(--status-warning-bg)"
    }
    if (props.$status === "failed") {
      return "var(--status-error-bg-strong)"
    }
    return "var(--bg-secondary)"
  }};
  color: ${(props) => {
    if (props.$status === "succeeded") {
      return "var(--button-primary-bg)"
    }
    if (props.$status === "pending") {
      return "var(--button-warning-bg)"
    }
    if (props.$status === "failed") {
      return "var(--button-danger-bg)"
    }
    return "var(--text-primary)"
  }};
`

export const OrderDetails = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 0.9rem;
`

export const OrderAmount = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`

export const OrderDate = styled.span`
  color: var(--text-secondary);
  font-size: 0.875rem;
`

export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;

  .button {
    margin-top: 1rem;
  }
`

export const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const SettingsItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  opacity: ${(props) => (props.$disabled ? "0.6" : "1")};
`

export const SettingsItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const SettingsItemLabel = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`

export const SettingsItemDescription = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const VerificationStatus = styled.span`
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  background-color: ${(props) =>
    props.$verified
      ? "var(--status-success-bg-strong)"
      : "var(--status-warning-bg)"};
  color: ${(props) =>
    props.$verified ? "var(--button-primary-bg)" : "var(--button-warning-bg)"};
`

export const ComingSoonBadge = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`

export const SettingsDivider = styled.div`
  height: 1px;
  background-color: var(--border-color);
  margin: 0.5rem 0;
`

export const CollapsibleSection = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  overflow: hidden;
`

export const CollapsibleHeader = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: var(--text-primary);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--bg-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const CollapsibleHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const CollapsibleTitle = styled.span`
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
`

export const CollapsibleDescription = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const CollapsibleIcon = styled.span`
  font-size: 1.25rem;
  color: var(--text-secondary);
  font-weight: bold;
`

export const CollapsibleContentWrapper = styled.div`
  display: grid;
  grid-template-rows: ${(props) => (props.$isOpen ? "1fr" : "0fr")};
  transition: grid-template-rows 0.2s ease-out;
`

export const CollapsibleContent = styled.div`
  overflow: hidden;
`

export const CollapsibleContentInner = styled.div`
  border-top: 1px solid var(--border-color);
  padding: 1rem;
  background-color: var(--bg-primary);
`

export const CollapsibleForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  button[type="submit"] {
    align-self: center;
  }
`

export const SettingsFormDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
`

export const OrderDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

export const OrderDetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const OrderDetailSectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`

export const OrderDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`

export const OrderDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const OrderDetailLabel = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
`

export const OrderDetailValue = styled.span`
  font-size: 1rem;
  color: var(--text-primary);
  word-break: break-word;
  overflow-wrap: break-word;
`

export const OrderIdValue = styled(OrderDetailValue)`
  font-family: var(--font-mono), monospace;
  font-size: 0.9375rem;
  letter-spacing: 0.025em;
`

export const RefundStatusBadge = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const RefundStatus = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
  background-color: ${(props) => {
    if (props.$status === "pending") {
      return "var(--status-warning-bg)"
    }
    if (props.$status === "approved") {
      return "var(--status-success-bg-strong)"
    }
    if (props.$status === "rejected") {
      return "var(--status-error-bg-strong)"
    }
    return "var(--bg-secondary)"
  }};
  color: ${(props) => {
    if (props.$status === "pending") {
      return "var(--button-warning-bg)"
    }
    if (props.$status === "approved") {
      return "var(--button-primary-bg)"
    }
    if (props.$status === "rejected") {
      return "var(--button-danger-bg)"
    }
    return "var(--text-primary)"
  }};
`

export const RefundStatusMessage = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
`

export const RefundsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const RefundItem = styled.li`
  padding: 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
`

export const RefundItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`

export const RefundAmount = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`

export const RefundDate = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const RefundReason = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-style: italic;
`

export const PaymentMethodInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
`

export const PaymentMethodDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const PaymentMethodCard = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-mono), monospace;
`

export const PaymentMethodExpiry = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const ProcessorBadge = styled.span`
  padding: 0.375rem 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
`

export const OrderItemsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-primary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
`

export const OrderItemsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

export const OrderItemRow = styled.li`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
`

export const OrderItemThumbnail = styled.div`
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const OrderItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border-color);
`

export const OrderItemPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1.5rem;
`

export const OrderItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
`

export const OrderItemName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
`

export const OrderItemMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const OrderItemPrice = styled.span`
  font-weight: 500;
`

export const OrderItemQuantity = styled.span`
  color: var(--text-secondary);
`
