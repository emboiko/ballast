"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { usePayment } from "@/contexts/PaymentContext"
import {
  AppHeader,
  HeaderLeft,
  AppTitleLink,
  AppTitle,
  HeaderActions,
  HeaderCartLink,
  CartIcon,
  CartBadge,
  HeaderUserLink,
  UserEmail,
  HeaderLinkButton,
  HeaderSuccessBanner,
  HeaderSuccessMessage,
  HeaderSuccessDismiss,
} from "@/components/ui/uiStyles"

export default function Header() {
  const {
    user,
    isAuthenticated,
    openAuthModal,
    successMessage,
    dismissSuccessMessage,
  } = useAuth()
  const { cart } = usePayment()

  const cartItemCount = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  )

  const handleSignInClick = () => {
    openAuthModal("/account")
  }

  return (
    <AppHeader>
      <HeaderLeft>
        <AppTitleLink as={Link} href="/">
          <AppTitle>💸 Ballast</AppTitle>
        </AppTitleLink>
      </HeaderLeft>

      {successMessage && (
        <HeaderSuccessBanner>
          <HeaderSuccessMessage>{successMessage}</HeaderSuccessMessage>
          <HeaderSuccessDismiss
            onClick={dismissSuccessMessage}
            aria-label="Dismiss"
          >
            ×
          </HeaderSuccessDismiss>
        </HeaderSuccessBanner>
      )}

      <HeaderActions>
        <HeaderCartLink
          as={Link}
          href="/cart"
          aria-label={`Cart with ${cartItemCount} items`}
        >
          <CartIcon>🛒</CartIcon>
          {cartItemCount > 0 && <CartBadge>{cartItemCount}</CartBadge>}
        </HeaderCartLink>

        {isAuthenticated ? (
          <HeaderUserLink as={Link} href="/account">
            <UserEmail>{user.email}</UserEmail>
          </HeaderUserLink>
        ) : (
          <HeaderLinkButton onClick={handleSignInClick}>
            Sign In
          </HeaderLinkButton>
        )}
      </HeaderActions>
    </AppHeader>
  )
}
