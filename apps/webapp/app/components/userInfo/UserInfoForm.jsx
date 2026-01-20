import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ButtonPrimary, FormError } from "@/components/ui/uiStyles"
import FullNameField from "@/components/userInfo/fields/FullNameField"
import PhoneNumberField from "@/components/userInfo/fields/PhoneNumberField"
import BillingAddressLine1Field from "@/components/userInfo/fields/BillingAddressLine1Field"
import BillingAddressLine2Field from "@/components/userInfo/fields/BillingAddressLine2Field"
import BillingCityField from "@/components/userInfo/fields/BillingCityField"
import BillingRegionField from "@/components/userInfo/fields/BillingRegionField"
import BillingPostalCodeField from "@/components/userInfo/fields/BillingPostalCodeField"
import BillingCountryField from "@/components/userInfo/fields/BillingCountryField"
import {
  UserInfoActions,
  UserInfoContainer,
  UserInfoDescription,
  UserInfoFormLayout,
  UserInfoGrid,
  UserInfoHeader,
  UserInfoHelperText,
  UserInfoSuccessText,
  UserInfoTitle,
} from "@/components/userInfo/userInfoStyles"
import { formatPhoneNumber, normalizePhoneNumber } from "@/utils/phone"

const capitalizeWords = (value) => {
  if (typeof value !== "string") {
    return ""
  }

  return value.replace(/\b([A-Za-z])([A-Za-z']*)/g, (match, first, rest) => {
    return `${first.toUpperCase()}${rest.toLowerCase()}`
  })
}

const buildInitialValues = (user) => {
  return {
    fullName: capitalizeWords(user?.fullName || ""),
    phoneNumber: user?.phoneNumber || "",
    billingAddressLine1: capitalizeWords(user?.billingAddressLine1 || ""),
    billingAddressLine2: capitalizeWords(user?.billingAddressLine2 || ""),
    billingCity: capitalizeWords(user?.billingCity || ""),
    billingRegion: (user?.billingRegion || "").toUpperCase(),
    billingPostalCode: user?.billingPostalCode || "",
    billingCountry: (user?.billingCountry || "").toUpperCase(),
  }
}

const UserInfoForm = ({
  title = "User Info",
  description = "Update your name, phone number, and billing address.",
  isNameRequired = false,
  isAddressRequired = false,
  isPhoneRequired = false,
  submitLabel = "Save details",
  showHeader = true,
  showSuccessMessage = true,
  onSaveSuccess = null,
}) => {
  const { user, updateUserInfo } = useAuth()
  const [formValues, setFormValues] = useState(() => buildInitialValues(user))
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setFormValues(buildInitialValues(user))
  }, [user])

  const updateField = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhoneChange = (event) => {
    const digits = normalizePhoneNumber(event.target.value)
    updateField("phoneNumber", digits)
  }

  const handleCountryChange = (event) => {
    updateField("billingCountry", event.target.value.toUpperCase())
  }

  const handleFullNameChange = (event) => {
    updateField("fullName", capitalizeWords(event.target.value))
  }

  const handleAddressLine1Change = (event) => {
    updateField("billingAddressLine1", capitalizeWords(event.target.value))
  }

  const handleAddressLine2Change = (event) => {
    updateField("billingAddressLine2", capitalizeWords(event.target.value))
  }

  const handleCityChange = (event) => {
    updateField("billingCity", capitalizeWords(event.target.value))
  }

  const handleRegionChange = (event) => {
    updateField("billingRegion", event.target.value.toUpperCase())
  }

  const isValidFullName = (value) => {
    if (typeof value !== "string") {
      return false
    }

    const trimmed = value.trim()
    if (!trimmed) {
      return false
    }

    const words = trimmed.split(/\s+/).filter(Boolean)
    if (words.length < 2) {
      return false
    }
    if (words.length > 2) {
      return false
    }

    const wordRegex = /^[A-Za-z][A-Za-z'.-]*$/
    for (const word of words) {
      if (word.length < 2) {
        return false
      }
      if (!wordRegex.test(word)) {
        return false
      }
    }

    return true
  }

  const isValidPostalCode = (value) => {
    if (typeof value !== "string") {
      return false
    }

    const trimmed = value.trim()
    if (!trimmed) {
      return false
    }

    if (trimmed.length < 3 || trimmed.length > 10) {
      return false
    }

    const postalRegex = /^\d{3,10}(-\d{1,10})?$/
    return postalRegex.test(trimmed)
  }

  const isValidRegion = (value) => {
    if (typeof value !== "string") {
      return false
    }

    const trimmed = value.trim()
    if (!trimmed) {
      return false
    }

    const regionRegex = /^[A-Za-z][A-Za-z'. -]*$/
    return regionRegex.test(trimmed)
  }

  const getValidationError = () => {
    if (isNameRequired && !formValues.fullName.trim()) {
      return "Full name is required"
    }

    if (formValues.fullName.trim() && !isValidFullName(formValues.fullName)) {
      return "Enter your full name (first and last name)"
    }

    if (isAddressRequired && !formValues.billingAddressLine1.trim()) {
      return "Address line 1 is required"
    }

    if (
      formValues.billingAddressLine1.trim() &&
      formValues.billingAddressLine1.trim().length < 3
    ) {
      return "Address line 1 is too short"
    }

    if (isAddressRequired && !formValues.billingCity.trim()) {
      return "City is required"
    }

    if (isAddressRequired && !formValues.billingRegion.trim()) {
      return "State or region is required"
    }

    if (
      formValues.billingRegion.trim() &&
      !isValidRegion(formValues.billingRegion)
    ) {
      return "State or region looks invalid"
    }

    if (isAddressRequired && !formValues.billingPostalCode.trim()) {
      return "Postal code is required"
    }

    if (
      formValues.billingPostalCode.trim() &&
      !isValidPostalCode(formValues.billingPostalCode)
    ) {
      return "Postal code looks invalid"
    }

    if (isAddressRequired && !formValues.billingCountry.trim()) {
      return "Country is required"
    }

    if (isPhoneRequired && !formValues.phoneNumber.trim()) {
      return "Phone number is required"
    }

    if (formValues.phoneNumber && formValues.phoneNumber.length !== 10) {
      return "Phone number must be 10 digits"
    }

    if (formValues.billingCountry && formValues.billingCountry.length !== 2) {
      return "Country must be a 2-letter code"
    }

    return ""
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setSuccessMessage("")

    const validationError = getValidationError()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)

    const payload = {
      fullName: formValues.fullName,
      phoneNumber: formValues.phoneNumber,
      billingAddressLine1: formValues.billingAddressLine1,
      billingAddressLine2: formValues.billingAddressLine2,
      billingCity: formValues.billingCity,
      billingRegion: formValues.billingRegion,
      billingPostalCode: formValues.billingPostalCode,
      billingCountry: formValues.billingCountry,
    }

    const result = await updateUserInfo(payload)

    if (!result.success) {
      setError(result.error || "Failed to update details")
      setIsSaving(false)
      return
    }

    setSuccessMessage("Details saved")
    setIsSaving(false)

    if (typeof onSaveSuccess === "function") {
      onSaveSuccess(result.user)
    }
  }

  let helperText = null
  if (isNameRequired || isAddressRequired || isPhoneRequired) {
    helperText = "Required for checkout"
  }

  let buttonLabel = submitLabel
  if (isSaving) {
    buttonLabel = "Saving..."
  }

  const phoneTooltipText =
    "We use your phone number to provide better customer service. It is required for service purchases so we can contact you about your service."

  return (
    <UserInfoContainer>
      {showHeader && (
        <UserInfoHeader>
          <UserInfoTitle>{title}</UserInfoTitle>
          <UserInfoDescription>{description}</UserInfoDescription>
        </UserInfoHeader>
      )}

      <UserInfoFormLayout onSubmit={handleSubmit}>
        <UserInfoGrid>
          <FullNameField
            value={formValues.fullName}
            onChange={handleFullNameChange}
            isRequired={isNameRequired}
            isDisabled={isSaving}
          />
          <PhoneNumberField
            value={formatPhoneNumber(formValues.phoneNumber)}
            onChange={handlePhoneChange}
            isRequired={isPhoneRequired}
            isDisabled={isSaving}
            tooltipText={phoneTooltipText}
          />
          <BillingAddressLine1Field
            value={formValues.billingAddressLine1}
            onChange={handleAddressLine1Change}
            isRequired={isAddressRequired}
            isDisabled={isSaving}
          />
          <BillingAddressLine2Field
            value={formValues.billingAddressLine2}
            onChange={handleAddressLine2Change}
            isDisabled={isSaving}
          />
          <BillingCityField
            value={formValues.billingCity}
            onChange={handleCityChange}
            isRequired={isAddressRequired}
            isDisabled={isSaving}
          />
          <BillingRegionField
            value={formValues.billingRegion}
            onChange={handleRegionChange}
            isRequired={isAddressRequired}
            isDisabled={isSaving}
          />
          <BillingPostalCodeField
            value={formValues.billingPostalCode}
            onChange={(event) =>
              updateField("billingPostalCode", event.target.value)
            }
            isRequired={isAddressRequired}
            isDisabled={isSaving}
          />
          <BillingCountryField
            value={formValues.billingCountry}
            onChange={handleCountryChange}
            isRequired={isAddressRequired}
            isDisabled={isSaving}
          />
        </UserInfoGrid>

        <FormError>{error}</FormError>

        <UserInfoActions>
          <ButtonPrimary as="button" type="submit" disabled={isSaving}>
            {buttonLabel}
          </ButtonPrimary>
          {showSuccessMessage && successMessage && (
            <UserInfoSuccessText>{successMessage}</UserInfoSuccessText>
          )}
          {helperText && <UserInfoHelperText>{helperText}</UserInfoHelperText>}
        </UserInfoActions>
      </UserInfoFormLayout>
    </UserInfoContainer>
  )
}

export default UserInfoForm
