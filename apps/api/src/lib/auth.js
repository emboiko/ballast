import bcrypt from "bcryptjs"
import crypto from "crypto"
import prisma from "@ballast/shared/src/db/client.js"
import { BCRYPT_SALT_ROUNDS } from "@/constants.js"
import { verifyTurnstile } from "@/gateways/turnstileGateway.js"
import {
  sendWelcomeEmail,
  sendEmailChangeVerification,
  sendPasswordChangedNotification,
  sendPasswordResetEmail,
} from "@/gateways/emailGateway.js"
import { recordSystemEvent } from "@/lib/systemEvents.js"

const isGoogleAuthUser = (user) => {
  if (!user) {
    return false
  }

  if (user.authProvider === "GOOGLE") {
    return true
  }

  return false
}

const toAuthUserResponse = (user) => {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    authProvider: user.authProvider,
    fullName: user.fullName || null,
    phoneNumber: user.phoneNumber || null,
    billingAddressLine1: user.billingAddressLine1 || null,
    billingAddressLine2: user.billingAddressLine2 || null,
    billingCity: user.billingCity || null,
    billingRegion: user.billingRegion || null,
    billingPostalCode: user.billingPostalCode || null,
    billingCountry: user.billingCountry || null,
  }
}

/**
 * Sign up a new user
 * @param {string} email
 * @param {string} password
 * @param {string} turnstileToken
 * @param {string} ip
 * @returns {Promise<{ success: boolean, user?: { id: string, email: string, emailVerified: boolean }, error?: string }>}
 */
export const signup = async (email, password, turnstileToken, ip) => {
  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters",
    }
  }

  const isValidTurnstile = await verifyTurnstile(turnstileToken, ip)
  if (!isValidTurnstile) {
    return { success: false, error: "Invalid captcha verification" }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (existingUser) {
    return { success: false, error: "Email already registered" }
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
    },
  })

  await recordSystemEvent({
    eventType: "user.created",
    entityType: "user",
    entityId: user.id,
    payload: {
      email: user.email,
      authProvider: "LOCAL",
    },
  })

  const verificationToken = crypto.randomBytes(32).toString("hex")
  await prisma.verificationToken.create({
    data: {
      token: verificationToken,
      userId: user.id,
      type: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  await sendWelcomeEmail(user.email, verificationToken)

  return {
    success: true,
    user: toAuthUserResponse({
      ...user,
      emailVerified: false,
      authProvider: "LOCAL",
    }),
  }
}

/**
 * Log in a user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: { id: string, email: string, emailVerified: boolean }, error?: string, emailVerified?: boolean, banned?: boolean }>}
 */
export const login = async (email, password) => {
  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user) {
    return { success: false, error: "Invalid email or password" }
  }

  if (isGoogleAuthUser(user)) {
    return {
      success: false,
      error: "This account uses Google sign-in. Please log in with Google.",
    }
  }

  if (!user.passwordHash) {
    return { success: false, error: "Invalid email or password" }
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash)
  if (!isValidPassword) {
    return { success: false, error: "Invalid email or password" }
  }

  if (user.bannedAt) {
    return {
      success: false,
      banned: true,
      error: "This account has been banned.",
    }
  }

  if (user.archivedAt) {
    return {
      success: false,
      error: "This account has been deactivated. Please contact support.",
    }
  }

  if (!user.emailVerified) {
    return {
      success: false,
      error: "Please verify your email before logging in",
      emailVerified: false,
    }
  }

  return {
    success: true,
    user: toAuthUserResponse(user),
  }
}

/**
 * Log in or create a user via Google OAuth
 * @param {string} email
 * @param {string} googleSubject
 * @returns {Promise<{ success: boolean, user?: { id: string, email: string, emailVerified: boolean, authProvider: string, isAdmin: boolean }, error?: string, errorCode?: string }>}
 */
export const loginWithGoogle = async (email, googleSubject) => {
  if (!email || !googleSubject) {
    return {
      success: false,
      error: "Google profile is incomplete",
      errorCode: "google_profile_incomplete",
    }
  }

  const normalizedEmail = email.toLowerCase()

  const userBySubject = await prisma.user.findUnique({
    where: { googleSubject },
  })

  if (userBySubject) {
    if (userBySubject.bannedAt) {
      return {
        success: false,
        error: "This account has been banned.",
        errorCode: "account_banned",
      }
    }

    if (userBySubject.archivedAt) {
      return {
        success: false,
        error: "This account has been deactivated. Please contact support.",
        errorCode: "account_archived",
      }
    }

    if (!isGoogleAuthUser(userBySubject)) {
      return {
        success: false,
        error: "Invalid account provider",
        errorCode: "auth_provider_mismatch",
      }
    }

    return {
      success: true,
      user: {
        ...toAuthUserResponse(userBySubject),
        isAdmin: userBySubject.isAdmin,
      },
    }
  }

  const userByEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (userByEmail) {
    if (!isGoogleAuthUser(userByEmail)) {
      return {
        success: false,
        error: "This email is already registered. Please log in normally.",
        errorCode: "google_email_in_use",
      }
    }

    if (userByEmail.bannedAt) {
      return {
        success: false,
        error: "This account has been banned.",
        errorCode: "account_banned",
      }
    }

    if (userByEmail.archivedAt) {
      return {
        success: false,
        error: "This account has been deactivated. Please contact support.",
        errorCode: "account_archived",
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userByEmail.id },
      data: { googleSubject },
    })

    return {
      success: true,
      user: {
        ...toAuthUserResponse(updatedUser),
        isAdmin: updatedUser.isAdmin,
      },
    }
  }

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      authProvider: "GOOGLE",
      googleSubject,
      emailVerified: true,
      passwordHash: null,
    },
  })

  await recordSystemEvent({
    eventType: "user.created",
    entityType: "user",
    entityId: newUser.id,
    payload: {
      email: newUser.email,
      authProvider: "GOOGLE",
    },
  })

  return {
    success: true,
    user: {
      ...toAuthUserResponse(newUser),
      isAdmin: newUser.isAdmin,
    },
  }
}

