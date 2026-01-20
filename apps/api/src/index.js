import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import { WEBAPP_URL, ADMIN_URL, PORT } from "@/constants.js"
import authRoutes from "@/routes/auth.js"
import stripeRoutes from "@/routes/stripe.js"
import ordersRoutes from "@/routes/orders.js"
import contactRoutes from "@/routes/contact.js"
import catalogRoutes from "@/routes/catalog.js"
import feesRoutes from "@/routes/fees.js"
import usersRoutes from "@/routes/users.js"
import resendWebhookRoutes from "@/routes/webhooks/resend.js"
import adminAuthRoutes from "@/routes/admin/auth.js"
import adminSearchRoutes from "@/routes/admin/search.js"
import adminUsersRoutes from "@/routes/admin/users.js"
import adminCommunicationsRoutes from "@/routes/admin/communications.js"
import adminContactSubmissionsRoutes from "@/routes/admin/contactSubmissions.js"
import adminRefundsRoutes from "@/routes/admin/refunds.js"
import adminOrdersRoutes from "@/routes/admin/orders.js"
import adminCatalogRoutes from "@/routes/admin/catalog.js"
import adminEventsRoutes from "@/routes/admin/events.js"

const app = express()

const allowedOrigins = [WEBAPP_URL, ADMIN_URL].filter(Boolean)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  })
)

// Resend webhooks require raw body for signature verification
app.use("/webhooks/resend", express.raw({ type: "application/json" }))

app.use(express.json())
app.use(cookieParser())

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "ballast-api" })
})

app.use("/webhooks/resend", resendWebhookRoutes)
app.use("/auth", authRoutes)
app.use("/payments/stripe", stripeRoutes)
app.use("/orders", ordersRoutes)
app.use("/contact", contactRoutes)
app.use("/catalog", catalogRoutes)
app.use("/fees", feesRoutes)
app.use("/users", usersRoutes)

// Admin routes
app.use("/admin/auth", adminAuthRoutes)
app.use("/admin/search", adminSearchRoutes)
app.use("/admin/users", adminUsersRoutes)
app.use("/admin/refunds", adminRefundsRoutes)
app.use("/admin/orders", adminOrdersRoutes)
app.use("/admin/communications", adminCommunicationsRoutes)
app.use("/admin/contact-submissions", adminContactSubmissionsRoutes)
app.use("/admin/catalog", adminCatalogRoutes)
app.use("/admin/events", adminEventsRoutes)

const isServerlessRuntime = Boolean(process.env.VERCEL)

if (!isServerlessRuntime) {
  app.listen(PORT, () => {
    console.info(`💸 Ballast API server listening on port ${PORT}`)
  })
}

export default app
