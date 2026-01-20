import jwt from "jsonwebtoken"
import { JWT_SECRET, IS_PRODUCTION } from "../constants.js"

export const WEB_AUTH_COOKIE_NAME = "auth_token"
export const ADMIN_AUTH_COOKIE_NAME = "admin_auth_token"

/**
 * @param {{ userId: string, email: string }} payload
 * @returns {string}
 */
export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

/**
 * @param {string} token
 * @returns {{ userId: string, email: string } | null}
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

/**
 * @param {import("express").Response} res
 * @param {string} token
 */
export const setWebAuthCookie = (res, token) => {
  res.cookie(WEB_AUTH_COOKIE_NAME, token, {
    httpOnly: true, // prevent js in the browser from accessing the cookie
    secure: IS_PRODUCTION,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  })
}

/**
 * @param {import("express").Response} res
 */
export const clearWebAuthCookie = (res) => {
  res.clearCookie(WEB_AUTH_COOKIE_NAME, { path: "/" })
}

/**
 * @param {import("express").Response} res
 * @param {string} token
 */
export const setAdminAuthCookie = (res, token) => {
  res.cookie(ADMIN_AUTH_COOKIE_NAME, token, {
    httpOnly: true, // prevent js in the browser from accessing the cookie
    secure: IS_PRODUCTION,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/admin",
  })
}

/**
 * @param {import("express").Response} res
 */
export const clearAdminAuthCookie = (res) => {
  res.clearCookie(ADMIN_AUTH_COOKIE_NAME, { path: "/admin" })
}
