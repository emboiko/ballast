import "@shared/styles/globals.css"
import { themeScript } from "@shared/styles/theme-script"
import { inter, jetbrainsMono } from "@shared/fonts"
import StyledComponentsRegistry from "@/styled-components-registry"
import ClientProviders from "@/components/ui/ClientProviders"
import favicon from "@shared/img/favicon.svg"

export const metadata = {
  title: "Ballast Client",
  description:
    "Client-facing webapp for payment collection, financing, and subscriptions",
  icons: {
    icon: favicon.src,
  },
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ClientProviders>{children}</ClientProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
