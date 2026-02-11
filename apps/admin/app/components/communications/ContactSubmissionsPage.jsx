"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import SectionNav from "@/components/ui/SectionNav"
import { useContactSubmissions } from "@/contexts/ContactSubmissionsContext"
import { useToast } from "@/contexts/ToastContext"
import ConfirmationModal from "@/components/ui/ConfirmationModal"
import { formatDate } from "@/utils/date"
import { getTrimmedSearchParamCaseInsensitive } from "@/utils/searchParams"
import {
  BodyBox,
  BodyText,
  CommunicationsLayout,
  DetailContainer,
  DetailGrid,
  DetailLabel,
  DetailValue,
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
  SecondaryButton,
  ToggleRow,
  UnreadDot,
  UserLink,
} from "@/components/communications/communicationsStyles"

export default function ContactSubmissionsPage() {
  const searchParams = useSearchParams()
  const {
    submissions,
    total,
    hasMore,
    hasLoadedOnce,
    selectedSubmissionId,
    selectedSubmission,
    isLoadingList,
    isLoadingMore,
    isLoadingSubmission,
    error,
    filter,
    lastRefreshedAt,
    loadMoreSubmissions,
    selectSubmission,
    setFilterValue,
    setSubmissionReadStatus,
    deleteSubmissionById,
    setUserId,
  } = useContactSubmissions()

  const { showErrorToast, showSuccessToast } = useToast()

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const normalizedUserId = useMemo(() => {
    return getTrimmedSearchParamCaseInsensitive(searchParams, "userId")
  }, [searchParams])

  useEffect(() => {
    setUserId(normalizedUserId)
  }, [normalizedUserId, setUserId])

  const listSubtitle = useMemo(() => {
    if (!hasLoadedOnce && isLoadingList) {
      return "Loading…"
    }

    let subtitleText = `${total} total`

    if (lastRefreshedAt) {
      subtitleText = `${subtitleText} • Updated ${formatDate(lastRefreshedAt)}`
    }

    if (normalizedUserId) {
      subtitleText = `${subtitleText} • User ${normalizedUserId}`
    }

    return subtitleText
  }, [hasLoadedOnce, isLoadingList, lastRefreshedAt, normalizedUserId, total])

  const handleSelectSubmission = (submissionId) => {
    selectSubmission(submissionId)
  }

  const handleSetFilter = (nextFilter) => {
    setFilterValue(nextFilter)
  }

  const renderList = () => {
    if (isLoadingList && submissions.length === 0) {
      return <EmptyState>Loading contact submissions…</EmptyState>
    }

    if (!submissions || submissions.length === 0) {
      return <EmptyState>No contact submissions yet.</EmptyState>
    }

    return (
      <EmailList>
        {submissions.map((submission) => {
          let subjectText = "(No subject)"
          if (submission.subject && String(submission.subject).trim()) {
            subjectText = String(submission.subject).trim()
          }

          const isActive = selectedSubmissionId === submission.id

          let isUnread = false
          if (!submission.readAt) {
            isUnread = true
          }

          const fromText = `${submission.name} <${submission.email}>`

          return (
            <EmailListItemButton
              key={submission.id}
              type="button"
              onClick={() => handleSelectSubmission(submission.id)}
              $active={isActive}
            >
              <EmailSubject>
                {isUnread && <UnreadDot />}
                {subjectText}
              </EmailSubject>
              <EmailMetaRow>
                <span>{fromText}</span>
                <span>{formatDate(submission.createdAt)}</span>
              </EmailMetaRow>
            </EmailListItemButton>
          )
        })}

        {hasMore && (
          <LoadMoreContainer>
            <SecondaryButton
              type="button"
              onClick={loadMoreSubmissions}
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
    if (!selectedSubmissionId) {
      return <EmptyState>Select a message to view details.</EmptyState>
    }

    if (isLoadingSubmission && !selectedSubmission) {
      return <EmptyState>Loading message…</EmptyState>
    }

    if (!selectedSubmission) {
      return <EmptyState>Message not found.</EmptyState>
    }

    let subjectText = "(No subject)"
    if (
      selectedSubmission.subject &&
      String(selectedSubmission.subject).trim()
    ) {
      subjectText = String(selectedSubmission.subject).trim()
    }

    let bodyText = "(No message)"
    if (
      selectedSubmission.message &&
      String(selectedSubmission.message).trim()
    ) {
      bodyText = String(selectedSubmission.message)
    }

    let userLink = null
    if (selectedSubmission.user && selectedSubmission.user.id) {
      userLink = (
        <UserLink href={`/users/${selectedSubmission.user.id}`}>
          Matched
        </UserLink>
      )
    }

    const handleToggleRead = async () => {
      let nextIsRead = true
      if (selectedSubmission.readAt) {
        nextIsRead = false
      }

      try {
        await setSubmissionReadStatus(selectedSubmission.id, nextIsRead)
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
    if (selectedSubmission.readAt) {
      readToggleText = "Mark unread"
    }

    const handleDeleteSubmission = async () => {
      if (!selectedSubmission) {
        return
      }

      try {
        setIsDeleting(true)
        await deleteSubmissionById(selectedSubmission.id)
        setDeleteModalOpen(false)
        showSuccessToast("Message deleted")
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

          <DetailLabel>From</DetailLabel>
          <DetailValue>
            {selectedSubmission.name} &lt;{selectedSubmission.email}&gt;
          </DetailValue>

          <DetailLabel>Received</DetailLabel>
          <DetailValue>{formatDate(selectedSubmission.createdAt)}</DetailValue>

          <DetailLabel>User</DetailLabel>
          <DetailValue>{userLink || "No match"}</DetailValue>
        </DetailGrid>

        <BodyBox>
          <BodyText>{bodyText}</BodyText>
        </BodyBox>

        <ToggleRow>
          <SecondaryButton type="button" onClick={handleToggleRead}>
            {readToggleText}
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete
          </SecondaryButton>
        </ToggleRow>

        {error && <EmptyState>Error: {error}</EmptyState>}

        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteSubmission}
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

  let detailsSubtitle = "No selection"
  if (selectedSubmissionId) {
    detailsSubtitle = selectedSubmissionId
  }

  return (
    <PageLayout>
      <SectionNav
        title="Communications"
        subtitle="Contact"
        links={[
          { href: "/communications/email", title: "Email", isActive: false },
          { href: "/communications/contact", title: "Contact", isActive: true },
          { href: "/communications/sms", title: "SMS", isActive: false },
        ]}
      />

      <CommunicationsLayout>
        <Panel>
          <PanelHeader>
            <PanelHeaderLeft>
              <PanelTitle>Messages</PanelTitle>
              <PanelSubtitle>{listSubtitle}</PanelSubtitle>
            </PanelHeaderLeft>
          </PanelHeader>

          <PanelHeader>
            <FilterRow>
              <FilterButton
                type="button"
                onClick={() => handleSetFilter("UNREAD")}
                $active={filter === "UNREAD"}
              >
                Unread
              </FilterButton>
              <FilterButton
                type="button"
                onClick={() => handleSetFilter("ALL")}
                $active={filter === "ALL"}
              >
                All
              </FilterButton>
            </FilterRow>
          </PanelHeader>
          {renderList()}
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelHeaderLeft>
              <PanelTitle>Details</PanelTitle>
              <PanelSubtitle>{detailsSubtitle}</PanelSubtitle>
            </PanelHeaderLeft>
          </PanelHeader>
          {renderDetail()}
        </Panel>
      </CommunicationsLayout>
    </PageLayout>
  )
}
