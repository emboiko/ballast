"use client"

import { ThemeProvider } from "@/contexts/ThemeContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { PaymentProvider } from "@/contexts/PaymentContext"
import { OrdersProvider } from "@/contexts/OrdersContext"
import { CatalogProvider } from "@/contexts/CatalogContext"
import { SubscriptionsProvider } from "@/contexts/SubscriptionsContext"

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <PaymentProvider>
        <OrdersProvider>
          <CatalogProvider>
            <SubscriptionsProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </SubscriptionsProvider>
          </CatalogProvider>
        </OrdersProvider>
      </PaymentProvider>
    </AuthProvider>
  )
}
