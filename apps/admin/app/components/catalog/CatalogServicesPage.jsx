"use client"

import { useEffect, useMemo, useState } from "react"
import { formatMoney } from "@ballast/shared/src/money.js"
import PageLayout from "@/components/ui/PageLayout"
import SectionNav from "@/components/ui/SectionNav"
import { useCatalog } from "@/contexts/CatalogContext"
import { useToast } from "@/contexts/ToastContext"
import {
  CatalogLayout,
  CatalogPanel,
  CatalogPanelHeader,
  CatalogPanelTitle,
  CatalogPanelBody,
  CatalogForm,
  FormGrid,
  CatalogFormSection,
  CatalogFormSectionTitle,
  FormField,
  FormFieldLabelRow,
  FormFieldLabel,
  FormFieldHint,
  TextInput,
  TextArea,
  CheckboxRow,
  CheckboxInput,
  FormActions,
  FormActionsButtons,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  CatalogList,
  CatalogItemCard,
  CatalogItemHeader,
  CatalogItemTitle,
  CatalogItemMeta,
  CatalogItemBadge,
  CatalogItemActions,
  EmptyState,
  InlineError,
  FilterRow,
  FilterChip,
} from "@/components/catalog/catalogStyles"
import CatalogImageManager from "@/components/catalog/CatalogImageManager"

const defaultFormValues = {
  name: "",
  slug: "",
  description: "",
  longDescription: "",
  priceCents: "",
  isActive: false,
  monthlyEnabled: true,
  monthlyPriceCents: "",
  quarterlyEnabled: true,
  quarterlyPriceCents: "",
  semiAnnualEnabled: true,
  semiAnnualPriceCents: "",
  annualEnabled: true,
  annualPriceCents: "",
}

const buildPayload = (values) => {
  const payload = {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    isActive: values.isActive,
  }

  const monthlyPriceCentsValue = Number.parseInt(values.monthlyPriceCents, 10)
  if (!Number.isNaN(monthlyPriceCentsValue)) {
    payload.priceCents = monthlyPriceCentsValue
  } else {
    const priceCentsValue = Number.parseInt(values.priceCents, 10)
    if (!Number.isNaN(priceCentsValue)) {
      payload.priceCents = priceCentsValue
    }
  }

  const quarterlyPriceCentsValue = Number.parseInt(
    values.quarterlyPriceCents,
    10
  )
  const semiAnnualPriceCentsValue = Number.parseInt(
    values.semiAnnualPriceCents,
    10
  )
  const annualPriceCentsValue = Number.parseInt(values.annualPriceCents, 10)

  const intervalPrices = [
    {
      interval: "MONTHLY",
      priceCents: monthlyPriceCentsValue,
      isEnabled: values.monthlyEnabled === true,
    },
    {
      interval: "QUARTERLY",
      priceCents: quarterlyPriceCentsValue,
      isEnabled: values.quarterlyEnabled === true,
    },
    {
      interval: "SEMI_ANNUAL",
      priceCents: semiAnnualPriceCentsValue,
      isEnabled: values.semiAnnualEnabled === true,
    },
    {
      interval: "ANNUAL",
      priceCents: annualPriceCentsValue,
      isEnabled: values.annualEnabled === true,
    },
  ].filter((item) => !Number.isNaN(item.priceCents))

  if (intervalPrices.length > 0) {
    payload.intervalPrices = intervalPrices
  }

  if (values.longDescription.trim()) {
    payload.longDescription = values.longDescription.trim()
  } else {
    payload.longDescription = null
  }

  return payload
}

const getPriceHintText = (value) => {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    return formatMoney(0)
  }
  return formatMoney(parsed)
}

const sanitizeNonNegativeNumberInput = (value) => {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return ""
  }
  return trimmedValue.replace(/[^0-9]/g, "")
}

const applyDiscountBasisPoints = (amountCents, discountBasisPoints) => {
  const multiplierBasisPoints = 10000 - discountBasisPoints
  return Math.floor((amountCents * multiplierBasisPoints + 5000) / 10000)
}

