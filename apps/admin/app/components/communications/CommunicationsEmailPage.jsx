"use client"

import { useEffect, useMemo, useState } from "react"
import PageLayout from "@/components/ui/PageLayout"
import SectionNav from "@/components/ui/SectionNav"
import { useCommunications } from "@/contexts/CommunicationsContext"
import { useToast } from "@/contexts/ToastContext"
import ConfirmationModal from "@/components/ui/ConfirmationModal"
import { formatDate } from "@/utils/date"
import {
  BodyBox,
  BodyText,
  CommunicationsLayout,
  DetailContainer,
  DetailGrid,
  DetailLabel,
  DetailValue,
  DirectionBadge,
  EmailList,
  EmailListItemButton,
  EmailMetaRow,
  EmailSubject,
  EmptyState,
  FilterButton,
  FilterRow,
  LoadMoreContainer,
  Panel,
  PanelHeader,
  PanelHeaderLeft,
  PanelSubtitle,
  PanelTitle,
  ReplyButton,
  ReplyForm,
  ReplyTextarea,
  SecondaryButton,
  ToggleButton,
  ToggleLabel,
  ToggleRow,
  UnreadDot,
  UserLink,
} from "@/components/communications/communicationsStyles"

export default function CommunicationsEmailPage() {
  const {
    emails,
    total,
    hasMore,
    hasLoadedOnce,
    selectedEmailId,
    selectedEmail,
    isLoadingList,
    isLoadingMore,
    isLoadingEmail,
    isSendingReply,
    error,
    isPollingEnabled,
    directionFilter,
    lastRefreshedAt,
    setPollingEnabled,
    setDirectionFilterValue,
    setEmailReadStatus,
    loadMoreEmails,
    deleteEmailById,
    selectEmail,
    replyToSelectedEmail,
  } = useCommunications()

  const { showErrorToast, showSuccessToast } = useToast()

  const [replyText, setReplyText] = useState("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!selectedEmailId) {
      setReplyText("")
    }
  }, [selectedEmailId])

  const listSubtitle = useMemo(() => {
    if (!hasLoadedOnce && isLoadingList) {
      return "Loading…"
    }

    let subtitleText = `${total} total`

    if (lastRefreshedAt) {
      subtitleText = `${subtitleText} • Updated ${formatDate(lastRefreshedAt)}`
    }

    return subtitleText
  }, [hasLoadedOnce, isLoadingList, lastRefreshedAt, total])

  const handleTogglePolling = () => {
    setPollingEnabled(!isPollingEnabled)
  }

  const handleSelectEmail = (emailId) => {
    selectEmail(emailId)
  }

  const handleSetFilter = (nextFilter) => {
    setDirectionFilterValue(nextFilter)
  }

  const handleSubmitReply = async (event) => {
    event.preventDefault()

    try {
      await replyToSelectedEmail(replyText)
      setReplyText("")
      showSuccessToast("Reply sent")
    } catch (err) {
      showErrorToast(err.message)
    }
  }

  const renderList = () => {
    if (isLoadingList && emails.length === 0) {
      return <EmptyState>Loading emails…</EmptyState>
    }

    if (!emails || emails.length === 0) {
      return <EmptyState>No emails yet.</EmptyState>
    }

    return (
      <EmailList>
        {emails.map((email) => {
          let subjectText = "(No subject)"
          if (email.subject && String(email.subject).trim()) {
            subjectText = String(email.subject).trim()
          }

          const isActive = selectedEmailId === email.id

          let isUnread = false
          if (email.direction === "INBOUND" && !email.readAt) {
            isUnread = true
          }

          return (
            <EmailListItemButton
              key={email.id}
              type="button"
              onClick={() => handleSelectEmail(email.id)}
              $active={isActive}
            >
              <EmailSubject>
                {isUnread && <UnreadDot />}
                {subjectText}
              </EmailSubject>
              <EmailMetaRow>
                <span>{email.fromEmail}</span>
                <DirectionBadge $direction={email.direction}>
                  {email.direction}
                </DirectionBadge>
                <span>{formatDate(email.receivedAt || email.createdAt)}</span>
              </EmailMetaRow>
            </EmailListItemButton>
          )
        })}

        {hasMore && (
          <LoadMoreContainer>
            <SecondaryButton
              type="button"
              onClick={loadMoreEmails}
              disabled={isLoadingMore}
            >
              {!isLoadingMore && "Load more"}
              {isLoadingMore && "Loading…"}
            </SecondaryButton>
          </LoadMoreContainer>
        )}
      </EmailList>
    )
  }

  const renderDetail = () => {
    if (!selectedEmailId) {
      return <EmptyState>Select an email to view details.</EmptyState>
    }

    if (isLoadingEmail && !selectedEmail) {
      return <EmptyState>Loading email…</EmptyState>
    }

    if (!selectedEmail) {
      return <EmptyState>Email not found.</EmptyState>
    }

    let subjectText = "(No subject)"
    if (selectedEmail.subject && String(selectedEmail.subject).trim()) {
      subjectText = String(selectedEmail.subject).trim()
    }

    let bodyText = "(No body)"
    if (selectedEmail.textBody && String(selectedEmail.textBody).trim()) {
      bodyText = String(selectedEmail.textBody)
    } else if (
      selectedEmail.htmlBody &&
      String(selectedEmail.htmlBody).trim()
    ) {
      bodyText = String(selectedEmail.htmlBody)
    }

    let userLink = null
    if (selectedEmail.user && selectedEmail.user.id) {
      userLink = (
        <UserLink href={`/users/${selectedEmail.user.id}`}>Matched</UserLink>
      )
    }

    let toEmailsText = "N/A"
    if (Array.isArray(selectedEmail.toEmails)) {
      toEmailsText = selectedEmail.toEmails.join(", ")
    }

    const handleToggleRead = async () => {
      if (selectedEmail.direction !== "INBOUND") {
        return
      }

      let nextIsRead = true
      if (selectedEmail.readAt) {
        nextIsRead = false
      }

      try {
        await setEmailReadStatus(selectedEmail.id, nextIsRead)
        if (nextIsRead) {
          showSuccessToast("Marked as read")
        } else {
          showSuccessToast("Marked as unread")
        }
      } catch (err) {
        showErrorToast(err.message)
      }
    }

    let readToggleText = "Mark read"
    if (selectedEmail.readAt) {
      readToggleText = "Mark unread"
    }

    const handleDeleteEmail = async () => {
      if (!selectedEmail) {
        return
      }

      try {
        setIsDeleting(true)
        await deleteEmailById(selectedEmail.id)
        setDeleteModalOpen(false)
        showSuccessToast("Email deleted")
      } catch (err) {
        showErrorToast(err.message)
      } finally {
        setIsDeleting(false)
      }
    }

    return (
      <DetailContainer>
        <DetailGrid>
          <DetailLabel>Subject</DetailLabel>
          <DetailValue>{subjectText}</DetailValue>

          <DetailLabel>Direction</DetailLabel>
          <DetailValue>{selectedEmail.direction}</DetailValue>

          <DetailLabel>Status</DetailLabel>
          <DetailValue>{selectedEmail.status}</DetailValue>

          <DetailLabel>From</DetailLabel>
          <DetailValue>{selectedEmail.fromEmail}</DetailValue>

          <DetailLabel>To</DetailLabel>
          <DetailValue>{toEmailsText}</DetailValue>

          <DetailLabel>Received</DetailLabel>
          <DetailValue>
            {formatDate(selectedEmail.receivedAt || selectedEmail.createdAt)}
          </DetailValue>

          <DetailLabel>User</DetailLabel>
          <DetailValue>{userLink || "No match"}</DetailValue>
        </DetailGrid>

        <BodyBox>
          <BodyText>{bodyText}</BodyText>
        </BodyBox>

        <ToggleRow>
          {selectedEmail.direction === "INBOUND" && (
            <SecondaryButton type="button" onClick={handleToggleRead}>
              {readToggleText}
            </SecondaryButton>
          )}
          <SecondaryButton
            type="button"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete
          </SecondaryButton>
        </ToggleRow>

        <ReplyForm onSubmit={handleSubmitReply}>
          <ReplyTextarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply…"
            disabled={isSendingReply}
          />
          <ReplyButton
            type="submit"
            disabled={!replyText.trim() || isSendingReply}
          >
            Send Reply
          </ReplyButton>
        </ReplyForm>

        {error && <EmptyState>Error: {error}</EmptyState>}

        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteEmail}
          title="Delete message"
          confirmText="Delete"
          confirmVariant="danger"
          isLoading={isDeleting}
        >
          <p>
            This will permanently delete this message from the database. This
            cannot be undone.
          </p>
        </ConfirmationModal>
      </DetailContainer>
    )
  }

  return (
    <PageLayout>
      <SectionNav
        title="Communications"
        subtitle="Email"
        links={[
          { href: "/communications/email", title: "Email", isActive: true },
          {
            href: "/communications/contact",
            title: "Contact",
            isActive: false,
          },
          { href: "/communications/sms", title: "SMS", isActive: false },
        ]}
      />

      <CommunicationsLayout>
        <Panel>
          <PanelHeader>
            <PanelHeaderLeft>
              <PanelTitle>Emails</PanelTitle>
              <PanelSubtitle>{listSubtitle}</PanelSubtitle>
            </PanelHeaderLeft>
            <ToggleRow>
              <ToggleLabel>Polling</ToggleLabel>
              <ToggleButton
                type="button"
                onClick={handleTogglePolling}
                $enabled={isPollingEnabled}
              >
                {isPollingEnabled && "On"}
                {!isPollingEnabled && "Off"}
              </ToggleButton>
            </ToggleRow>
          </PanelHeader>
          <PanelHeader>
            <FilterRow>
              <FilterButton
                type="button"
                onClick={() => handleSetFilter("UNREAD")}
                $active={directionFilter === "UNREAD"}
              >
                Unread
              </FilterButton>
              <FilterButton
                type="button"
                onClick={() => handleSetFilter("ALL")}
                $active={directionFilter === "ALL"}
              >
                All
              </FilterButton>
              <FilterButton
                type="button"
                onClick={() => handleSetFilter("INBOUND")}
                $active={directionFilter === "INBOUND"}
              >
                Inbound
              </FilterButton>
              <FilterButton
                type="button"
                onClick={() => handleSetFilter("OUTBOUND")}
                $active={directionFilter === "OUTBOUND"}
              >
                Outbound
              </FilterButton>
            </FilterRow>
          </PanelHeader>
          {renderList()}
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelHeaderLeft>
              <PanelTitle>Details</PanelTitle>
              <PanelSubtitle>
                {!selectedEmailId && "No selection"}
                {selectedEmailId && selectedEmailId}
              </PanelSubtitle>
            </PanelHeaderLeft>
          </PanelHeader>
          {renderDetail()}
        </Panel>
      </CommunicationsLayout>
    </PageLayout>
  )
}
