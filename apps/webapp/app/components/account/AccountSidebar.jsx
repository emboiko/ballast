"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import {
  AccountSidebar as StyledAccountSidebar,
  AccountNav,
  AccountNavItem,
  AccountNavItemActive,
  AccountNavItemDisabled,
  AccountSidebarFooter,
} from "@/components/account/accountStyles"
import { SectionHeader } from "@/components/payment/paymentStyles"
import { ButtonSecondary } from "@/components/ui/uiStyles"

export default function AccountSidebar({ activeSection }) {
  const { logout } = useAuth()

  return (
    <StyledAccountSidebar>
      <SectionHeader>
        <h2>Account</h2>
      </SectionHeader>
      <AccountNav>
        {activeSection === "orders" ? (
          <AccountNavItemActive as={Link} href="/account">
            Orders
          </AccountNavItemActive>
        ) : (
          <AccountNavItem as={Link} href="/account">
            Orders
          </AccountNavItem>
        )}
        <AccountNavItemDisabled title="Coming soon">
          Subscriptions
        </AccountNavItemDisabled>
        {activeSection === "financing" ? (
          <AccountNavItemActive as={Link} href="/account/financing">
            Financing
          </AccountNavItemActive>
        ) : (
          <AccountNavItem as={Link} href="/account/financing">
            Financing
          </AccountNavItem>
        )}
        {activeSection === "settings" ? (
          <AccountNavItemActive as={Link} href="/account/settings">
            Settings
          </AccountNavItemActive>
        ) : (
          <AccountNavItem as={Link} href="/account/settings">
            Settings
          </AccountNavItem>
        )}
      </AccountNav>
      <AccountSidebarFooter>
        <ButtonSecondary onClick={logout}>Log out</ButtonSecondary>
      </AccountSidebarFooter>
    </StyledAccountSidebar>
  )
}
