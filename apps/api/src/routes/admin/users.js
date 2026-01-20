import { Router } from "express"
import { requireAdmin } from "../../middleware/admin.js"
import {
  getUserById,
  getUserStats,
  listUsers,
  getUserGrowth,
  updateUser,
  archiveUser,
  unarchiveUser,
  banUser,
  unbanUser,
  permanentlyDeleteUser,
} from "../../lib/admin/index.js"

const router = Router()

// GET /admin/users/stats - Aggregate stats for overview
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const result = await getUserStats()

    if (!result.success) {
      return res
        .status(500)
        .json({ error: result.error || "Failed to get stats" })
    }

    res.json({ stats: result.stats })
  } catch (error) {
    console.error("Get user stats error:", error)
    res.status(500).json({ error: "Failed to get user stats" })
  }
})

// GET /admin/users/list - Cursor-paginated user lists for overview
router.get("/list", requireAdmin, async (req, res) => {
  try {
    const filter = req.query.filter
    const limitRaw = req.query.limit
    const cursorCreatedAt = req.query.cursorCreatedAt
    const cursorId = req.query.cursorId

    let limit = 20
    if (typeof limitRaw === "string") {
      const parsed = Number.parseInt(limitRaw, 10)
      if (Number.isFinite(parsed)) {
        limit = parsed
      }
    }

    const result = await listUsers({
      filter,
      limit,
      cursorCreatedAt:
        typeof cursorCreatedAt === "string" ? cursorCreatedAt : undefined,
      cursorId: typeof cursorId === "string" ? cursorId : undefined,
    })

    if (!result.success) {
      return res
        .status(400)
        .json({ error: result.error || "Failed to list users" })
    }

    res.json({
      users: result.users,
      totalCount: result.totalCount,
      nextCursor: result.nextCursor,
    })
  } catch (error) {
    console.error("List users error:", error)
    res.status(500).json({ error: "Failed to list users" })
  }
})

// GET /admin/users/growth - Growth buckets for charts
router.get("/growth", requireAdmin, async (req, res) => {
  try {
    const range = req.query.range
    const normalizedRange = typeof range === "string" ? range : "month"

    const result = await getUserGrowth({ range: normalizedRange })

    if (!result.success) {
      return res
        .status(400)
        .json({ error: result.error || "Failed to get growth" })
    }

    res.json({ range: result.range, buckets: result.buckets })
  } catch (error) {
    console.error("Get user growth error:", error)
    res.status(500).json({ error: "Failed to get user growth" })
  }
})

// GET /admin/users/:id - Fetch full user details
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await getUserById(req.params.id)

    if (!result.success) {
      return res.status(404).json({ error: result.error })
    }

    res.json({ user: result.user })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

// PATCH /admin/users/:id - Update editable user fields
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { email, isAdmin } = req.body
    const result = await updateUser(req.params.id, { email, isAdmin })

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ user: result.user })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ error: "Failed to update user" })
  }
})

// POST /admin/users/:id/archive - Soft delete user
router.post("/:id/archive", requireAdmin, async (req, res) => {
  try {
    const result = await archiveUser(req.params.id)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ message: "User archived successfully", user: result.user })
  } catch (error) {
    console.error("Archive user error:", error)
    res.status(500).json({ error: "Failed to archive user" })
  }
})

// POST /admin/users/:id/unarchive - Restore archived user
router.post("/:id/unarchive", requireAdmin, async (req, res) => {
  try {
    const { requireVerification = false } = req.body
    const result = await unarchiveUser(req.params.id, requireVerification)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({
      message: result.message,
      user: result.user,
      verificationSent: result.verificationSent,
    })
  } catch (error) {
    console.error("Unarchive user error:", error)
    res.status(500).json({ error: "Failed to unarchive user" })
  }
})

// POST /admin/users/:id/ban - Ban user and invalidate all tokens
router.post("/:id/ban", requireAdmin, async (req, res) => {
  try {
    const { reasonInternal } = req.body
    const result = await banUser(req.params.id, reasonInternal)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ message: "User banned successfully", user: result.user })
  } catch (error) {
    console.error("Ban user error:", error)
    res.status(500).json({ error: "Failed to ban user" })
  }
})

// POST /admin/users/:id/unban - Unban user and invalidate all tokens
router.post("/:id/unban", requireAdmin, async (req, res) => {
  try {
    const result = await unbanUser(req.params.id)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ message: "User unbanned successfully", user: result.user })
  } catch (error) {
    console.error("Unban user error:", error)
    res.status(500).json({ error: "Failed to unban user" })
  }
})

// DELETE /admin/users/:id - Permanent delete (GDPR)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { confirmEmail } = req.body

    if (!confirmEmail) {
      return res.status(400).json({
        error: "Must confirm deletion by providing the user's email",
      })
    }

    const result = await permanentlyDeleteUser(req.params.id, confirmEmail)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({ message: result.message })
  } catch (error) {
    console.error("Permanent delete user error:", error)
    res.status(500).json({ error: "Failed to permanently delete user" })
  }
})

export default router
