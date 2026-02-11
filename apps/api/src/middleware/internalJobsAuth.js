import { JOBS_INTERNAL_API_TOKEN } from "../constants.js"

/**
 * Middleware to authorize internal Jobs -> API calls.
 * Expects: Authorization: Bearer <JOBS_INTERNAL_API_TOKEN>
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const requireInternalJobsAuth = (req, res, next) => {
  if (!JOBS_INTERNAL_API_TOKEN) {
    return res.status(503).json({ error: "Internal jobs auth is not configured" })
  }

  const authorizationHeader = req.headers?.authorization
  if (typeof authorizationHeader !== "string") {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const prefix = "Bearer "
  if (!authorizationHeader.startsWith(prefix)) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const token = authorizationHeader.slice(prefix.length).trim()
  if (!token || token !== JOBS_INTERNAL_API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  next()
}