/**
 * Verify email address with token
 * @param {string} token
 * @returns {Promise<{ success: boolean, user?: { id: string, email: string }, error?: string }>}
 */
export const verifyEmail = async (token) => {
  if (!token) {
    return { success: false, error: "missing_token" }
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    return { success: false, error: "invalid_token" }
  }

  if (verificationToken.type !== "EMAIL_VERIFICATION") {
    return { success: false, error: "invalid_token" }
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })
    return { success: false, error: "expired_token" }
  }

  const user = await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerified: true },
  })

  await prisma.verificationToken.deleteMany({
    where: { userId: verificationToken.userId, type: "EMAIL_VERIFICATION" },
  })

  return {
    success: true,
    user: { id: user.id, email: user.email },
  }
}

/**
 * Verify email change with token
 * @param {string} token
 * @returns {Promise<{ success: boolean, user?: { id: string, email: string }, error?: string }>}
 */
export const verifyEmailChange = async (token) => {
  if (!token) {
    return { success: false, error: "missing_token" }
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    return { success: false, error: "invalid_token" }
  }

  if (
    verificationToken.type !== "EMAIL_CHANGE" ||
    !verificationToken.newEmail
  ) {
    return { success: false, error: "invalid_token" }
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })
    return { success: false, error: "expired_token" }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: verificationToken.newEmail.toLowerCase() },
  })

  if (existingUser && existingUser.id !== verificationToken.userId) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })
    return { success: false, error: "email_taken" }
  }

  const user = await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { email: verificationToken.newEmail.toLowerCase() },
  })

  await prisma.verificationToken.deleteMany({
    where: { userId: verificationToken.userId, type: "EMAIL_CHANGE" },
  })

  return {
    success: true,
    user: { id: user.id, email: user.email },
  }
}

