"use client"

import { useEffect, useRef, useState } from "react"
import {
  CatalogDropzone,
  CatalogDropzoneHint,
  CatalogDropzoneTitle,
  CatalogImageModalBody,
  CatalogImageModalCloseButton,
  CatalogImageModalContent,
  CatalogImageModalHeader,
  CatalogImageModalImage,
  CatalogImageModalOverlay,
  CatalogImageModalTitle,
  CatalogImageActionButtonFull,
  CatalogImageActionRow,
  CatalogImageActions,
  CatalogImageCard,
  CatalogImageDeleteButton,
  CatalogImageBadgeSpacer,
  CatalogImageFilename,
  CatalogImageGrid,
  CatalogImageMeta,
  CatalogImagePreview,
  CatalogImagePreviewButton,
  CatalogImagePrimaryBadge,
} from "@/components/catalog/catalogStyles"
import {
  CATALOG_IMAGE_ALLOWED_MIME_TYPES,
  CATALOG_IMAGE_MAX_COUNT,
  CATALOG_IMAGE_MAX_SIZE_BYTES,
} from "@/constants.js"

const formatBytes = (bytes) => {
  if (!bytes || Number.isNaN(bytes)) {
    return "0 B"
  }
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const buildAcceptedTypesLabel = () => {
  return CATALOG_IMAGE_ALLOWED_MIME_TYPES.map((type) => {
    const parts = type.split("/")
    return parts[1]?.toUpperCase() || type
  }).join(", ")
}

const sortImages = (images) => {
  if (!Array.isArray(images)) {
    return []
  }
  return [...images].sort((left, right) => {
    if (left.isPrimary && !right.isPrimary) {
      return -1
    }
    if (!left.isPrimary && right.isPrimary) {
      return 1
    }
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder
    }
    return new Date(left.createdAt) - new Date(right.createdAt)
  })
}

export default function CatalogImageManager({
  images,
  isDisabled,
  isUploading,
  onUpload,
  onSetPrimary,
  onReorder,
  onDelete,
}) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeImage, setActiveImage] = useState(null)

  const handleBrowseClick = () => {
    if (isDisabled || isUploading) {
      return
    }
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFilesSelected = (fileList) => {
    if (!fileList || fileList.length === 0) {
      return
    }
    if (typeof onUpload !== "function") {
      return
    }
    const files = Array.from(fileList)
    onUpload(files)
  }

  const handleInputChange = (event) => {
    handleFilesSelected(event.target.files)
    if (event.target.value) {
      event.target.value = ""
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    if (isDisabled || isUploading) {
      return
    }
    handleFilesSelected(event.dataTransfer.files)
  }

  const handleOpenImage = (image) => {
    if (!image || !image.url) {
      return
    }
    setActiveImage(image)
  }

  const handleCloseImage = () => {
    setActiveImage(null)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseImage()
      }
    }

    if (activeImage) {
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeImage])

  const sortedImages = sortImages(images)
  const acceptedTypesLabel = buildAcceptedTypesLabel()
  const maxSizeLabel = formatBytes(CATALOG_IMAGE_MAX_SIZE_BYTES)

  let dropzoneTitle = "Drop images here"
  if (isDisabled) {
    dropzoneTitle = "Save the item before uploading images"
  } else if (isUploading) {
    dropzoneTitle = "Uploading images..."
  }

  const handleMove = (index, direction) => {
    if (!onReorder) {
      return
    }
    const nextImages = [...sortedImages]
    let targetIndex = index + 1
    if (direction === "up") {
      targetIndex = index - 1
    }
    if (targetIndex < 0 || targetIndex >= nextImages.length) {
      return
    }
    const [moved] = nextImages.splice(index, 1)
    nextImages.splice(targetIndex, 0, moved)
    onReorder(nextImages.map((image) => image.id))
  }

  let modalContent = null
  if (activeImage) {
    const filenameLabel = activeImage.filename || "Catalog image"
    modalContent = (
      <CatalogImageModalOverlay onClick={handleCloseImage}>
        <CatalogImageModalContent onClick={(event) => event.stopPropagation()}>
          <CatalogImageModalHeader>
            <CatalogImageModalTitle title={filenameLabel}>
              {filenameLabel}
            </CatalogImageModalTitle>
            <CatalogImageModalCloseButton
              type="button"
              onClick={handleCloseImage}
            >
              Close
            </CatalogImageModalCloseButton>
          </CatalogImageModalHeader>
          <CatalogImageModalBody>
            <CatalogImageModalImage src={activeImage.url} alt={filenameLabel} />
          </CatalogImageModalBody>
        </CatalogImageModalContent>
      </CatalogImageModalOverlay>
    )
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={CATALOG_IMAGE_ALLOWED_MIME_TYPES.join(",")}
        onChange={handleInputChange}
        disabled={isDisabled || isUploading}
        hidden
      />
      <CatalogDropzone
        $isActive={isDragging}
        $isDisabled={isDisabled || isUploading}
        onClick={handleBrowseClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CatalogDropzoneTitle>{dropzoneTitle}</CatalogDropzoneTitle>
        <CatalogDropzoneHint>
          {`Formats: ${acceptedTypesLabel} · Up to ${maxSizeLabel} each · Max ${CATALOG_IMAGE_MAX_COUNT} per upload`}
        </CatalogDropzoneHint>
      </CatalogDropzone>

      <CatalogImageGrid>
        {sortedImages.map((image, index) => {
          const isPrimary = image.isPrimary
          let badgeContent = <CatalogImageBadgeSpacer />
          if (isPrimary) {
            badgeContent = (
              <CatalogImagePrimaryBadge>Primary</CatalogImagePrimaryBadge>
            )
          }

          const filenameLabel = image.filename || "Untitled image"

          return (
            <CatalogImageCard key={image.id}>
              <CatalogImagePreview>
                <CatalogImagePreviewButton
                  type="button"
                  onClick={() => handleOpenImage(image)}
                  aria-label="View full-size image"
                >
                  <img
                    src={image.url}
                    alt={image.filename || "Catalog image"}
                  />
                </CatalogImagePreviewButton>
              </CatalogImagePreview>
              <CatalogImageMeta>
                {badgeContent}
                <CatalogImageFilename title={filenameLabel}>
                  {filenameLabel}
                </CatalogImageFilename>
                <span>{formatBytes(image.sizeBytes)}</span>
              </CatalogImageMeta>
              <CatalogImageActions>
                <CatalogImageActionRow>
                  <CatalogImageActionButtonFull
                    type="button"
                    onClick={() => onSetPrimary(image.id)}
                    disabled={isPrimary || isUploading}
                  >
                    Set primary
                  </CatalogImageActionButtonFull>
                </CatalogImageActionRow>

                <CatalogImageActionRow>
                  <CatalogImageActionButtonFull
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0 || isUploading}
                  >
                    Up
                  </CatalogImageActionButtonFull>
                  <CatalogImageActionButtonFull
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === sortedImages.length - 1 || isUploading}
                  >
                    Down
                  </CatalogImageActionButtonFull>
                </CatalogImageActionRow>
                <CatalogImageActionRow>
                  <CatalogImageDeleteButton
                    type="button"
                    onClick={() => onDelete(image.id)}
                    disabled={isUploading}
                  >
                    Delete
                  </CatalogImageDeleteButton>
                </CatalogImageActionRow>
              </CatalogImageActions>
            </CatalogImageCard>
          )
        })}
      </CatalogImageGrid>
      {modalContent}
    </div>
  )
}
