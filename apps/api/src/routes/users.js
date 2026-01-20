import { Router } from "express"
import prisma from "@ballast/shared/src/db/client.js"
import { requireAuth } from "@/middleware/auth.js"
import {
  buildUserInfoUpdateData,
  userInfoSelectFields,
} from "@/lib/userInfo.js"

const router = Router()

// PATCH /users/me - Update current user's info
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const updateResult = buildUserInfoUpdateData(req.body)

    if (!updateResult.success) {
      return res.status(400).json({ error: updateResult.error })
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateResult.data,
      select: {
        id: true,
        email: true,
        emailVerified: true,
        authProvider: true,
        isAdmin: true,
        ...userInfoSelectFields,
      },
    })

    res.json({ user: updatedUser })
  } catch (error) {
    console.error("Update user info error:", error)
    res.status(500).json({ error: "Failed to update user info" })
  }
})

export default router
