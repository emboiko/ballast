import {
  ADMIN_AUTH_COOKIE_NAME,
  verifyToken,
  clearAdminAuthCookie,
} from "@/lib/jwt.js"
import prisma from "@ballast/shared/src/db/client.js"

/**
 * Middleware to verify JWT token and require admin privileges
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const requireAdmin = async (req, res, next) => {
  const token = req.cookies?.[ADMIN_AUTH_COOKIE_NAME]

  if (!token) {
    return res.status(401).json({ error: "Authentication required" })
  }

  const payload = verifyToken(token)
  if (!payload) {
    clearAdminAuthCookie(res)
    return res.status(401).json({ error: "Invalid or expired token" })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      authProvider: true,
      isAdmin: true,
      createdAt: true,
      archivedAt: true,
      bannedAt: true,
      tokensInvalidBefore: true,
    },
  })

  if (!user) {
    clearAdminAuthCookie(res)
    return res.status(401).json({ error: "User not found" })
  }

  if (user.bannedAt) {
    clearAdminAuthCookie(res)
    return res.status(403).json({ error: "This account has been banned" })
  }

  if (user.tokensInvalidBefore && typeof payload.iat === "number") {
    const issuedAt = new Date(payload.iat * 1000)
    if (issuedAt < user.tokensInvalidBefore) {
      clearAdminAuthCookie(res)
      return res.status(401).json({ error: "Session expired" })
    }
  }

  if (user.archivedAt) {
    clearAdminAuthCookie(res)
    return res.status(401).json({ error: "Account has been deactivated" })
  }

  if (!user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" })
  }

  req.user = user
  next()
}