const syncIntervalPricingFromMonthly = (
  currentValues,
  monthlyPriceCentsString
) => {
  const normalizedMonthly = monthlyPriceCentsString

  if (!normalizedMonthly) {
    return {
      ...currentValues,
      priceCents: "",
      monthlyPriceCents: "",
      quarterlyPriceCents: "",
      semiAnnualPriceCents: "",
      annualPriceCents: "",
    }
  }

  const monthlyPriceCents = Number.parseInt(normalizedMonthly, 10)
  if (Number.isNaN(monthlyPriceCents) || monthlyPriceCents < 0) {
    return {
      ...currentValues,
      priceCents: normalizedMonthly,
      monthlyPriceCents: normalizedMonthly,
    }
  }

  return {
    ...currentValues,
    priceCents: String(monthlyPriceCents),
    monthlyPriceCents: String(monthlyPriceCents),
    quarterlyPriceCents: String(
      applyDiscountBasisPoints(monthlyPriceCents * 3, 500)
    ),
    semiAnnualPriceCents: String(
      applyDiscountBasisPoints(monthlyPriceCents * 6, 1000)
    ),
    annualPriceCents: String(
      applyDiscountBasisPoints(monthlyPriceCents * 12, 1000)
    ),
  }
}

const mapServiceToFormValues = (service) => {
  const intervalPrices = Array.isArray(service.intervalPrices)
    ? service.intervalPrices
    : []

  const getInterval = (
    interval,
    fallbackMultiplier,
    discountBasisPoints = 0
  ) => {
    const match = intervalPrices.find((item) => item.interval === interval)
    if (match && typeof match.priceCents === "number") {
      return {
        isEnabled: match.isEnabled === true,
        priceCents: String(match.priceCents),
      }
    }
    if (typeof service.priceCents === "number") {
      const undiscountedPriceCents = service.priceCents * fallbackMultiplier
      return {
        isEnabled: true,
        priceCents: String(
          applyDiscountBasisPoints(undiscountedPriceCents, discountBasisPoints)
        ),
      }
    }
    return { isEnabled: true, priceCents: "" }
  }

  const monthly = getInterval("MONTHLY", 1, 0)
  const quarterly = getInterval("QUARTERLY", 3, 500)
  const semiAnnual = getInterval("SEMI_ANNUAL", 6, 1000)
  const annual = getInterval("ANNUAL", 12, 1000)

  const priceCents = monthly.priceCents

  return {
    name: service.name || "",
    slug: service.slug || "",
    description: service.description || "",
    longDescription: service.longDescription || "",
    priceCents,
    isActive: service.isActive !== false,
    monthlyEnabled: monthly.isEnabled,
    monthlyPriceCents: monthly.priceCents,
    quarterlyEnabled: quarterly.isEnabled,
    quarterlyPriceCents: quarterly.priceCents,
    semiAnnualEnabled: semiAnnual.isEnabled,
    semiAnnualPriceCents: semiAnnual.priceCents,
    annualEnabled: annual.isEnabled,
    annualPriceCents: annual.priceCents,
  }
}

