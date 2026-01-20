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
  CatalogPanelHeaderActions,
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
  CatalogListScrollArea,
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
  CatalogSearchField,
  CatalogSearchInput,
} from "@/components/catalog/catalogStyles"
import CatalogImageManager from "@/components/catalog/CatalogImageManager"

const defaultFormValues = {
  name: "",
  slug: "",
  description: "",
  priceCents: "",
  category: "",
  subcategory: "",
  isActive: false,
}

const buildPayload = (values) => {
  const payload = {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    category: values.category.trim(),
    isActive: values.isActive,
  }

  const priceCentsValue = Number.parseInt(values.priceCents, 10)
  if (!Number.isNaN(priceCentsValue)) {
    payload.priceCents = priceCentsValue
  }

  if (values.subcategory.trim()) {
    payload.subcategory = values.subcategory.trim()
  } else {
    payload.subcategory = null
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

const getUniqueStrings = (values) => {
  const seen = new Set()
  const uniqueValues = []

  for (const value of values) {
    if (!value) {
      continue
    }
    if (!seen.has(value)) {
      seen.add(value)
      uniqueValues.push(value)
    }
  }

  return uniqueValues
}

const sanitizeNonNegativeNumberInput = (value) => {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return ""
  }
  return trimmedValue.replace(/[^0-9]/g, "")
}

const mapProductToFormValues = (product) => {
  let priceCents = ""
  if (typeof product.priceCents === "number") {
    priceCents = String(product.priceCents)
  }

  return {
    name: product.name || "",
    slug: product.slug || "",
    description: product.description || "",
    priceCents,
    category: product.category || "",
    subcategory: product.subcategory || "",
    isActive: product.isActive !== false,
  }
}

export default function CatalogProductsPage() {
  const {
    products,
    isLoadingProducts,
    error,
    fetchProducts,
    createProduct,
    uploadProductImages,
    updateProductImages,
    deleteProductImage,
    updateProduct,
    deleteProduct,
  } = useCatalog()
  const { showErrorToast, showSuccessToast } = useToast()

  const [statusFilter, setStatusFilter] = useState("all")
  const [newValues, setNewValues] = useState(defaultFormValues)
  const [editingId, setEditingId] = useState(null)
  const [editingValues, setEditingValues] = useState(defaultFormValues)
  const [isCreating, setIsCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadingProductId, setUploadingProductId] = useState(null)

  useEffect(() => {
    fetchProducts({ status: statusFilter }).catch((err) => {
      showErrorToast(err.message)
    })
  }, [fetchProducts, showErrorToast, statusFilter])

  const filterOptions = useMemo(() => {
    return [
      { label: "All", value: "all" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ]
  }, [])

  const categoryOptions = useMemo(() => {
    return getUniqueStrings(products.map((product) => product.category))
  }, [products])

  const getSubcategoryOptions = (categoryValue) => {
    const normalizedCategory = categoryValue.trim()
    let matchingProducts = products
    if (normalizedCategory) {
      matchingProducts = products.filter(
        (product) => product.category === normalizedCategory
      )
    }
    return getUniqueStrings(
      matchingProducts.map((product) => product.subcategory)
    )
  }

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) {
      return products
    }

    return products.filter((product) => {
      const nameValue = (product.name || "").toLowerCase()
      const slugValue = (product.slug || "").toLowerCase()
      return (
        nameValue.includes(normalizedQuery) ||
        slugValue.includes(normalizedQuery)
      )
    })
  }, [products, searchQuery])

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
    if (!values.category.trim()) {
      return "Category is required"
    }
    if (!values.priceCents.trim()) {
      return "Price (cents) is required"
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
      await createProduct(payload)
      showSuccessToast("Product created")
      resetNewForm()
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditStart = (product) => {
    setEditingId(product.id)
    setEditingValues(mapProductToFormValues(product))
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
      await updateProduct(editingId, payload)
      showSuccessToast("Product updated")
      handleEditCancel()
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Delete this product? This cannot be undone."
    )
    if (!confirmed) {
      return
    }

    try {
      await deleteProduct(productId)
      showSuccessToast("Product deleted")
      if (editingId === productId) {
        handleEditCancel()
      }
    } catch (err) {
      showErrorToast(err.message)
    }
  }

  const handleUploadImages = async (productId, files) => {
    setUploadingProductId(productId)
    try {
      await uploadProductImages(productId, files)
      showSuccessToast("Images uploaded")
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setUploadingProductId(null)
    }
  }

  const handleSetPrimaryImage = async (productId, imageId) => {
    setUploadingProductId(productId)
    try {
      await updateProductImages(productId, { primaryImageId: imageId })
      showSuccessToast("Primary image updated")
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setUploadingProductId(null)
    }
  }

  const handleReorderImages = async (productId, orderedImageIds) => {
    setUploadingProductId(productId)
    try {
      await updateProductImages(productId, { orderedImageIds })
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setUploadingProductId(null)
    }
  }

  const handleDeleteImage = async (productId, imageId) => {
    const confirmed = window.confirm(
      "Delete this image? This cannot be undone."
    )
    if (!confirmed) {
      return
    }
    setUploadingProductId(productId)
    try {
      await deleteProductImage(productId, imageId)
      showSuccessToast("Image deleted")
    } catch (err) {
      showErrorToast(err.message)
    } finally {
      setUploadingProductId(null)
    }
  }

  const renderProductCard = (product) => {
    const isEditing = editingId === product.id

    let statusLabel = "Inactive"
    let statusVariant = "inactive"
    if (product.isActive) {
      statusLabel = "Active"
      statusVariant = "active"
    }

    let editForm = null
    if (isEditing) {
      const editPriceHintText = getPriceHintText(editingValues.priceCents)
      const editCategoryOptions = categoryOptions
      const editSubcategoryOptions = getSubcategoryOptions(
        editingValues.category
      )
      const editImages = product.images || []
      const isUploadingImages = uploadingProductId === product.id
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
                <FormFieldLabel>Category</FormFieldLabel>
              </FormFieldLabelRow>
              <TextInput
                list={`product-category-options-${product.id}`}
                value={editingValues.category}
                onChange={(event) =>
                  setEditingValues((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              />
              <datalist id={`product-category-options-${product.id}`}>
                {editCategoryOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </FormField>
            <FormField>
              <FormFieldLabelRow>
                <FormFieldLabel>Subcategory</FormFieldLabel>
              </FormFieldLabelRow>
              <TextInput
                list={`product-subcategory-options-${product.id}`}
                value={editingValues.subcategory}
                onChange={(event) =>
                  setEditingValues((current) => ({
                    ...current,
                    subcategory: event.target.value,
                  }))
                }
              />
              <datalist id={`product-subcategory-options-${product.id}`}>
                {editSubcategoryOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
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
                  setEditingValues((current) => ({
                    ...current,
                    priceCents: nextValue,
                  }))
                }}
              />
            </FormField>
          </FormGrid>
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
          <CatalogFormSection>
            <CatalogFormSectionTitle>Images</CatalogFormSectionTitle>
            <CatalogImageManager
              images={editImages}
              isDisabled={!product.id}
              isUploading={isUploadingImages}
              onUpload={(files) => handleUploadImages(product.id, files)}
              onSetPrimary={(imageId) =>
                handleSetPrimaryImage(product.id, imageId)
              }
              onReorder={(orderedImageIds) =>
                handleReorderImages(product.id, orderedImageIds)
              }
              onDelete={(imageId) => handleDeleteImage(product.id, imageId)}
            />
          </CatalogFormSection>
          <FormActions>
            <FormActionsButtons>
              <PrimaryButton type="submit" disabled={updatingId === product.id}>
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
      { label: "Slug", value: product.slug },
      { label: "Category", value: product.category },
      { label: "Price", value: formatMoney(product.priceCents) },
    ]

    if (product.subcategory) {
      metaItems.splice(2, 0, {
        label: "Subcategory",
        value: product.subcategory,
      })
    }

    return (
      <CatalogItemCard key={product.id}>
        <CatalogItemHeader>
          <CatalogItemTitle>{product.name}</CatalogItemTitle>
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
            onClick={() => handleEditStart(product)}
          >
            Edit
          </SecondaryButton>
          <DangerButton type="button" onClick={() => handleDelete(product.id)}>
            Delete
          </DangerButton>
        </CatalogItemActions>
        {editForm}
      </CatalogItemCard>
    )
  }

  let productsContent = null
  if (isLoadingProducts) {
    productsContent = <EmptyState>Loading products...</EmptyState>
  } else if (filteredProducts.length === 0) {
    if (searchQuery.trim()) {
      productsContent = <EmptyState>No products match your search.</EmptyState>
    } else {
      productsContent = <EmptyState>No products found.</EmptyState>
    }
  } else {
    productsContent = (
      <CatalogListScrollArea>
        <CatalogList>{filteredProducts.map(renderProductCard)}</CatalogList>
      </CatalogListScrollArea>
    )
  }

  let errorContent = null
  if (error) {
    errorContent = <InlineError>{error}</InlineError>
  }

  const newCategoryOptions = categoryOptions
  const newSubcategoryOptions = getSubcategoryOptions(newValues.category)
  const newPriceHintText = getPriceHintText(newValues.priceCents)
  const isUploadingNewImages = uploadingProductId === "new"

  return (
    <PageLayout>
      <CatalogLayout>
        <SectionNav
          title="Catalog"
          subtitle="Products"
          links={[
            { href: "/catalog/products", title: "Products", isActive: true },
            { href: "/catalog/services", title: "Services", isActive: false },
          ]}
        />

        <CatalogPanel>
          <CatalogPanelHeader>
            <CatalogPanelTitle>New product</CatalogPanelTitle>
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
                    <FormFieldLabel>Category</FormFieldLabel>
                  </FormFieldLabelRow>
                  <TextInput
                    list="product-category-options-new"
                    value={newValues.category}
                    onChange={(event) =>
                      setNewValues((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                  />
                  <datalist id="product-category-options-new">
                    {newCategoryOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </FormField>
                <FormField>
                  <FormFieldLabelRow>
                    <FormFieldLabel>Subcategory</FormFieldLabel>
                  </FormFieldLabelRow>
                  <TextInput
                    list="product-subcategory-options-new"
                    value={newValues.subcategory}
                    onChange={(event) =>
                      setNewValues((current) => ({
                        ...current,
                        subcategory: event.target.value,
                      }))
                    }
                  />
                  <datalist id="product-subcategory-options-new">
                    {newSubcategoryOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
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
                      setNewValues((current) => ({
                        ...current,
                        priceCents: nextValue,
                      }))
                    }}
                  />
                </FormField>
              </FormGrid>
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
                    Create product
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
            <CatalogPanelTitle>Products</CatalogPanelTitle>
            <CatalogPanelHeaderActions>
              <CatalogSearchField htmlFor="catalog-product-search">
                Search
                <CatalogSearchInput
                  id="catalog-product-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Name or slug"
                />
              </CatalogSearchField>
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
            </CatalogPanelHeaderActions>
          </CatalogPanelHeader>
          <CatalogPanelBody>
            {errorContent}
            {productsContent}
          </CatalogPanelBody>
        </CatalogPanel>
      </CatalogLayout>
    </PageLayout>
  )
}
