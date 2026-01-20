"use client"

import PageLayout from "@/components/ui/PageLayout"
import SectionNav from "@/components/ui/SectionNav"
import {
  LandingPanelBody,
  Panel,
  PanelHeader,
  PanelHeaderLeft,
  PanelTitle,
} from "@/components/communications/communicationsStyles"

export default function CommunicationsSmsPage() {
  return (
    <PageLayout>
      <SectionNav
        title="Communications"
        subtitle="SMS"
        links={[
          { href: "/communications/email", title: "Email", isActive: false },
          {
            href: "/communications/contact",
            title: "Contact",
            isActive: false,
          },
          { href: "/communications/sms", title: "SMS", isActive: true },
        ]}
      />

      <Panel>
        <PanelHeader>
          <PanelHeaderLeft>
            <PanelTitle>SMS</PanelTitle>
          </PanelHeaderLeft>
        </PanelHeader>
        <LandingPanelBody>SMS support is coming soon.</LandingPanelBody>
      </Panel>
    </PageLayout>
  )
}
