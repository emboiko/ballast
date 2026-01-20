"use client"

import AccountSidebar from "@/components/account/AccountSidebar"
import OrdersList from "@/components/account/OrdersList"
import SettingsSection from "@/components/account/SettingsSection"
import OrderDetail from "@/components/account/OrderDetail"
import {
  AccountLayout,
  AccountMain,
  AccountSection,
} from "@/components/account/accountStyles"
import { SectionHeader } from "@/components/payment/paymentStyles"
import { Card, ScrollableCard } from "@/components/ui/uiStyles"

function AccountLayoutComponent({ section = "orders", orderId = null }) {
  return (
    <AccountLayout>
      <AccountSidebar activeSection={section} />
      <AccountMain>
        {section === "orders" && orderId ? (
          <OrderDetail orderId={orderId} />
        ) : section === "orders" ? (
          <AccountSection>
            <SectionHeader>
              <h2>Order History</h2>
            </SectionHeader>
            <ScrollableCard>
              <OrdersList />
            </ScrollableCard>
          </AccountSection>
        ) : section === "settings" ? (
          <AccountSection>
            <SectionHeader>
              <h2>Settings</h2>
            </SectionHeader>
            <Card>
              <SettingsSection />
            </Card>
          </AccountSection>
        ) : null}
      </AccountMain>
    </AccountLayout>
  )
}

export default function Account({ section = "orders", orderId = null }) {
  return <AccountLayoutComponent section={section} orderId={orderId} />
}
