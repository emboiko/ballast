"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import ConfirmationModal from "@/components/ui/ConfirmationModal"
import SectionNav from "@/components/ui/SectionNav"
import { useAuth } from "@/contexts/AuthContext"
import { useRefunds } from "@/contexts/RefundsContext"
import { useToast } from "@/contexts/ToastContext"
import {
  ModalWarning,
  ModalDangerWarning,
  ModalInput,
  ModalCheckboxLabel,
} from "@/components/ui/uiStyles"
import {
  UserDetailContainer,
  DetailSection,
  SectionTitle,
  DetailGrid,
  DetailItem,
  DetailLabel,
  DetailValue,
  DetailValueMono,
  StatusBadge,
  StatusBadgesRow,
  ToggleSwitch,
  ToggleTrack,
  ToggleLabel,
  ActionsSection,
  ActionsDivider,
  ActionGroup,
  ActionTitle,
  ActionDescription,
  ActionButtons,
  ActionButtonSecondary,
  ActionButtonPrimary,
  ActionButtonWarning,
  ActionButtonDanger,
  LoadingState,
  ErrorState,
  ExternalLink,
  InlineLink,
  ModalHintText,
  ModalPromptText,
  SelfActionWarning,
} from "@/components/users/userStyles"
import {
  fetchUserById,
  updateUser,
  archiveUser,
  unarchiveUser,
  banUser,
  unbanUser,
  permanentlyDeleteUser,
} from "@/gateways/usersGateway"
import { formatDate } from "@/utils/date"

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id
  const { user: currentUser } = useAuth()
  const { fetchRefunds } = useRefunds()
  const { showErrorToast, showSuccessToast } = useToast()

  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [adminToggleModalOpen, setAdminToggleModalOpen] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [unarchiveModalOpen, setUnarchiveModalOpen] = useState(false)
  const [banToggleModalOpen, setBanToggleModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [requireVerification, setRequireVerification] = useState(false)
  const [banReasonInternal, setBanReasonInternal] = useState("")
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [totalRefunds, setTotalRefunds] = useState(null)

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchUserById(userId)
      setUser(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const loadRefundTotals = useCallback(async () => {
    if (!userId) {
      return
    }

    try {
      const [pending, approved, rejected] = await Promise.all([
        fetchRefunds({ status: "pending", limit: 1, offset: 0, userId }),
        fetchRefunds({ status: "approved", limit: 1, offset: 0, userId }),
        fetchRefunds({ status: "rejected", limit: 1, offset: 0, userId }),
      ])

      let pendingCount = 0
      if (typeof pending?.total === "number") {
        pendingCount = pending.total
      }

      let approvedCount = 0
      if (typeof approved?.total === "number") {
        approvedCount = approved.total
      }

      let rejectedCount = 0
      if (typeof rejected?.total === "number") {
        rejectedCount = rejected.total
      }
      const totalCount = pendingCount + approvedCount + rejectedCount

      setTotalRefunds(totalCount)
    } catch (err) {
      setTotalRefunds(null)
      showErrorToast(err.message || "Failed to load refund totals")
    }
  }, [fetchRefunds, showErrorToast, userId])

  useEffect(() => {
    loadRefundTotals()
  }, [loadRefundTotals])

  const handleToggleAdmin = async () => {
    try {
      setActionLoading(true)
      const data = await updateUser(userId, { isAdmin: !user.isAdmin })
      setUser(data.user)
      setAdminToggleModalOpen(false)
      if (data.user.isAdmin) {
        showSuccessToast("User is now an admin")
      } else {
        showSuccessToast("Admin access removed")
      }
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleArchive = async () => {
    try {
      setActionLoading(true)
      const data = await archiveUser(userId)
      setUser(data.user)
      setArchiveModalOpen(false)
      showSuccessToast("User archived successfully")
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnarchive = async () => {
    try {
      setActionLoading(true)
      const data = await unarchiveUser(userId, requireVerification)
      setUser(data.user)
      setUnarchiveModalOpen(false)
      setRequireVerification(false)
      showSuccessToast(data.message, { durationMs: 5000 })
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePermanentDelete = async () => {
    try {
      setActionLoading(true)
      await permanentlyDeleteUser(userId, deleteConfirmEmail)
      setDeleteModalOpen(false)
      showSuccessToast("User permanently deleted. Redirecting...", {
        durationMs: 2000,
      })
      setTimeout(() => {
        window.location.href = "/users"
      }, 2000)
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleBan = async () => {
    try {
      setActionLoading(true)

      let data
      if (Boolean(user.bannedAt)) {
        data = await unbanUser(userId)
        showSuccessToast("User unbanned successfully", { durationMs: 5000 })
      } else {
        data = await banUser(userId, banReasonInternal)
        showSuccessToast("User banned successfully", { durationMs: 5000 })
      }

      setUser(data.user)
      setBanToggleModalOpen(false)
      setBanReasonInternal("")
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const renderProcessorLinks = () => {
    const processors = [
      {
        name: "Stripe",
        id: user.stripeCustomerId,
        url: user.stripeCustomerId
          ? `https://dashboard.stripe.com/customers/${user.stripeCustomerId}`
          : null,
      },
      {
        name: "Braintree",
        id: user.braintreeCustomerId,
        url: null,
      },
      {
        name: "Square",
        id: user.squareCustomerId,
        url: null,
      },
      {
        name: "Authorize.net",
        id: user.authorizeCustomerId,
        url: null,
      },
    ]

    const activeProcessors = processors.filter((p) => p.id)

    if (activeProcessors.length === 0) {
      return <DetailValue>No payment processor accounts linked</DetailValue>
    }

    return activeProcessors.map((processor) => (
      <DetailItem key={processor.name}>
        <DetailLabel>{processor.name}</DetailLabel>
        {processor.url ? (
          <ExternalLink
            href={processor.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {processor.id}
          </ExternalLink>
        ) : (
          <DetailValueMono>{processor.id}</DetailValueMono>
        )}
      </DetailItem>
    ))
  }

  const formatUserInfoValue = (value) => {
    if (typeof value !== "string") {
      return "—"
    }

    const trimmed = value.trim()
    if (!trimmed) {
      return "—"
    }

    return trimmed
  }

  if (isLoading) {
    return (
      <PageLayout>
        <SectionNav title="User Details" subtitle={`User ID: ${userId}`} />
        <LoadingState>Loading user...</LoadingState>
      </PageLayout>
    )
  }

  if (error && !user) {
    return (
      <PageLayout>
        <SectionNav title="User Details" subtitle={`User ID: ${userId}`} />
        <ErrorState>
          <p>Failed to load user: {error}</p>
          <ActionButtonSecondary onClick={fetchUser}>
            Try Again
          </ActionButtonSecondary>
        </ErrorState>
      </PageLayout>
    )
  }

  if (!user) {
    return null
  }

  const isArchived = Boolean(user.archivedAt)
  const isBanned = Boolean(user.bannedAt)
  const isSelf = currentUser?.id === user.id
  const isGoogleUser = user.authProvider === "GOOGLE"

  let emailVerificationVariant = "warning"
  let emailVerificationText = "Not Verified"
  if (user.emailVerified) {
    emailVerificationVariant = "success"
    emailVerificationText = "Verified"
  }

  let accountStatusVariant = "success"
  let accountStatusText = "Active"
  if (isArchived) {
    accountStatusVariant = "error"
    accountStatusText = "Archived"
  }

  let banToggleLabelText = "Not Banned"
  if (isBanned) {
    banToggleLabelText = "Banned"
  }

  let banModalTitle = "Ban User"
  let banModalConfirmText = "Ban"
  let banModalConfirmVariant = "danger"
  if (isBanned) {
    banModalTitle = "Unban User"
    banModalConfirmText = "Unban"
    banModalConfirmVariant = "primary"
  }

  let totalRefundsLabel = "—"
  if (typeof totalRefunds === "number") {
    totalRefundsLabel = String(totalRefunds)
  }

  let totalOrdersContent = <DetailValue>{user.orderCount}</DetailValue>
  if (user?.id) {
    totalOrdersContent = (
      <DetailValue>
        <InlineLink href={`/orders?userId=${user.id}`}>
          {user.orderCount}
        </InlineLink>
      </DetailValue>
    )
  }

  let financingPlansContent = <DetailValue>{user.financingPlanCount}</DetailValue>
  if (user?.id) {
    financingPlansContent = (
      <DetailValue>
        <InlineLink href={`/financing?userId=${user.id}`}>
          {user.financingPlanCount}
        </InlineLink>
      </DetailValue>
    )
  }

  let contactSubmissionsContent = (
    <DetailValue>{user.contactSubmissionCount}</DetailValue>
  )
  if (user?.id) {
    contactSubmissionsContent = (
      <DetailValue>
        <InlineLink href={`/communications/contact?userId=${user.id}`}>
          {user.contactSubmissionCount}
        </InlineLink>
      </DetailValue>
    )
  }

  let totalRefundsContent = <DetailValue>{totalRefundsLabel}</DetailValue>
  if (user?.id) {
    totalRefundsContent = (
      <DetailValue>
        <InlineLink href={`/refunds?userId=${user.id}`}>
          {totalRefundsLabel}
        </InlineLink>
      </DetailValue>
    )
  }

  const renderBanModalContent = () => {
    if (isBanned) {
      return (
        <>
          <ModalWarning>This will restore access to the user.</ModalWarning>
          <p>
            Are you sure you want to unban <strong>{user.email}</strong>?
          </p>
          <ModalHintText>
            Any existing sessions will remain logged out and the user will need
            to log in again.
          </ModalHintText>
        </>
      )
    }

    return (
      <>
        <ModalDangerWarning>
          This will immediately log the user out of all devices and prevent
          future logins until the ban is lifted.
        </ModalDangerWarning>
        <p>
          Are you sure you want to ban <strong>{user.email}</strong>?
        </p>
        <ModalPromptText>Internal reason (optional)</ModalPromptText>
        <ModalInput
          type="text"
          value={banReasonInternal}
          onChange={(e) => setBanReasonInternal(e.target.value)}
          placeholder="Add an internal note for admins"
        />
      </>
    )
  }

  return (
    <PageLayout>
      <SectionNav title="User Details" subtitle={`User ID: ${userId}`} />

      <UserDetailContainer>
        <DetailSection>
          <SectionTitle>Basic Information</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <DetailLabel>Email</DetailLabel>
              <StatusBadgesRow>
                <DetailValue>{user.email}</DetailValue>
                <StatusBadge $variant={emailVerificationVariant}>
                  {emailVerificationText}
                </StatusBadge>
                {isGoogleUser && <StatusBadge>Google</StatusBadge>}
              </StatusBadgesRow>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Account Status</DetailLabel>
              <StatusBadgesRow>
                <StatusBadge $variant={accountStatusVariant}>
                  {accountStatusText}
                </StatusBadge>
                {isBanned && <StatusBadge $variant="error">Banned</StatusBadge>}
              </StatusBadgesRow>
            </DetailItem>
          </DetailGrid>
        </DetailSection>

        <DetailSection>
          <SectionTitle>User Info</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <DetailLabel>Full Name</DetailLabel>
              <DetailValue>{formatUserInfoValue(user.fullName)}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Phone Number</DetailLabel>
              <DetailValue>{formatUserInfoValue(user.phoneNumber)}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Address Line 1</DetailLabel>
              <DetailValue>
                {formatUserInfoValue(user.billingAddressLine1)}
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Address Line 2</DetailLabel>
              <DetailValue>
                {formatUserInfoValue(user.billingAddressLine2)}
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>City</DetailLabel>
              <DetailValue>{formatUserInfoValue(user.billingCity)}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>State / Region</DetailLabel>
              <DetailValue>{formatUserInfoValue(user.billingRegion)}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Postal Code</DetailLabel>
              <DetailValue>
                {formatUserInfoValue(user.billingPostalCode)}
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Country</DetailLabel>
              <DetailValue>{formatUserInfoValue(user.billingCountry)}</DetailValue>
            </DetailItem>
          </DetailGrid>
        </DetailSection>

        <DetailSection>
          <SectionTitle>Timeline</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <DetailLabel>Created</DetailLabel>
              <DetailValue>{formatDate(user.createdAt)}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Last Updated</DetailLabel>
              <DetailValue>{formatDate(user.updatedAt)}</DetailValue>
            </DetailItem>
            {isArchived && (
              <DetailItem>
                <DetailLabel>Archived</DetailLabel>
                <DetailValue>{formatDate(user.archivedAt)}</DetailValue>
              </DetailItem>
            )}
          </DetailGrid>
        </DetailSection>

        <DetailSection>
          <SectionTitle>Activity</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <DetailLabel>Total Orders</DetailLabel>
              {totalOrdersContent}
            </DetailItem>
            <DetailItem>
              <DetailLabel>Financing Plans</DetailLabel>
              {financingPlansContent}
            </DetailItem>
            <DetailItem>
              <DetailLabel>Contact Submissions</DetailLabel>
              {contactSubmissionsContent}
            </DetailItem>
            <DetailItem>
              <DetailLabel>Total Refunds</DetailLabel>
              {totalRefundsContent}
            </DetailItem>
          </DetailGrid>
        </DetailSection>

        <DetailSection>
          <SectionTitle>Payment Processor Accounts</SectionTitle>
          <DetailGrid>{renderProcessorLinks()}</DetailGrid>
        </DetailSection>

        <ActionsSection>
          <SectionTitle>Account Actions</SectionTitle>

          <ActionGroup>
            <ActionTitle>Admin Access</ActionTitle>
            <ActionDescription>
              {user.isAdmin
                ? "This user has admin access to the admin panel."
                : "Grant this user admin access to the admin panel."}
            </ActionDescription>
            {isSelf ? (
              <SelfActionWarning>
                You cannot modify your own admin access.
              </SelfActionWarning>
            ) : (
              <ActionButtons>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={user.isAdmin}
                    onChange={() => setAdminToggleModalOpen(true)}
                  />
                  <ToggleTrack $checked={user.isAdmin} />
                  <ToggleLabel>
                    {user.isAdmin ? "Admin" : "Not Admin"}
                  </ToggleLabel>
                </ToggleSwitch>
              </ActionButtons>
            )}
          </ActionGroup>

          <ActionsDivider />

          <ActionGroup>
            <ActionTitle>Account Ban</ActionTitle>
            <ActionDescription>
              Banning will display an explicit message to the user and prevent
              them from logging in.
            </ActionDescription>
            {isBanned && user.banReasonInternal && (
              <ActionDescription>
                Internal note: <strong>{user.banReasonInternal}</strong>
              </ActionDescription>
            )}
            {isSelf ? (
              <SelfActionWarning>
                You cannot ban your own account.
              </SelfActionWarning>
            ) : (
              <ActionButtons>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={isBanned}
                    onChange={() => setBanToggleModalOpen(true)}
                  />
                  <ToggleTrack $checked={isBanned} />
                  <ToggleLabel>{banToggleLabelText}</ToggleLabel>
                </ToggleSwitch>
              </ActionButtons>
            )}
          </ActionGroup>

          <ActionsDivider />

          {isArchived ? (
            <ActionGroup>
              <ActionTitle>Restore Account</ActionTitle>
              <ActionDescription>
                Un-archive this user&apos;s account to allow them to log in
                again. You can optionally require them to re-verify their email.
              </ActionDescription>
              {isSelf ? (
                <SelfActionWarning>
                  You cannot un-archive your own account.
                </SelfActionWarning>
              ) : (
                <ActionButtons>
                  <ActionButtonPrimary
                    onClick={() => setUnarchiveModalOpen(true)}
                  >
                    Un-archive Account
                  </ActionButtonPrimary>
                </ActionButtons>
              )}
            </ActionGroup>
          ) : (
            <ActionGroup>
              <ActionTitle>Archive Account</ActionTitle>
              <ActionDescription>
                Archiving will prevent the user from logging in. They can
                contact support to request restoration.
              </ActionDescription>
              {isSelf ? (
                <SelfActionWarning>
                  You cannot archive your own account.
                </SelfActionWarning>
              ) : (
                <ActionButtons>
                  <ActionButtonWarning
                    onClick={() => setArchiveModalOpen(true)}
                  >
                    Archive User
                  </ActionButtonWarning>
                </ActionButtons>
              )}
            </ActionGroup>
          )}

          <ActionsDivider />

          <ActionGroup>
            <ActionTitle>Permanent Deletion (GDPR)</ActionTitle>
            <ActionDescription>
              Permanently delete this user and all associated data. This action
              cannot be undone and should only be used for GDPR &quot;right to
              erasure&quot; compliance requests.
            </ActionDescription>
            {isSelf ? (
              <SelfActionWarning>
                You cannot permanently delete your own account.
              </SelfActionWarning>
            ) : (
              <ActionButtons>
                <ActionButtonDanger onClick={() => setDeleteModalOpen(true)}>
                  Permanently Delete
                </ActionButtonDanger>
              </ActionButtons>
            )}
          </ActionGroup>
        </ActionsSection>
      </UserDetailContainer>

      <ConfirmationModal
        isOpen={adminToggleModalOpen}
        onClose={() => setAdminToggleModalOpen(false)}
        onConfirm={handleToggleAdmin}
        title={user.isAdmin ? "Remove Admin Access" : "Grant Admin Access"}
        confirmText={user.isAdmin ? "Remove Access" : "Grant Access"}
        confirmVariant={user.isAdmin ? "danger" : "primary"}
        isLoading={actionLoading}
      >
        {user.isAdmin ? (
          <>
            <ModalWarning>
              This will revoke admin panel access for this user.
            </ModalWarning>
            <p>
              Are you sure you want to remove admin access from{" "}
              <strong>{user.email}</strong>?
            </p>
          </>
        ) : (
          <>
            <p>
              Are you sure you want to grant admin access to{" "}
              <strong>{user.email}</strong>?
            </p>
            <ModalHintText>
              This user will be able to access the admin panel and manage users,
              orders, and other data.
            </ModalHintText>
          </>
        )}
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={banToggleModalOpen}
        onClose={() => {
          setBanToggleModalOpen(false)
          setBanReasonInternal("")
        }}
        onConfirm={handleToggleBan}
        title={banModalTitle}
        confirmText={banModalConfirmText}
        confirmVariant={banModalConfirmVariant}
        isLoading={actionLoading}
      >
        {renderBanModalContent()}
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleArchive}
        title="Archive User"
        confirmText="Archive"
        confirmVariant="danger"
        isLoading={actionLoading}
      >
        <ModalWarning>
          This will prevent the user from logging in to their account.
        </ModalWarning>
        <p>
          Are you sure you want to archive <strong>{user.email}</strong>?
        </p>
        <p>The user can be restored later if needed.</p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={unarchiveModalOpen}
        onClose={() => {
          setUnarchiveModalOpen(false)
          setRequireVerification(false)
        }}
        onConfirm={handleUnarchive}
        title="Un-archive User"
        confirmText="Un-archive"
        confirmVariant="primary"
        isLoading={actionLoading}
      >
        <p>
          Are you sure you want to restore <strong>{user.email}</strong>&apos;s
          account?
        </p>
        <ModalCheckboxLabel>
          <input
            type="checkbox"
            checked={requireVerification}
            onChange={(e) => setRequireVerification(e.target.checked)}
          />
          Require email re-verification before login
        </ModalCheckboxLabel>
        {requireVerification && (
          <ModalHintText>
            A verification email will be sent to the user. They must click the
            link to regain access.
          </ModalHintText>
        )}
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteConfirmEmail("")
        }}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete User"
        confirmText="Delete Forever"
        confirmVariant="danger"
        isLoading={actionLoading}
        confirmDisabled={
          deleteConfirmEmail.toLowerCase() !== user.email.toLowerCase()
        }
        maxWidth="500px"
      >
        <ModalDangerWarning>
          <strong>This action cannot be undone.</strong> All user data including
          orders, refunds, and contact submissions will be permanently deleted.
        </ModalDangerWarning>
        <p>
          Use this only for GDPR &quot;right to erasure&quot; compliance
          requests.
        </p>
        <ModalPromptText>
          To confirm, type the user&apos;s email address:{" "}
          <strong>{user.email}</strong>
        </ModalPromptText>
        <ModalInput
          type="email"
          value={deleteConfirmEmail}
          onChange={(e) => setDeleteConfirmEmail(e.target.value)}
          placeholder="Type email to confirm"
        />
      </ConfirmationModal>
    </PageLayout>
  )
}
