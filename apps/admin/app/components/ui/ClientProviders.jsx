"use client"

import { ThemeProvider } from "@/contexts/ThemeContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { SearchProvider } from "@/contexts/SearchContext"
import { CommunicationsProvider } from "@/contexts/CommunicationsContext"
import { ContactSubmissionsProvider } from "@/contexts/ContactSubmissionsContext"
import { RefundsProvider } from "@/contexts/RefundsContext"
import { OrdersProvider } from "@/contexts/OrdersContext"
import { CatalogProvider } from "@/contexts/CatalogContext"
import { ToastProvider } from "@/contexts/ToastContext"
import { EventsProvider } from "@/contexts/EventsContext"
import { JobsProvider } from "@/contexts/JobsContext"
import ToastViewport from "@/components/ui/ToastViewport"

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <SearchProvider>
        <ThemeProvider>
          <CommunicationsProvider>
            <ContactSubmissionsProvider>
              <RefundsProvider>
                <OrdersProvider>
                  <CatalogProvider>
                    <EventsProvider>
                      <JobsProvider>
                        <ToastProvider>
                          <ToastViewport />
                          {children}
                        </ToastProvider>
                      </JobsProvider>
                    </EventsProvider>
                  </CatalogProvider>
                </OrdersProvider>
              </RefundsProvider>
            </ContactSubmissionsProvider>
          </CommunicationsProvider>
        </ThemeProvider>
      </SearchProvider>
    </AuthProvider>
  )
}
