/**
 * @param {string} authError
 * @returns {string}
 */
export const getAuthErrorMessage = (authError) => {
  if (authError === "google_unavailable") {
    return "Google sign-in is temporarily unavailable."
  }
  if (authError === "google_access_denied") {
    return "Google sign-in was cancelled."
  }
  if (authError === "google_state_mismatch") {
    return "Google sign-in failed. Please try again."
  }
  if (authError === "google_profile_incomplete") {
    return "Google sign-in failed. Please try again."
  }
  if (authError === "google_unverified_email") {
    return "Please verify your Google email before signing in."
  }
  if (authError === "google_email_in_use") {
    return "This email is already registered. Use your password to log in."
  }
  if (authError === "account_banned") {
    return "This account has been banned."
  }
  if (authError === "account_archived") {
    return "This account has been deactivated."
  }
  if (authError === "admin_access_required") {
    return "Admin access is required for the admin panel."
  }
  return "Sign-in failed. Please try again."
}
