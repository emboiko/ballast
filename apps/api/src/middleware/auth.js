import {
  WEB_AUTH_COOKIE_NAME,
  verifyToken,
  clearWebAuthCookie,
} from "@/lib/jwt.js"
import prisma from "@ballast/shared/src/db/client.js"
import { userInfoSelectFields } from "@/lib/userInfo.js"

/**
 * Middleware to verify JWT token and attach user to request
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const requireAuth = async (req, res, next) => {
  const token = req.cookies?.[WEB_AUTH_COOKIE_NAME]

  if (!token) {
    return res.status(401).json({ error: "Authentication required" })
  }

  const payload = verifyToken(token)
  if (!payload) {
    clearWebAuthCookie(res)
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
      stripeCustomerId: true,
      createdAt: true,
      archivedAt: true,
      bannedAt: true,
      tokensInvalidBefore: true,
      ...userInfoSelectFields,
    },
  })

  if (!user) {
    clearWebAuthCookie(res)
    return res.status(401).json({ error: "User not found" })
  }

  if (user.bannedAt) {
    clearWebAuthCookie(res)
    return res.status(403).json({ error: "This account has been banned" })
  }

  if (user.tokensInvalidBefore && typeof payload.iat === "number") {
    const issuedAt = new Date(payload.iat * 1000)
    if (issuedAt < user.tokensInvalidBefore) {
      clearWebAuthCookie(res)
      return res.status(401).json({ error: "Session expired" })
    }
  }

  if (user.archivedAt) {
    clearWebAuthCookie(res)
    return res.status(401).json({ error: "Account has been deactivated" })
  }

  req.user = user
  next()
}

/**
 * Middleware that optionally verifies JWT token and attaches user to request
 * Does not fail if no token is provided (for anonymous access)
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.[WEB_AUTH_COOKIE_NAME]

  if (!token) {
    return next()
  }

  const payload = verifyToken(token)
  if (!payload) {
    clearWebAuthCookie(res)
    return next()
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      authProvider: true,
      isAdmin: true,
      stripeCustomerId: true,
      createdAt: true,
      archivedAt: true,
      bannedAt: true,
      tokensInvalidBefore: true,
      ...userInfoSelectFields,
    },
  })

  if (!user) {
    clearWebAuthCookie(res)
    return next()
  }

  if (user.bannedAt) {
    clearWebAuthCookie(res)
    return next()
  }

  if (user.tokensInvalidBefore && typeof payload.iat === "number") {
    const issuedAt = new Date(payload.iat * 1000)
    if (issuedAt < user.tokensInvalidBefore) {
      clearWebAuthCookie(res)
      return next()
    }
  }

  if (!user.archivedAt) {
    req.user = user
  } else {
    clearWebAuthCookie(res)
  }

  next()
}

/**
 * Middleware that requires user to have verified email
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const requireVerified = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" })
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({ error: "Email verification required" })
  }

  next()
}
