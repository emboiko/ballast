import bcrypt from "bcryptjs"
import prisma from "@ballast/shared/src/db/client.js"

/**
 * Admin login - validates credentials and checks for admin privileges
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: { id: string, email: string, emailVerified: boolean, isAdmin: boolean }, error?: string, banned?: boolean }>}
 */
export const adminLogin = async (email, password) => {
  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user) {
    return { success: false, error: "Invalid email or password" }
  }

  if (user.authProvider === "GOOGLE") {
    return {
      success: false,
      error: "This account uses Google sign-in. Please log in with Google.", // Leak this info to the user
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
      error: "This account has been banned",
    }
  }

  if (user.archivedAt) {
    return {
      success: false,
      error: "This account has been deactivated",
    }
  }

  if (!user.emailVerified) {
    return {
      success: false,
      error: "Please verify your email before logging in",
    }
  }

  if (!user.isAdmin) {
    return {
      success: false,
      error: "Admin access required",
    }
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      isAdmin: user.isAdmin,
      authProvider: user.authProvider,
    },
  }
}
