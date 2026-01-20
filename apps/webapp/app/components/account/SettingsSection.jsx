"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import CollapsibleSection from "@/components/account/CollapsibleSection"
import EmailChangeForm from "@/components/account/EmailChangeForm"
import PasswordChangeForm from "@/components/account/PasswordChangeForm"
import UserInfoForm from "@/components/userInfo/UserInfoForm"
import ConfirmationModal from "@/components/ui/ConfirmationModal"
import {
  SettingsList,
  SettingsItem,
  SettingsItemInfo,
  SettingsItemLabel,
  SettingsItemDescription,
  VerificationStatus,
  ComingSoonBadge,
  SettingsDivider,
  SettingsForm,
  SettingsFormDescription,
} from "@/components/account/accountStyles"
import {
  ButtonSecondary,
  ButtonDanger,
  FormGroup,
  FormError,
} from "@/components/ui/uiStyles"

export default function SettingsSection() {
  const { user, setSuccessMessage, deleteAccount } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [emailSectionOpen, setEmailSectionOpen] = useState(false)
  const [passwordSectionOpen, setPasswordSectionOpen] = useState(false)
  const [userInfoSectionOpen, setUserInfoSectionOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const searchParams = useSearchParams()
  const isGoogleUser = user?.authProvider === "GOOGLE"

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check for email_updated success from URL
  useEffect(() => {
    if (searchParams.get("email_updated") === "true") {
      setSuccessMessage("Your email address has been updated! 🎉")
      const url = new URL(window.location.href)
      url.searchParams.delete("email_updated")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams, setSuccessMessage])

  const handleEmailSuccess = (message) => {
    setEmailSectionOpen(false)
    setSuccessMessage(message)
  }

  const handlePasswordSuccess = (message) => {
    setPasswordSectionOpen(false)
    setSuccessMessage(message)
  }

  const handleDeleteSubmit = (e) => {
    e.preventDefault()
    setDeleteError("")

    if (!isGoogleUser) {
      if (!deletePassword) {
        setDeleteError("Please enter your password to confirm")
        return
      }
    }

    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    setDeleteError("")

    let result
    if (isGoogleUser) {
      result = await deleteAccount()
    } else {
      result = await deleteAccount(deletePassword)
    }

    if (!result.success) {
      setDeleteError(result.error)
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
  }

  let themeLabel = "Light"
  let themeIcon = "🌙"

  if (mounted) {
    if (theme === "dark") {
      themeLabel = "Dark"
      themeIcon = "☀️"
    } else {
      themeLabel = "Light"
      themeIcon = "🌙"
    }
  }

  let authSettingsContent = (
    <>
      <CollapsibleSection
        title="Change Email"
        description="Update your email address"
        isOpen={emailSectionOpen}
        onToggle={() => setEmailSectionOpen(!emailSectionOpen)}
      >
        <EmailChangeForm onSuccess={handleEmailSuccess} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Change Password"
        description="Update your account password"
        isOpen={passwordSectionOpen}
        onToggle={() => setPasswordSectionOpen(!passwordSectionOpen)}
      >
        <PasswordChangeForm onSuccess={handlePasswordSuccess} />
      </CollapsibleSection>
    </>
  )

  if (isGoogleUser) {
    authSettingsContent = (
      <>
        <SettingsItem $disabled>
          <SettingsItemInfo>
            <SettingsItemLabel>Change Email</SettingsItemLabel>
            <SettingsItemDescription>
              Managed by Google for this account
            </SettingsItemDescription>
          </SettingsItemInfo>
          <ComingSoonBadge>Google</ComingSoonBadge>
        </SettingsItem>

        <SettingsItem $disabled>
          <SettingsItemInfo>
            <SettingsItemLabel>Change Password</SettingsItemLabel>
            <SettingsItemDescription>
              Managed by Google for this account
            </SettingsItemDescription>
          </SettingsItemInfo>
          <ComingSoonBadge>Google</ComingSoonBadge>
        </SettingsItem>
      </>
    )
  }

  let deleteButtonLabel = "Delete Account"
  if (isDeleting) {
    deleteButtonLabel = "Deleting..."
  }

  let isDeleteDisabled = isDeleting
  if (!isGoogleUser && !deletePassword) {
    isDeleteDisabled = true
  }

  return (
    <SettingsList>
      <SettingsItem>
        <SettingsItemInfo>
          <SettingsItemLabel>Email</SettingsItemLabel>
          <SettingsItemDescription>{user.email}</SettingsItemDescription>
        </SettingsItemInfo>
        <VerificationStatus $verified>✓ Verified</VerificationStatus>
      </SettingsItem>

      {authSettingsContent}

      <CollapsibleSection
        title="Billing Details"
        description="Update your name, phone number, and billing address"
        isOpen={userInfoSectionOpen}
        onToggle={() => setUserInfoSectionOpen(!userInfoSectionOpen)}
      >
        <UserInfoForm
          title="Billing details"
          description="Keep your billing details up to date for faster checkout."
          submitLabel="Save my info"
        />
      </CollapsibleSection>

      <SettingsItem $disabled>
        <SettingsItemInfo>
          <SettingsItemLabel>Communication Preferences</SettingsItemLabel>
          <SettingsItemDescription>
            Manage email and notification settings
          </SettingsItemDescription>
        </SettingsItemInfo>
        <ComingSoonBadge>Coming soon</ComingSoonBadge>
      </SettingsItem>

      <SettingsItem $disabled>
        <SettingsItemInfo>
          <SettingsItemLabel>Payment Methods</SettingsItemLabel>
          <SettingsItemDescription>
            Manage saved cards and default payment method
          </SettingsItemDescription>
        </SettingsItemInfo>
        <ComingSoonBadge>Coming soon</ComingSoonBadge>
      </SettingsItem>

      <SettingsItem>
        <SettingsItemInfo>
          <SettingsItemLabel>Theme</SettingsItemLabel>
          <SettingsItemDescription>
            Choose between light and dark mode
          </SettingsItemDescription>
        </SettingsItemInfo>
        <ButtonSecondary onClick={toggleTheme} aria-label="Toggle theme">
          {themeIcon} {themeLabel}
        </ButtonSecondary>
      </SettingsItem>

      <SettingsDivider />

      <CollapsibleSection
        title="Delete Account"
        description="Deactivate your account"
        isOpen={deleteAccountOpen}
        onToggle={() => setDeleteAccountOpen(!deleteAccountOpen)}
      >
        <SettingsForm onSubmit={handleDeleteSubmit}>
          <SettingsFormDescription>
            This will deactivate your account and you will no longer be able to
            log in.
          </SettingsFormDescription>

          {!isGoogleUser && (
            <FormGroup>
              <label htmlFor="delete-password">
                Enter your password to confirm
              </label>
              <input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
            </FormGroup>
          )}

          <FormError>{deleteError}</FormError>

          <ButtonDanger type="submit" disabled={isDeleteDisabled}>
            {deleteButtonLabel}
          </ButtonDanger>
        </SettingsForm>
      </CollapsibleSection>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        confirmText="Delete Account"
        isLoading={isDeleting}
      >
        <p>
          Are you sure you want to delete your account? This will log you out
          immediately.
        </p>
      </ConfirmationModal>
    </SettingsList>
  )
}
