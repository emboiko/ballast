"use client"

import { ThemeProvider } from "@/contexts/ThemeContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { PaymentProvider } from "@/contexts/PaymentContext"
import { OrdersProvider } from "@/contexts/OrdersContext"
import { CatalogProvider } from "@/contexts/CatalogContext"

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <PaymentProvider>
        <OrdersProvider>
          <CatalogProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </CatalogProvider>
        </OrdersProvider>
      </PaymentProvider>
    </AuthProvider>
  )
}
