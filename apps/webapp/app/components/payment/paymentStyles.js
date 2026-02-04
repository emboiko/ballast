import styled from "styled-components"
import Link from "next/link"

export const CartContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
`

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  min-height: 2.5rem;

  h2 {
    margin: 0;
  }
`

export const LinkButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  padding: 0;
  transition: color 0.2s;
  align-self: flex-end;
  border-radius: 2px;

  &:hover {
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const EditCartLink = styled(LinkButton)`
  margin-right: 1rem;
  margin-bottom: 0.4rem;
  color: var(--link-color);

  &:hover {
    color: var(--link-hover);
  }
`

export const CartItemsArea = styled.div`
  height: 320px;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;

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
`

export const CartList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const CartEmptyItem = styled.li`
  color: var(--text-secondary);
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  list-style: none;
`

export const CartItem = styled.li`
  padding: 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  background-color: var(--bg-primary);
  transition:
    border-color 0.2s,
    background-color 0.2s;

  > div:first-child {
    flex: 1;
    min-width: 0;
  }
`

export const CartItemSummary = styled(CartItem)`
  padding: 0.75rem 1rem;
`

export const CartItemName = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const CartItemNameText = styled.span`
  color: var(--link-color);
  transition: color 0.2s;
`

export const CartItemPriceText = styled.span`
  color: var(--text-primary);
`

export const CartItemLink = styled(Link)`
  text-decoration: none;
  display: inline-block;
  border-radius: 2px;

  &:hover {
    text-decoration: none;

    ${CartItemNameText} {
      color: var(--link-hover);
      text-decoration: underline;
    }
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.875rem;
`

export const QuantityButton = styled.button`
  min-width: 2rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  font-size: 1.25rem;
  line-height: 1;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--border-color);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ButtonRemove = styled.button`
  background: none;
  border: none;
  color: var(--error-color);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-weight: bold;

  &:hover {
    background-color: var(--bg-secondary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const CartFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  width: 100%;
  box-sizing: border-box;
`

export const FeeList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`

export const FeeRow = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;
`

export const FeeLabel = styled.span`
  color: var(--text-secondary);
`

export const FeeAmount = styled.span`
  color: var(--text-primary);
  font-weight: 500;
`

export const CartTotal = styled.div`
  min-height: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
`

export const CartActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .button {
    white-space: nowrap;
    flex: 1;
    min-width: 80px;
    text-align: center;
  }

  .button-checkout {
    flex: 2;
    min-width: 120px;
  }
`

export const ButtonPayNow = styled.button`
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: var(--button-primary-text);
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.2s;
  background-color: var(--button-primary-bg);
  font-weight: 600;

  &:hover:not(:disabled) {
    background-color: var(--button-primary-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const PaymentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;

  .card {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`

export const ButtonCheckout = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--button-primary-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const CheckoutResult = styled.div`
  position: relative;
  padding: 1rem;
  padding-right: 2.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: ${(props) =>
    props.$isSuccess ? "var(--status-success-bg)" : "var(--status-error-bg)"};
  border: 1px solid
    ${(props) =>
      props.$isSuccess
        ? "var(--button-primary-bg)"
        : "var(--button-warning-bg)"};
`

export const CheckoutDismiss = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--overlay-hover-light);
  }

  [data-theme="dark"] & {
    &:hover {
      background-color: var(--overlay-hover-dark);
    }
  }
`

export const CheckoutMessage = styled.p`
  color: var(--button-primary-bg);
  font-weight: 600;
  margin: 0;
`

export const CheckoutError = styled.p`
  color: var(--button-warning-bg);
  margin: 0;
`

export const OrderId = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
`

export const OrderIdLink = styled.a`
  font-family: var(--font-mono), monospace;
  font-weight: 600;
  color: var(--button-primary-bg);
  text-decoration: none;
  transition: opacity 0.2s;
  border-radius: 2px;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const PaymentCard = styled.div`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  transition:
    border-color 0.2s,
    background-color 0.2s,
    opacity 0.15s ease;
  position: relative;

  h2 {
    margin-top: 0;
  }
`

export const UserInfoCard = styled(PaymentCard)`
  margin-bottom: 1rem;
`

export const PaymentOptionCard = styled(PaymentCard)`
  margin-bottom: 1rem;
`

export const PaymentOptionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
`

export const PaymentOptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const PaymentOptionRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  background-color: var(--bg-secondary);
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    border-color: var(--text-secondary);
  }
`

export const PaymentOptionRadio = styled.input`
  margin-top: 0.2rem;
`

export const PaymentOptionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const PaymentOptionTitle = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`

export const PaymentOptionDescription = styled.span`
  color: var(--text-secondary);
  font-size: 0.875rem;
`

export const PaymentOptionControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
`

export const PaymentOptionSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
`

export const UserInfoHeaderButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-primary);
  text-align: left;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
    border-radius: 6px;
  }
`

export const UserInfoHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const UserInfoHeaderTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`

export const UserInfoHeaderDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
`

export const UserInfoHeaderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
`

export const UserInfoBody = styled.div`
  margin-top: 0.75rem;
`

export const UserInfoSuccessBanner = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background-color: var(--status-success-bg-strong);
  color: var(--button-primary-bg);
  font-weight: 600;
  font-size: 0.75rem;
`

export const UserInfoNotice = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--button-warning-bg);
  background-color: var(--status-warning-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
`

export const OrderSuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  max-width: 500px;
  margin: 0 auto;
`

export const SuccessIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: var(--status-success-bg);
  border: 2px solid var(--button-primary-bg);
  color: var(--button-primary-bg);
  font-size: 2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
`

export const SuccessTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  color: var(--button-primary-bg);
  font-size: 1.75rem;
`

export const SuccessMessage = styled.p`
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  line-height: 1.5;
`

export const OrderIdDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 1.5rem;
`

export const OrderIdLabel = styled.span`
  color: var(--text-secondary);
  font-size: 0.875rem;
`

export const OrderIdValue = styled.a`
  font-family: var(--font-mono), monospace;
  font-weight: 600;
  color: var(--button-primary-bg);
  text-decoration: none;
  transition: opacity 0.2s;
  border-radius: 2px;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const SuccessActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 280px;
`

export const SuccessButton = styled.a`
  display: block;
  padding: 0.75rem 1.5rem;
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--button-primary-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const SuccessButtonSecondary = styled.a`
  display: block;
  padding: 0.75rem 1.5rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  text-decoration: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
  transition:
    background-color 0.2s,
    border-color 0.2s;

  &:hover {
    background-color: var(--border-color);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`