/**
 * Resend verification email
 * @param {string} email
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const resendVerification = async (email) => {
  if (!email) {
    return {
      success: false,
      message: "Email is required",
    }
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user) {
    return {
      success: true,
      message: "If that email exists, a verification link has been sent.",
    }
  }

  if (user.emailVerified) {
    return { success: true, message: "Email is already verified" }
  }

  await prisma.verificationToken.deleteMany({
    where: { userId: user.id, type: "EMAIL_VERIFICATION" },
  })

  const verificationToken = crypto.randomBytes(32).toString("hex")
  await prisma.verificationToken.create({
    data: {
      token: verificationToken,
      userId: user.id,
      type: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  await sendWelcomeEmail(user.email, verificationToken)

  return {
    success: true,
    message: "If that email exists, a verification link has been sent.",
  }
}

/**
 * Request email change
 * @param {string} userId
 * @param {string} newEmail
 * @param {string} password
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const requestEmailChange = async (userId, newEmail, password) => {
  if (!newEmail || !password) {
    return {
      success: false,
      error: "New email and password are required",
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  if (isGoogleAuthUser(user)) {
    return {
      success: false,
      error: "Email updates are managed by Google for this account.",
    }
  }

  if (!user.passwordHash) {
    return { success: false, error: "Invalid password" }
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash)
  if (!isValidPassword) {
    return { success: false, error: "Invalid password" }
  }

  const normalizedEmail = newEmail.toLowerCase()

  if (normalizedEmail === user.email) {
    return {
      success: false,
      error: "New email must be different from current email",
    }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (existingUser) {
    return { success: false, error: "Email is already registered" }
  }

  await prisma.verificationToken.deleteMany({
    where: { userId: user.id, type: "EMAIL_CHANGE" },
  })

  const token = crypto.randomBytes(32).toString("hex")
  await prisma.verificationToken.create({
    data: {
      token,
      userId: user.id,
      type: "EMAIL_CHANGE",
      newEmail: normalizedEmail,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  await sendEmailChangeVerification(normalizedEmail, token)

  return {
    success: true,
    message:
      "Verification email sent to your new address. Please check your inbox.",
  }
}

/**
 * Update user password
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const updatePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    return {
      success: false,
      error: "Current and new passwords are required",
    }
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      error: "New password must be at least 8 characters",
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  if (isGoogleAuthUser(user)) {
    return {
      success: false,
      error: "Password updates are managed by Google for this account.",
    }
  }

  if (!user.passwordHash) {
    return { success: false, error: "Current password is incorrect" }
  }

  const isValidPassword = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  )
  if (!isValidPassword) {
    return { success: false, error: "Current password is incorrect" }
  }

  const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  })

  await sendPasswordChangedNotification(user.email)

  return { success: true, message: "Password updated successfully" }
}

/**
 * Request password reset
 * @param {string} email
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const forgotPassword = async (email) => {
  if (!email) {
    return {
      success: false,
      message: "Email is required",
    }
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user) {
    return {
      success: true,
      message: "If that email exists, a password reset link has been sent.",
    }
  }

  if (isGoogleAuthUser(user)) {
    return {
      success: true,
      message: "If that email exists, a password reset link has been sent.",
    }
  }

  await prisma.verificationToken.deleteMany({
    where: { userId: user.id, type: "PASSWORD_RESET" },
  })

  const resetToken = crypto.randomBytes(32).toString("hex")
  await prisma.verificationToken.create({
    data: {
      token: resetToken,
      userId: user.id,
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  await sendPasswordResetEmail(user.email, resetToken)

  return {
    success: true,
    message: "If that email exists, a password reset link has been sent.",
  }
}

/**
 * Reset password with token
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<{ success: boolean, user?: { id: string, email: string, emailVerified: boolean }, message?: string, error?: string }>}
 */
export const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    return {
      success: false,
      error: "Token and new password are required",
    }
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters",
    }
  }

  const resetToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!resetToken) {
    return { success: false, error: "Invalid or expired reset link" }
  }

  if (resetToken.type !== "PASSWORD_RESET") {
    return { success: false, error: "Invalid or expired reset link" }
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.verificationToken.delete({
      where: { id: resetToken.id },
    })
    return { success: false, error: "Reset link has expired" }
  }

  const user = await prisma.user.findUnique({
    where: { id: resetToken.userId },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  if (isGoogleAuthUser(user)) {
    return {
      success: false,
      error: "Password resets are managed by Google for this account.",
    }
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS)
  const updatedUser = await prisma.user.update({
    where: { id: resetToken.userId },
    data: {
      passwordHash,
      emailVerified: true,
    },
  })

  await prisma.verificationToken.deleteMany({
    where: { userId: resetToken.userId, type: "PASSWORD_RESET" },
  })

  await sendPasswordChangedNotification(user.email)

  return {
    success: true,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      authProvider: updatedUser.authProvider,
    },
    message: "Password reset successfully",
  }
}

/**
 * Archive (soft delete) user's own account
 * @param {string} userId
 * @param {string} password
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export const archiveAccount = async (userId, password) => {
  if (!userId) {
    return { success: false, error: "User ID is required" }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  if (!isGoogleAuthUser(user)) {
    if (!password) {
      return { success: false, error: "Password is required" }
    }

    if (!user.passwordHash) {
      return { success: false, error: "Invalid password" }
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return { success: false, error: "Invalid password" }
    }
  }

  if (user.archivedAt) {
    return { success: false, error: "Account is already deactivated" }
  }

  const now = new Date()

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: { userId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { archivedAt: now, tokensInvalidBefore: now },
    }),
  ])

  return {
    success: true,
    message: "Account deactivated successfully",
  }
}

/**
 * Verify account reactivation with token
 * @param {string} token
 * @returns {Promise<{ success: boolean, user?: { id: string, email: string }, error?: string }>}
 */
export const verifyAccountReactivation = async (token) => {
  if (!token) {
    return { success: false, error: "missing_token" }
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    return { success: false, error: "invalid_token" }
  }

  if (verificationToken.type !== "ACCOUNT_REACTIVATION") {
    return { success: false, error: "invalid_token" }
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })
    return { success: false, error: "expired_token" }
  }

  const user = await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerified: true },
  })

  await prisma.verificationToken.deleteMany({
    where: { userId: verificationToken.userId, type: "ACCOUNT_REACTIVATION" },
  })

  return {
    success: true,
    user: { id: user.id, email: user.email },
  }
}
