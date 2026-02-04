"use client"

import AccountSidebar from "@/components/account/AccountSidebar"
import OrdersList from "@/components/account/OrdersList"
import SettingsSection from "@/components/account/SettingsSection"
import OrderDetail from "@/components/account/OrderDetail"
import FinancingList from "@/components/account/FinancingList"
import FinancingDetail from "@/components/account/FinancingDetail"
import {
  AccountLayout,
  AccountMain,
  AccountSection,
} from "@/components/account/accountStyles"
import { SectionHeader } from "@/components/payment/paymentStyles"
import { Card, ScrollableCard } from "@/components/ui/uiStyles"

const renderOrdersSection = (orderId) => {
  if (orderId) {
    return <OrderDetail orderId={orderId} />
  }

  return (
    <AccountSection>
      <SectionHeader>
        <h2>Order History</h2>
      </SectionHeader>
      <ScrollableCard>
        <OrdersList />
      </ScrollableCard>
    </AccountSection>
  )
}

const renderFinancingSection = (financingPlanId) => {
  if (financingPlanId) {
    return (
      <AccountSection>
        <SectionHeader>
          <h2>Financing Details</h2>
        </SectionHeader>
        <FinancingDetail planId={financingPlanId} />
      </AccountSection>
    )
  }

  return (
    <AccountSection>
      <SectionHeader>
        <h2>Financing</h2>
      </SectionHeader>
      <ScrollableCard>
        <FinancingList />
      </ScrollableCard>
    </AccountSection>
  )
}

const renderSettingsSection = () => {
  return (
    <AccountSection>
      <SectionHeader>
        <h2>Settings</h2>
      </SectionHeader>
      <Card>
        <SettingsSection />
      </Card>
    </AccountSection>
  )
}

function AccountLayoutComponent({
  section = "orders",
  orderId = null,
  financingPlanId = null,
}) {
  let sectionContent = null

  if (section === "orders") {
    sectionContent = renderOrdersSection(orderId)
  } else if (section === "financing") {
    sectionContent = renderFinancingSection(financingPlanId)
  } else if (section === "settings") {
    sectionContent = renderSettingsSection()
  }

  return (
    <AccountLayout>
      <AccountSidebar activeSection={section} />
      <AccountMain>{sectionContent}</AccountMain>
    </AccountLayout>
  )
}

export default function Account({
  section = "orders",
  orderId = null,
  financingPlanId = null,
}) {
  return (
    <AccountLayoutComponent
      section={section}
      orderId={orderId}
      financingPlanId={financingPlanId}
    />
  )
}
