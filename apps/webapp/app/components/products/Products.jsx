"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { formatMoney } from "@ballast/shared/src/money.js"
import { useCatalog } from "@/contexts/CatalogContext"
import {
  ProductsPageLayout,
  ProductsSidebar,
  ProductsSidebarTitle,
  ProductsSidebarNav,
  ProductsSidebarItem,
  ProductsSidebarItemActive,
  ProductsContent,
  ProductsHeader,
  ProductsSubtitle,
  ProductsEmpty,
  ProductsCategorySection,
  CategoryTitle,
  Subcategories,
  SubcategoryBadge,
  SubcategoryBadgeActive,
  ProductsGrid,
  ProductCard,
  ProductImagePlaceholder,
  ProductImageFallback,
  ProductInfo,
  ProductName,
  ProductSubcategory,
  ProductDescription,
  ProductPrice,
  ProductsLoadMoreContainer,
  ProductImage,
} from "@/components/products/productStyles"
import { ButtonSecondary } from "@/components/ui/uiStyles"

export default function Products() {
  const { products, fetchProducts, isLoadingProducts } = useCatalog()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)

  useEffect(() => {
    if (products.length > 0) {
      return
    }

    const loadProducts = async () => {
      try {
        await fetchProducts()
      } catch {
        // Ignore initial load errors; page will show empty state
      }
    }

    loadProducts()
  }, [fetchProducts, products.length])

  const categories = useMemo(() => {
    const categoryOrder = ["Encabulators", "Parts & Components", "Accessories"]
    const categoriesSet = new Set()

    products.forEach((product) => {
      categoriesSet.add(product.category)
    })

    const ordered = categoryOrder.filter((category) =>
      categoriesSet.has(category)
    )

    const remaining = Array.from(categoriesSet)
      .filter((category) => !categoryOrder.includes(category))
      .sort()

    return [...ordered, ...remaining]
  }, [products])

  const getSubcategories = (category) => {
    const subcategoriesSet = new Set()
    products.forEach((product) => {
      if (product.category === category && product.subcategory) {
        subcategoriesSet.add(product.subcategory)
      }
    })
    return Array.from(subcategoriesSet).sort()
  }

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null)
      setSelectedSubcategory(null)
    } else {
      setSelectedCategory(category)
      setSelectedSubcategory(null)
    }
  }

  const handleSubcategoryClick = (category, subcategory) => {
    if (selectedSubcategory === subcategory) {
      setSelectedSubcategory(null)
    } else {
      setSelectedCategory(category)
      setSelectedSubcategory(subcategory)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory && product.category !== selectedCategory) {
        return false
      }
      if (selectedSubcategory && product.subcategory !== selectedSubcategory) {
        return false
      }
      return true
    })
  }, [products, selectedCategory, selectedSubcategory])

  const productsByCategory = useMemo(() => {
    const grouped = {}
    filteredProducts.forEach((product) => {
      if (!grouped[product.category]) {
        grouped[product.category] = []
      }
      grouped[product.category].push(product)
    })
    return grouped
  }, [filteredProducts])

  let displayCategories = []
  if (selectedSubcategory) {
    const categoryWithSubcategory = categories.find((category) => {
      return getSubcategories(category).includes(selectedSubcategory)
    })

    if (categoryWithSubcategory) {
      displayCategories = [categoryWithSubcategory]
    }
  } else if (selectedCategory) {
    displayCategories = [selectedCategory]
  } else {
    displayCategories = categories.filter((category) =>
      Object.prototype.hasOwnProperty.call(productsByCategory, category)
    )
  }

  let subtitleText =
    "Browse our selection of retroencabulators, parts, and accessories"

  if (selectedCategory) {
    subtitleText = selectedCategory
    if (selectedSubcategory) {
      subtitleText = `${selectedCategory} - ${selectedSubcategory}`
    }
  }

  let content = null
  if (isLoadingProducts) {
    content = (
      <ProductsEmpty>
        <p>Loading products...</p>
      </ProductsEmpty>
    )
  } else if (displayCategories.length === 0) {
    content = (
      <ProductsEmpty>
        <p>No products found.</p>
      </ProductsEmpty>
    )
  } else {
    content = displayCategories.map((category) => {
      const categoryProducts = productsByCategory[category] || []
      const subcategories = getSubcategories(category)
      let maxItems = 6
      if (selectedCategory) {
        maxItems = categoryProducts.length
      }
      const displayedProducts = categoryProducts.slice(0, maxItems)
      let hasMore = false
      if (!selectedCategory && categoryProducts.length > 6) {
        hasMore = true
      }

      let subcategoriesContent = null
      if (subcategories.length > 0 && selectedCategory === category) {
        subcategoriesContent = (
          <Subcategories>
            {subcategories.map((subcategory) => {
              const isActive = selectedSubcategory === subcategory
              if (isActive) {
                return (
                  <SubcategoryBadgeActive
                    key={subcategory}
                    onClick={() =>
                      handleSubcategoryClick(category, subcategory)
                    }
                  >
                    {subcategory}
                  </SubcategoryBadgeActive>
                )
              }

              return (
                <SubcategoryBadge
                  key={subcategory}
                  onClick={() => handleSubcategoryClick(category, subcategory)}
                >
                  {subcategory}
                </SubcategoryBadge>
              )
            })}
          </Subcategories>
        )
      }

      return (
        <ProductsCategorySection key={category}>
          <CategoryTitle>{category}</CategoryTitle>
          {subcategoriesContent}
          <ProductsGrid>
            {displayedProducts.map((product) => {
              const descriptionText = product.description || ""
              let truncatedDescription = descriptionText
              if (descriptionText.length > 120) {
                truncatedDescription = `${descriptionText.substring(0, 120)}...`
              }

              let imageContent = (
                <ProductImageFallback>
                  <span>📦</span>
                </ProductImageFallback>
              )
              const images = Array.isArray(product.images) ? product.images : []
              let primaryImage = null
              if (images.length > 0) {
                const selected = images.find((image) => image.isPrimary)
                if (selected) {
                  primaryImage = selected
                } else {
                  primaryImage = images[0]
                }
              }
              if (primaryImage && primaryImage.url) {
                imageContent = (
                  <ProductImage
                    src={primaryImage.url}
                    alt={product.name}
                    fill
                  />
                )
              }

              let subcategoryContent = null
              if (product.subcategory) {
                subcategoryContent = (
                  <ProductSubcategory>{product.subcategory}</ProductSubcategory>
                )
              }

              return (
                <ProductCard
                  key={product.id}
                  as={Link}
                  href={`/products/${product.slug}`}
                >
                  <ProductImagePlaceholder>
                    {imageContent}
                  </ProductImagePlaceholder>
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    {subcategoryContent}
                    <ProductDescription>
                      {truncatedDescription}
                    </ProductDescription>
                    <ProductPrice>
                      {formatMoney(product.priceCents)}
                    </ProductPrice>
                  </ProductInfo>
                </ProductCard>
              )
            })}
          </ProductsGrid>
          {hasMore && (
            <ProductsLoadMoreContainer>
              <ButtonSecondary onClick={() => handleCategoryClick(category)}>
                See more {category}
              </ButtonSecondary>
            </ProductsLoadMoreContainer>
          )}
        </ProductsCategorySection>
      )
    })
  }

  let allProductsButton = null
  if (!selectedCategory) {
    allProductsButton = (
      <ProductsSidebarItemActive
        onClick={() => {
          setSelectedCategory(null)
          setSelectedSubcategory(null)
        }}
      >
        All Products
      </ProductsSidebarItemActive>
    )
  } else {
    allProductsButton = (
      <ProductsSidebarItem
        onClick={() => {
          setSelectedCategory(null)
          setSelectedSubcategory(null)
        }}
      >
        All Products
      </ProductsSidebarItem>
    )
  }

  return (
    <ProductsPageLayout>
      <ProductsSidebar>
        <ProductsSidebarTitle>Categories</ProductsSidebarTitle>
        <ProductsSidebarNav>
          {allProductsButton}
          {categories.map((category) => {
            const isActive = selectedCategory === category
            if (isActive) {
              return (
                <ProductsSidebarItemActive
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </ProductsSidebarItemActive>
              )
            }

            return (
              <ProductsSidebarItem
                key={category}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </ProductsSidebarItem>
            )
          })}
        </ProductsSidebarNav>
      </ProductsSidebar>

      <ProductsContent>
        <ProductsHeader>
          <h1>Products</h1>
          <ProductsSubtitle>{subtitleText}</ProductsSubtitle>
        </ProductsHeader>

        {content}
      </ProductsContent>
    </ProductsPageLayout>
  )
}
