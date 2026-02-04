"use client"

import Link from "next/link"
import { formatMoney } from "@ballast/shared/src/money.js"
import { formatStatusLabel } from "@/utils/formatStatusLabel"
import {
  SearchSection,
  SearchSectionHeader,
  SearchSectionCount,
  SearchResultsList,
  SearchResultItem,
  SearchResultLink,
  ResultIcon,
  ResultInfo,
  ResultTitle,
  ResultSubtitle,
  ResultBadge,
} from "@/components/search/searchStyles"

const formatPlural = (count, singular, plural) => {
  if (count === 1) {
    return `${count} ${singular}`
  }

  return `${count} ${plural}`
}

export function UserResultItem({ user, onClick }) {
  const ordersLabel = formatPlural(user.orderCount, "order", "orders")

  let adminLabel = ""
  if (user.isAdmin) {
    adminLabel = " • Admin"
  }

  return (
    <SearchResultItem>
      <SearchResultLink as={Link} href={`/users/${user.id}`} onClick={onClick}>
        <ResultIcon>👤</ResultIcon>
        <ResultInfo>
          <ResultTitle>{user.email}</ResultTitle>
          <ResultSubtitle>
            ID: {user.id} • {ordersLabel}
            {adminLabel}
          </ResultSubtitle>
        </ResultInfo>
        {!user.emailVerified && (
          <ResultBadge $status="pending">Unverified</ResultBadge>
        )}
      </SearchResultLink>
    </SearchResultItem>
  )
}

export function OrderResultItem({ order, onClick }) {
  const formattedAmount = formatMoney(order.amountCents, order.currency)
  const formattedDate = new Date(order.createdAt).toLocaleDateString()

  return (
    <SearchResultItem>
      <SearchResultLink
        as={Link}
        href={`/orders/${order.id}`}
        onClick={onClick}
      >
        <ResultIcon>📦</ResultIcon>
        <ResultInfo>
          <ResultTitle>{order.id}</ResultTitle>
          <ResultSubtitle>
            {order.user.email} • {formattedAmount} • {formattedDate}
          </ResultSubtitle>
        </ResultInfo>
        <ResultBadge $status={order.status}>{order.status}</ResultBadge>
      </SearchResultLink>
    </SearchResultItem>
  )
}

export function RefundResultItem({ refund, onClick }) {
  const formattedDate = new Date(refund.createdAt).toLocaleDateString()

  let amountLabel = "Amount pending"
  if (typeof refund.amountCents === "number") {
    amountLabel = formatMoney(refund.amountCents, refund.currency)
  }

  let userEmailLabel = "Unknown user"
  if (refund.requestedByUser?.email) {
    userEmailLabel = refund.requestedByUser.email
  }

  const subtitleParts = [userEmailLabel, amountLabel, formattedDate]
  if (refund.orderId) {
    subtitleParts.splice(1, 0, `Order: ${refund.orderId}`)
  }

  let statusLabel = refund.status
  if (refund.status) {
    statusLabel = formatStatusLabel(refund.status)
  }

  return (
    <SearchResultItem>
      <SearchResultLink
        as={Link}
        href={`/refunds/${refund.id}`}
        onClick={onClick}
      >
        <ResultIcon>💸</ResultIcon>
        <ResultInfo>
          <ResultTitle>{refund.id}</ResultTitle>
          <ResultSubtitle>{subtitleParts.join(" • ")}</ResultSubtitle>
        </ResultInfo>
        <ResultBadge $status={refund.status}>{statusLabel}</ResultBadge>
      </SearchResultLink>
    </SearchResultItem>
  )
}

export function FinancingResultItem({ plan, onClick }) {
  const formattedTotal = formatMoney(plan.totalAmountCents, plan.currency)
  const formattedRemaining = formatMoney(
    plan.remainingBalanceCents,
    plan.currency
  )
  const formattedDate = new Date(plan.createdAt).toLocaleDateString()

  let userEmailLabel = "Unknown user"
  if (plan.user?.email) {
    userEmailLabel = plan.user.email
  }

  const subtitleParts = [
    userEmailLabel,
    `Total: ${formattedTotal}`,
    `Remaining: ${formattedRemaining}`,
    formattedDate,
  ]

  let statusLabel = plan.status
  if (plan.status) {
    statusLabel = formatStatusLabel(plan.status)
  }

  return (
    <SearchResultItem>
      <SearchResultLink
        as={Link}
        href={`/financing/${plan.id}`}
        onClick={onClick}
      >
        <ResultIcon>💳</ResultIcon>
        <ResultInfo>
          <ResultTitle>{plan.id}</ResultTitle>
          <ResultSubtitle>{subtitleParts.join(" • ")}</ResultSubtitle>
        </ResultInfo>
        <ResultBadge $status={plan.status}>{statusLabel}</ResultBadge>
      </SearchResultLink>
    </SearchResultItem>
  )
}

export function UsersSection({ users, total, onResultClick }) {
  if (!users || users.length === 0) {
    return null
  }

  return (
    <SearchSection>
      <SearchSectionHeader>
        Users
        <SearchSectionCount>{total} found</SearchSectionCount>
      </SearchSectionHeader>
      <SearchResultsList>
        {users.map((user) => (
          <UserResultItem key={user.id} user={user} onClick={onResultClick} />
        ))}
      </SearchResultsList>
    </SearchSection>
  )
}

export function OrdersSection({ orders, total, onResultClick }) {
  if (!orders || orders.length === 0) {
    return null
  }

  return (
    <SearchSection>
      <SearchSectionHeader>
        Orders
        <SearchSectionCount>{total} found</SearchSectionCount>
      </SearchSectionHeader>
      <SearchResultsList>
        {orders.map((order) => (
          <OrderResultItem
            key={order.id}
            order={order}
            onClick={onResultClick}
          />
        ))}
      </SearchResultsList>
    </SearchSection>
  )
}

export function RefundsSection({ refunds, total, onResultClick }) {
  if (!refunds || refunds.length === 0) {
    return null
  }

  return (
    <SearchSection>
      <SearchSectionHeader>
        Refunds
        <SearchSectionCount>{total} found</SearchSectionCount>
      </SearchSectionHeader>
      <SearchResultsList>
        {refunds.map((refund) => (
          <RefundResultItem
            key={refund.id}
            refund={refund}
            onClick={onResultClick}
          />
        ))}
      </SearchResultsList>
    </SearchSection>
  )
}

export function FinancingSection({ plans, total, onResultClick }) {
  if (!plans || plans.length === 0) {
    return null
  }

  return (
    <SearchSection>
      <SearchSectionHeader>
        Financing
        <SearchSectionCount>{total} found</SearchSectionCount>
      </SearchSectionHeader>
      <SearchResultsList>
        {plans.map((plan) => (
          <FinancingResultItem
            key={plan.id}
            plan={plan}
            onClick={onResultClick}
          />
        ))}
      </SearchResultsList>
    </SearchSection>
  )
}
