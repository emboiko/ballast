"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import PageLayout from "@/components/ui/PageLayout"
import { useToast } from "@/contexts/ToastContext"
import { useRefunds } from "@/contexts/RefundsContext"
import { formatMoney } from "@ballast/shared/src/money.js"
import { REFUNDS_PAGE_SIZE } from "@/constants"
import SectionNav from "@/components/ui/SectionNav"
import { formatStatusLabel } from "@/utils/formatStatusLabel"
import { getTrimmedSearchParamCaseInsensitive } from "@/utils/searchParams"
import {
  RefundsContainer,
  RefundsFiltersRow,
  RefundFilterChip,
  RefundFilterCount,
  RefundsList,
  RefundsListFooter,
  RefundRowLink,
  RefundRowCell,
  RefundRowTitle,
  RefundRowSubtext,
  RefundStatusBadge,
  RefundEmptyState,
  RefundButton,
} from "@/components/refunds/refundStyles"

export default function RefundsPage() {
  const toast = useToast()
  const { fetchRefunds } = useRefunds()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("pending")
  const [refunds, setRefunds] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [statusCounts, setStatusCounts] = useState({
    pending: null,
    approved: null,
    rejected: null,
    failed: null,
  })

  const hasMore = refunds.length < total

  const normalizedUserId = useMemo(() => {
    return getTrimmedSearchParamCaseInsensitive(searchParams, "userId")
  }, [searchParams])

  const loadStatusCounts = useCallback(async () => {
    try {
      const [pending, approved, rejected, failed] = await Promise.all([
        fetchRefunds({
          status: "pending",
          limit: 1,
          offset: 0,
          userId: normalizedUserId || undefined,
        }),
        fetchRefunds({
          status: "approved",
          limit: 1,
          offset: 0,
          userId: normalizedUserId || undefined,
        }),
        fetchRefunds({
          status: "rejected",
          limit: 1,
          offset: 0,
          userId: normalizedUserId || undefined,
        }),
        fetchRefunds({
          status: "failed",
          limit: 1,
          offset: 0,
          userId: normalizedUserId || undefined,
        }),
      ])

      setStatusCounts({
        pending: pending.total || 0,
        approved: approved.total || 0,
        rejected: rejected.total || 0,
        failed: failed.total || 0,
      })
    } catch (error) {
      toast.showErrorToast(error.message || "Failed to load refund counts")
    }
  }, [fetchRefunds, normalizedUserId, toast])

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchRefunds({
        status,
        limit: REFUNDS_PAGE_SIZE,
        offset: 0,
        userId: normalizedUserId || undefined,
      })
      setRefunds(data.refunds || [])
      setTotal(data.total || 0)
      setOffset((data.refunds || []).length)

      setStatusCounts((previous) => {
        return {
          ...previous,
          [status]: data.total || 0,
        }
      })
    } catch (error) {
      toast.showErrorToast(error.message || "Failed to load refunds")
    } finally {
      setIsLoading(false)
    }
  }, [status, toast, normalizedUserId])

  useEffect(() => {
    loadFirstPage()
  }, [loadFirstPage])

  useEffect(() => {
    loadStatusCounts()
  }, [loadStatusCounts])

  const loadMore = async () => {
    if (isLoadingMore) {
      return
    }
    if (!hasMore) {
      return
    }

    setIsLoadingMore(true)
    try {
      const data = await fetchRefunds({
        status,
        limit: REFUNDS_PAGE_SIZE,
        offset,
        userId: normalizedUserId || undefined,
      })
      const nextRefunds = data.refunds || []
      setRefunds((prev) => [...prev, ...nextRefunds])
      setTotal(data.total || total)
      setOffset(offset + nextRefunds.length)
    } catch (error) {
      toast.showErrorToast(error.message || "Failed to load more refunds")
    } finally {
      setIsLoadingMore(false)
    }
  }

  const filterChips = useMemo(() => {
    return [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
      { value: "failed", label: "Failed" },
    ]
  }, [])

  let subtitleText = "Review and process refund requests"
  if (status) {
    subtitleText = `Showing ${formatStatusLabel(status)} refund requests`
  }
  if (normalizedUserId) {
    subtitleText = `${subtitleText} for user ${normalizedUserId}`
  }

  let loadMoreButtonLabel = "Load more"
  if (isLoadingMore) {
    loadMoreButtonLabel = "Loading..."
  } else if (!hasMore) {
    loadMoreButtonLabel = "No more"
  }

  return (
    <PageLayout>
      <RefundsContainer>
        <SectionNav title="Refunds" subtitle={subtitleText} />

        <RefundsFiltersRow>
          {filterChips.map((chip) => {
            const isActive = chip.value === status

            let countLabel = "(—)"
            const countValue = statusCounts[chip.value]
            if (typeof countValue === "number") {
              countLabel = `(${countValue})`
            }

            return (
              <RefundFilterChip
                key={chip.value}
                $isActive={isActive}
                onClick={() => {
                  setStatus(chip.value)
                  setOffset(0)
                }}
              >
                <span>{chip.label}</span>
                <RefundFilterCount>{countLabel}</RefundFilterCount>
              </RefundFilterChip>
            )
          })}
        </RefundsFiltersRow>

        <RefundsList>
          {isLoading && <RefundEmptyState>Loading refunds...</RefundEmptyState>}

          {!isLoading && refunds.length === 0 && (
            <RefundEmptyState>No refunds found.</RefundEmptyState>
          )}

          {!isLoading &&
            refunds.map((refund) => {
              const orderAmountCents = refund?.order?.amountCents
              let orderAmountLabel = ""
              if (typeof orderAmountCents === "number") {
                orderAmountLabel = formatMoney(orderAmountCents)
              }

              const orderId = refund?.order?.id || ""
              const userEmail = refund?.requestedByUser?.email || ""
              const processor = refund?.order?.processor || ""
              const createdAt = refund?.createdAt
              let createdAtLabel = ""
              if (createdAt) {
                createdAtLabel = new Date(createdAt).toLocaleDateString()
              }

              return (
                <RefundRowLink
                  key={refund.id}
                  as={Link}
                  href={`/refunds/${refund.id}`}
                >
                  <RefundRowCell>
                    <RefundRowTitle>
                      {formatStatusLabel(refund.status)}
                    </RefundRowTitle>
                    <RefundRowSubtext>{createdAtLabel}</RefundRowSubtext>
                  </RefundRowCell>

                  <RefundRowCell>
                    <RefundRowTitle>{refund.id}</RefundRowTitle>
                    <RefundRowSubtext>
                      Order: {orderId} • {userEmail}
                    </RefundRowSubtext>
                  </RefundRowCell>

                  <RefundRowCell>
                    <RefundRowTitle>{orderAmountLabel}</RefundRowTitle>
                    <RefundRowSubtext>{processor}</RefundRowSubtext>
                  </RefundRowCell>

                  <RefundRowCell>
                    <RefundStatusBadge $status={refund.status}>
                      {formatStatusLabel(refund.status)}
                    </RefundStatusBadge>
                  </RefundRowCell>
                </RefundRowLink>
              )
            })}

          {!isLoading && refunds.length > 0 && hasMore && (
            <RefundsListFooter>
              <RefundButton
                as="button"
                type="button"
                disabled={!hasMore || isLoadingMore}
                onClick={loadMore}
              >
                {loadMoreButtonLabel}
              </RefundButton>
            </RefundsListFooter>
          )}
        </RefundsList>
      </RefundsContainer>
    </PageLayout>
  )
}
