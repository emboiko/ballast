"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { submitContact } from "@/gateways/contactGateway"
import {
  ContentPage,
  ContentTitle,
  ContentSection,
  ContentParagraph,
  ContentInlineLink,
  SuccessMessage,
  FormHelpText,
  OptionalLabel,
  ReadOnlyInput,
  Spacer,
} from "@/components/ui/uiStyles"
import { ButtonPrimary, FormGroup, FormError } from "@/components/ui/uiStyles"
import { TurnstileContainer } from "@/components/auth/authStyles"
import {
  SUPPORT_PHONE_NUMBER,
  SUPPORT_PHONE_TEL_HREF,
  TURNSTILE_SITE_KEY,
  TURNSTILE_SCRIPT_URL,
} from "@/constants.js"

export default function Contact() {
  const { isAuthenticated, user } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState(user?.email || "")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const turnstileRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName)
    }
  }, [user])

  useEffect(() => {
    if (
      !TURNSTILE_SITE_KEY ||
      typeof window === "undefined" ||
      isAuthenticated
    ) {
      return
    }

    const renderWidget = () => {
      if (
        window.turnstile &&
        turnstileRef.current &&
        widgetIdRef.current === null
      ) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => setTurnstileToken(token),
        })
      }
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      const existingScript = document.querySelector(
        `script[src="${TURNSTILE_SCRIPT_URL}"]`
      )

      if (existingScript) {
        existingScript.addEventListener("load", renderWidget)
      } else {
        const script = document.createElement("script")
        script.src = TURNSTILE_SCRIPT_URL
        script.async = true
        script.defer = true
        script.onload = renderWidget
        document.head.appendChild(script)
      }
    }

    return () => {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [isAuthenticated])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setSuccess(false)

    if (!name.trim()) {
      setError("Name is required")
      return
    }

    if (name.length > 200) {
      setError("Name must be 200 characters or less")
      return
    }

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (email.length > 255) {
      setError("Email must be 255 characters or less")
      return
    }

    if (subject && subject.length > 500) {
      setError("Subject must be 500 characters or less")
      return
    }

    if (!message.trim()) {
      setError("Message is required")
      return
    }

    if (message.length > 5000) {
      setError("Message must be 5000 characters or less")
      return
    }

    if (!isAuthenticated && TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the captcha verification")
      return
    }

    setIsSubmitting(true)

    try {
      await submitContact(
        name.trim(),
        email.trim(),
        subject.trim() || null,
        message.trim(),
        turnstileToken || null
      )

      setSuccess(true)
      setName("")
      setSubject("")
      setMessage("")
      setTurnstileToken("")
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    } catch (err) {
      setError(err.message || "Failed to submit contact form")
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current)
      }
      setIsSubmitting(false)
    }
  }

  const getSubmitButtonLabel = () => {
    if (success) {
      return "Submitted"
    }

    if (isSubmitting) {
      return "Submitting..."
    }

    return "Send Message"
  }

  let supportPhoneContent = null
  if (SUPPORT_PHONE_NUMBER) {
    if (SUPPORT_PHONE_TEL_HREF) {
      supportPhoneContent = (
        <>
          You can also call us at{" "}
          <ContentInlineLink href={SUPPORT_PHONE_TEL_HREF}>
            {SUPPORT_PHONE_NUMBER}
          </ContentInlineLink>
          .
        </>
      )
    } else {
      supportPhoneContent = <>You can also call us at {SUPPORT_PHONE_NUMBER}.</>
    }
  }

  let supportPhoneParagraph = null
  if (supportPhoneContent) {
    supportPhoneParagraph = (
      <ContentParagraph>{supportPhoneContent}</ContentParagraph>
    )
  }

  return (
    <ContentPage>
      <ContentTitle>Contact Us</ContentTitle>

      <ContentSection>
        <ContentParagraph>
          Have a question about our retroencabulation services? Need help with
          your hydrocoptic marzelvane systems? We're here to help! Fill out the
          form below and we'll get back to you as soon as possible.
        </ContentParagraph>
        {supportPhoneParagraph}
      </ContentSection>

      <ContentSection>
        <form onSubmit={handleSubmit}>
          {error && <FormError>{error}</FormError>}
          {success && (
            <SuccessMessage>
              Thank you for contacting us! We'll get back to you soon.
            </SuccessMessage>
          )}

          <FormGroup>
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting || success}
              maxLength={200}
              autoComplete="name"
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="contact-email">Email</label>
            {isAuthenticated ? (
              <ReadOnlyInput
                id="contact-email"
                type="email"
                value={email}
                required
                disabled
                maxLength={255}
                autoComplete="email"
                readOnly
              />
            ) : (
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting || success}
                maxLength={255}
                autoComplete="email"
              />
            )}
            {isAuthenticated && (
              <FormHelpText>
                Your account email is required for logged-in submissions.
              </FormHelpText>
            )}
          </FormGroup>

          <FormGroup>
            <label htmlFor="contact-subject">
              Subject <OptionalLabel>(optional)</OptionalLabel>
            </label>
            <input
              id="contact-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSubmitting || success}
              maxLength={500}
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={isSubmitting || success}
              maxLength={5000}
              rows={8}
            />
          </FormGroup>

          {!isAuthenticated && TURNSTILE_SITE_KEY && (
            <>
              <Spacer $height="1.5rem" />
              <FormGroup as={TurnstileContainer}>
                <div ref={turnstileRef} tabIndex={-1}></div>
              </FormGroup>
            </>
          )}

          <Spacer $height="1.5rem" />

          <ButtonPrimary
            as="button"
            type="submit"
            disabled={isSubmitting || success}
          >
            {getSubmitButtonLabel()}
          </ButtonPrimary>
        </form>
      </ContentSection>
    </ContentPage>
  )
}