export default function CatalogServicesPage() {
  const {
    services,
    isLoadingServices,
    error,
    fetchServices,
    createService,
    uploadServiceImages,
    updateServiceImages,
    deleteServiceImage,
    updateService,
    deleteService,
  } = useCatalog()
  const { showErrorToast, showSuccessToast } = useToast()

  const [statusFilter, setStatusFilter] = useState("all")
  const [newValues, setNewValues] = useState(defaultFormValues)
  const [editingId, setEditingId] = useState(null)
  const [editingValues, setEditingValues] = useState(defaultFormValues)
  const [isCreating, setIsCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [uploadingServiceId, setUploadingServiceId] = useState(null)

  useEffect(() => {
    fetchServices({ status: statusFilter }).catch((err) => {
      showErrorToast(err.message)
    })
  }, [fetchServices, showErrorToast, statusFilter])

  const filterOptions = useMemo(() => {
    return [
      { label: "All", value: "all" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ]
  }, [])

  const resetNewForm = () => {
    setNewValues(defaultFormValues)
  }

  const validateRequired = (values) => {
    if (!values.name.trim()) {
      return "Name is required"
    }
    if (!values.slug.trim()) {
      return "Slug is required"
    }
    if (!values.description.trim()) {
      return "Description is required"
    }
    if (!values.priceCents.trim()) {
      return "Price (cents) is required"
    }
    if (!values.monthlyPriceCents.trim()) {
      return "Monthly price (cents) is required"
    }
    if (!values.quarterlyPriceCents.trim()) {
      return "Quarterly price (cents) is required"
    }
    if (!values.semiAnnualPriceCents.trim()) {
      return "6-month price (cents) is required"
    }
    if (!values.annualPriceCents.trim()) {
      return "12-month price (cents) is required"
    }
    return null
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    const errorMessage = validateRequired(newValues)
    if (errorMessage) {
      showErrorToast(errorMessage)
      return
    }

    setIsCreating(true)
    try {
      const payload = buildPayload(newValues)
      await createService(payload)
      showSuccessToast("Service created")
      resetNewForm()
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditStart = (service) => {
    setEditingId(service.id)
    setEditingValues(mapServiceToFormValues(service))
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingValues(defaultFormValues)
  }

  const handleUpdate = async (event) => {
    event.preventDefault()
    if (!editingId) {
      return
    }

    const errorMessage = validateRequired(editingValues)
    if (errorMessage) {
      showErrorToast(errorMessage)
      return
    }

    setUpdatingId(editingId)
    try {
      const payload = buildPayload(editingValues)
      await updateService(editingId, payload)
      showSuccessToast("Service updated")
      handleEditCancel()
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (serviceId) => {
    const confirmed = window.confirm(
      "Delete this service? This cannot be undone."
    )
    if (!confirmed) {
      return
    }

    try {
      await deleteService(serviceId)
      showSuccessToast("Service deleted")
      if (editingId === serviceId) {
        handleEditCancel()
      }
    } catch (err) {
      showErrorToast(err.message)
    }
  }

  const handleUploadImages = async (serviceId, files) => {
    setUploadingServiceId(serviceId)
    try {
      await uploadServiceImages(serviceId, files)
      showSuccessToast("Images uploaded")
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setUploadingServiceId(null)
    }
  }

  const handleSetPrimaryImage = async (serviceId, imageId) => {
    setUploadingServiceId(serviceId)
    try {
      await updateServiceImages(serviceId, { primaryImageId: imageId })
      showSuccessToast("Primary image updated")
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setUploadingServiceId(null)
    }
  }

  const handleReorderImages = async (serviceId, orderedImageIds) => {
    setUploadingServiceId(serviceId)
    try {
      await updateServiceImages(serviceId, { orderedImageIds })
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setUploadingServiceId(null)
    }
  }

  const handleDeleteImage = async (serviceId, imageId) => {
    const confirmed = window.confirm(
      "Delete this image? This cannot be undone."
    )
    if (!confirmed) {
      return
    }
    setUploadingServiceId(serviceId)
    try {
      await deleteServiceImage(serviceId, imageId)
      showSuccessToast("Image deleted")
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setUploadingServiceId(null)
    }
  }

  const renderServiceCard = (service) => {
    const isEditing = editingId === service.id

    let statusLabel = "Inactive"
    let statusVariant = "inactive"
    if (service.isActive) {
      statusLabel = "Active"
      statusVariant = "active"
    }

    let editForm = null
    if (isEditing) {
      const editPriceHintText = getPriceHintText(editingValues.priceCents)
      const editImages = service.images || []
      const isUploadingImages = uploadingServiceId === service.id
      editForm = (
        <CatalogForm onSubmit={handleUpdate}>
          <FormGrid>
            <FormField>
              <FormFieldLabelRow>
                <FormFieldLabel>Name</FormFieldLabel>
              </FormFieldLabelRow>
              <TextInput
                value={editingValues.name}
                onChange={(event) =>
                  setEditingValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField>
              <FormFieldLabelRow>
                <FormFieldLabel>Slug</FormFieldLabel>
              </FormFieldLabelRow>
              <TextInput
                value={editingValues.slug}
                onChange={(event) =>
                  setEditingValues((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField>
              <FormFieldLabelRow>
                <FormFieldLabel>Price (cents)</FormFieldLabel>
                <FormFieldHint>{editPriceHintText}</FormFieldHint>
              </FormFieldLabelRow>
              <TextInput
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={editingValues.priceCents}
                onChange={(event) => {
                  const nextValue = sanitizeNonNegativeNumberInput(
                    event.target.value
                  )
                  setEditingValues((current) =>
                    syncIntervalPricingFromMonthly(current, nextValue)
                  )
                }}
              />
            </FormField>
          </FormGrid>
          <CatalogFormSection>
            <CatalogFormSectionTitle>
              Subscription pricing
            </CatalogFormSectionTitle>
            <FormGrid>
              <FormField>
                <FormFieldLabelRow>
                  <FormFieldLabel>Monthly (cents)</FormFieldLabel>
                  <FormFieldHint>
                    {getPriceHintText(editingValues.monthlyPriceCents)}
                  </FormFieldHint>
                </FormFieldLabelRow>
                <TextInput
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={editingValues.monthlyPriceCents}
                  onChange={(event) => {
                    const nextValue = sanitizeNonNegativeNumberInput(
                      event.target.value
                    )
                    setEditingValues((current) =>
                      syncIntervalPricingFromMonthly(current, nextValue)
                    )
                  }}
                />
                <CheckboxRow>
                  <CheckboxInput
                    type="checkbox"
                    checked={editingValues.monthlyEnabled === true}
                    onChange={(event) =>
                      setEditingValues((current) => ({
                        ...current,
                        monthlyEnabled: event.target.checked,
                      }))
                    }
                  />
                  Enabled
                </CheckboxRow>
              </FormField>
              <FormField>
                <FormFieldLabelRow>
                  <FormFieldLabel>Quarterly (cents)</FormFieldLabel>
                  <FormFieldHint>
                    {getPriceHintText(editingValues.quarterlyPriceCents)}
                  </FormFieldHint>
                </FormFieldLabelRow>
                <TextInput
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={editingValues.quarterlyPriceCents}
                  onChange={(event) => {
                    const nextValue = sanitizeNonNegativeNumberInput(
                      event.target.value
                    )
                    setEditingValues((current) => ({
                      ...current,
                      quarterlyPriceCents: nextValue,
                    }))
                  }}
                />
                <CheckboxRow>
                  <CheckboxInput
                    type="checkbox"
                    checked={editingValues.quarterlyEnabled === true}
                    onChange={(event) =>
                      setEditingValues((current) => ({
                        ...current,
                        quarterlyEnabled: event.target.checked,
                      }))
                    }
                  />
                  Enabled
                </CheckboxRow>
              </FormField>
              <FormField>
                <FormFieldLabelRow>
                  <FormFieldLabel>6-month (cents)</FormFieldLabel>
                  <FormFieldHint>
                    {getPriceHintText(editingValues.semiAnnualPriceCents)}
                  </FormFieldHint>
                </FormFieldLabelRow>
                <TextInput
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={editingValues.semiAnnualPriceCents}
                  onChange={(event) => {
                    const nextValue = sanitizeNonNegativeNumberInput(
                      event.target.value
                    )
                    setEditingValues((current) => ({
                      ...current,
                      semiAnnualPriceCents: nextValue,
                    }))
                  }}
                />
                <CheckboxRow>
                  <CheckboxInput
                    type="checkbox"
                    checked={editingValues.semiAnnualEnabled === true}
                    onChange={(event) =>
                      setEditingValues((current) => ({
                        ...current,
                        semiAnnualEnabled: event.target.checked,
                      }))
                    }
                  />
                  Enabled
                </CheckboxRow>
              </FormField>
              <FormField>
                <FormFieldLabelRow>
                  <FormFieldLabel>12-month (cents)</FormFieldLabel>
                  <FormFieldHint>
                    {getPriceHintText(editingValues.annualPriceCents)}
                  </FormFieldHint>
                </FormFieldLabelRow>
                <TextInput
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={editingValues.annualPriceCents}
                  onChange={(event) => {
                    const nextValue = sanitizeNonNegativeNumberInput(
                      event.target.value
                    )
                    setEditingValues((current) => ({
                      ...current,
                      annualPriceCents: nextValue,
                    }))
                  }}
                />
                <CheckboxRow>
                  <CheckboxInput
                    type="checkbox"
                    checked={editingValues.annualEnabled === true}
                    onChange={(event) =>
                      setEditingValues((current) => ({
                        ...current,
                        annualEnabled: event.target.checked,
                      }))
                    }
                  />
                  Enabled
                </CheckboxRow>
              </FormField>
            </FormGrid>
          </CatalogFormSection>
          <FormField>
            <FormFieldLabelRow>
              <FormFieldLabel>Description</FormFieldLabel>
            </FormFieldLabelRow>
            <TextArea
              value={editingValues.description}
              onChange={(event) =>
                setEditingValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </FormField>
          <FormField>
            <FormFieldLabelRow>
              <FormFieldLabel>Long description</FormFieldLabel>
            </FormFieldLabelRow>
            <TextArea
              value={editingValues.longDescription}
              onChange={(event) =>
                setEditingValues((current) => ({
                  ...current,
                  longDescription: event.target.value,
                }))
              }
            />
          </FormField>
          <CatalogFormSection>
            <CatalogFormSectionTitle>Images</CatalogFormSectionTitle>
            <CatalogImageManager
              images={editImages}
              isDisabled={!service.id}
              isUploading={isUploadingImages}
              onUpload={(files) => handleUploadImages(service.id, files)}
              onSetPrimary={(imageId) =>
                handleSetPrimaryImage(service.id, imageId)
              }
              onReorder={(orderedImageIds) =>
                handleReorderImages(service.id, orderedImageIds)
              }
              onDelete={(imageId) => handleDeleteImage(service.id, imageId)}
            />
          </CatalogFormSection>
          <FormActions>
            <FormActionsButtons>
              <PrimaryButton type="submit" disabled={updatingId === service.id}>
                Save changes
              </PrimaryButton>
              <SecondaryButton type="button" onClick={handleEditCancel}>
                Cancel
              </SecondaryButton>
            </FormActionsButtons>
            <CheckboxRow>
              <CheckboxInput
                type="checkbox"
                checked={editingValues.isActive}
                onChange={(event) =>
                  setEditingValues((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
              />
              Active
            </CheckboxRow>
          </FormActions>
        </CatalogForm>
      )
    }

    const metaItems = [
      { label: "Slug", value: service.slug },
      { label: "Price", value: formatMoney(service.priceCents) },
    ]

    return (
      <CatalogItemCard key={service.id}>
        <CatalogItemHeader>
          <CatalogItemTitle>{service.name}</CatalogItemTitle>
          <CatalogItemBadge $variant={statusVariant}>
            {statusLabel}
          </CatalogItemBadge>
        </CatalogItemHeader>
        <CatalogItemMeta>
          {metaItems.map((item) => (
            <span key={item.label}>
              {item.label}: {item.value}
            </span>
          ))}
        </CatalogItemMeta>
        <CatalogItemActions>
          <SecondaryButton
            type="button"
            onClick={() => handleEditStart(service)}
          >
            Edit
          </SecondaryButton>
          <DangerButton type="button" onClick={() => handleDelete(service.id)}>
            Delete
          </DangerButton>
        </CatalogItemActions>
        {editForm}
      </CatalogItemCard>
    )
  }

  let servicesContent = null
  if (isLoadingServices) {
    servicesContent = <EmptyState>Loading services...</EmptyState>
  } else if (services.length === 0) {
    servicesContent = <EmptyState>No services found.</EmptyState>
  } else {
    servicesContent = (
      <CatalogList>{services.map(renderServiceCard)}</CatalogList>
    )
  }

  let errorContent = null
  if (error) {
    errorContent = <InlineError>{error}</InlineError>
  }

  const newPriceHintText = getPriceHintText(newValues.priceCents)
  const isUploadingNewImages = uploadingServiceId === "new"

  return (
    <PageLayout>
      <CatalogLayout>
        <SectionNav
          title="Catalog"
          subtitle="Services"
          links={[
            { href: "/catalog/products", title: "Products", isActive: false },
            { href: "/catalog/services", title: "Services", isActive: true },
          ]}
        />

        <CatalogPanel>
          <CatalogPanelHeader>
            <CatalogPanelTitle>New service</CatalogPanelTitle>
          </CatalogPanelHeader>
          <CatalogPanelBody>
            <CatalogForm onSubmit={handleCreate}>
              <FormGrid>
                <FormField>
                  <FormFieldLabelRow>
                    <FormFieldLabel>Name</FormFieldLabel>
                  </FormFieldLabelRow>
                  <TextInput
                    value={newValues.name}
                    onChange={(event) =>
                      setNewValues((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </FormField>
                <FormField>
                  <FormFieldLabelRow>
                    <FormFieldLabel>Slug</FormFieldLabel>
                  </FormFieldLabelRow>
                  <TextInput
                    value={newValues.slug}
                    onChange={(event) =>
                      setNewValues((current) => ({
                        ...current,
                        slug: event.target.value,
                      }))
                    }
                  />
                </FormField>
                <FormField>
                  <FormFieldLabelRow>
                    <FormFieldLabel>Price (cents)</FormFieldLabel>
                    <FormFieldHint>{newPriceHintText}</FormFieldHint>
                  </FormFieldLabelRow>
                  <TextInput
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={newValues.priceCents}
                    onChange={(event) => {
                      const nextValue = sanitizeNonNegativeNumberInput(
                        event.target.value
                      )
                      setNewValues((current) =>
                        syncIntervalPricingFromMonthly(current, nextValue)
                      )
                    }}
                  />
                </FormField>
              </FormGrid>
              <CatalogFormSection>
                <CatalogFormSectionTitle>
                  Subscription pricing
                </CatalogFormSectionTitle>
                <FormGrid>
                  <FormField>
                    <FormFieldLabelRow>
                      <FormFieldLabel>Monthly (cents)</FormFieldLabel>
                      <FormFieldHint>
                        {getPriceHintText(newValues.monthlyPriceCents)}
                      </FormFieldHint>
                    </FormFieldLabelRow>
                    <TextInput
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={newValues.monthlyPriceCents}
                      onChange={(event) => {
                        const nextValue = sanitizeNonNegativeNumberInput(
                          event.target.value
                        )
                        setNewValues((current) =>
                          syncIntervalPricingFromMonthly(current, nextValue)
                        )
                      }}
                    />
                    <CheckboxRow>
                      <CheckboxInput
                        type="checkbox"
                        checked={newValues.monthlyEnabled === true}
                        onChange={(event) =>
                          setNewValues((current) => ({
                            ...current,
                            monthlyEnabled: event.target.checked,
                          }))
                        }
                      />
                      Enabled
                    </CheckboxRow>
                  </FormField>
                  <FormField>
                    <FormFieldLabelRow>
                      <FormFieldLabel>Quarterly (cents)</FormFieldLabel>
                      <FormFieldHint>
                        {getPriceHintText(newValues.quarterlyPriceCents)}
                      </FormFieldHint>
                    </FormFieldLabelRow>
                    <TextInput
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={newValues.quarterlyPriceCents}
                      onChange={(event) => {
                        const nextValue = sanitizeNonNegativeNumberInput(
                          event.target.value
                        )
                        setNewValues((current) => ({
                          ...current,
                          quarterlyPriceCents: nextValue,
                        }))
                      }}
                    />
                    <CheckboxRow>
                      <CheckboxInput
                        type="checkbox"
                        checked={newValues.quarterlyEnabled === true}
                        onChange={(event) =>
                          setNewValues((current) => ({
                            ...current,
                            quarterlyEnabled: event.target.checked,
                          }))
                        }
                      />
                      Enabled
                    </CheckboxRow>
                  </FormField>
                  <FormField>
                    <FormFieldLabelRow>
                      <FormFieldLabel>6-month (cents)</FormFieldLabel>
                      <FormFieldHint>
                        {getPriceHintText(newValues.semiAnnualPriceCents)}
                      </FormFieldHint>
                    </FormFieldLabelRow>
                    <TextInput
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={newValues.semiAnnualPriceCents}
                      onChange={(event) => {
                        const nextValue = sanitizeNonNegativeNumberInput(
                          event.target.value
                        )
                        setNewValues((current) => ({
                          ...current,
                          semiAnnualPriceCents: nextValue,
                        }))
                      }}
                    />
                    <CheckboxRow>
                      <CheckboxInput
                        type="checkbox"
                        checked={newValues.semiAnnualEnabled === true}
                        onChange={(event) =>
                          setNewValues((current) => ({
                            ...current,
                            semiAnnualEnabled: event.target.checked,
                          }))
                        }
                      />
                      Enabled
                    </CheckboxRow>
                  </FormField>
                  <FormField>
                    <FormFieldLabelRow>
                      <FormFieldLabel>12-month (cents)</FormFieldLabel>
                      <FormFieldHint>
                        {getPriceHintText(newValues.annualPriceCents)}
                      </FormFieldHint>
                    </FormFieldLabelRow>
                    <TextInput
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={newValues.annualPriceCents}
                      onChange={(event) => {
                        const nextValue = sanitizeNonNegativeNumberInput(
                          event.target.value
                        )
                        setNewValues((current) => ({
                          ...current,
                          annualPriceCents: nextValue,
                        }))
                      }}
                    />
                    <CheckboxRow>
                      <CheckboxInput
                        type="checkbox"
                        checked={newValues.annualEnabled === true}
                        onChange={(event) =>
                          setNewValues((current) => ({
                            ...current,
                            annualEnabled: event.target.checked,
                          }))
                        }
                      />
                      Enabled
                    </CheckboxRow>
                  </FormField>
                </FormGrid>
              </CatalogFormSection>
              <FormField>
                <FormFieldLabelRow>
                  <FormFieldLabel>Description</FormFieldLabel>
                </FormFieldLabelRow>
                <TextArea
                  value={newValues.description}
                  onChange={(event) =>
                    setNewValues((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField>
                <FormFieldLabelRow>
                  <FormFieldLabel>Long description</FormFieldLabel>
                </FormFieldLabelRow>
                <TextArea
                  value={newValues.longDescription}
                  onChange={(event) =>
                    setNewValues((current) => ({
                      ...current,
                      longDescription: event.target.value,
                    }))
                  }
                />
              </FormField>
              <CatalogFormSection>
                <CatalogFormSectionTitle>Images</CatalogFormSectionTitle>
                <CatalogImageManager
                  images={[]}
                  isDisabled
                  isUploading={isUploadingNewImages}
                  onUpload={() => {}}
                  onSetPrimary={() => {}}
                  onReorder={() => {}}
                  onDelete={() => {}}
                />
              </CatalogFormSection>
              <FormActions>
                <FormActionsButtons>
                  <PrimaryButton type="submit" disabled={isCreating}>
                    Create service
                  </PrimaryButton>
                  <SecondaryButton type="button" onClick={resetNewForm}>
                    Reset
                  </SecondaryButton>
                </FormActionsButtons>
                <CheckboxRow>
                  <CheckboxInput
                    type="checkbox"
                    checked={newValues.isActive}
                    onChange={(event) =>
                      setNewValues((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                  />
                  Active
                </CheckboxRow>
              </FormActions>
            </CatalogForm>
          </CatalogPanelBody>
        </CatalogPanel>

        <CatalogPanel>
          <CatalogPanelHeader>
            <CatalogPanelTitle>Services</CatalogPanelTitle>
            <FilterRow>
              {filterOptions.map((option) => {
                const isActive = option.value === statusFilter
                return (
                  <FilterChip
                    key={option.value}
                    type="button"
                    $active={isActive}
                    onClick={() => setStatusFilter(option.value)}
                  >
                    {option.label}
                  </FilterChip>
                )
              })}
            </FilterRow>
          </CatalogPanelHeader>
          <CatalogPanelBody>
            {errorContent}
            {servicesContent}
          </CatalogPanelBody>
        </CatalogPanel>
      </CatalogLayout>
    </PageLayout>
  )
}
