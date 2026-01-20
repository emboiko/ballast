import styled from "styled-components"
import Image from "next/image"

export const ProductsPageLayout = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export const ProductsSidebar = styled.aside`
  max-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`

export const ProductsSidebarTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
`

export const ProductsSidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const ProductsSidebarItem = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  transition:
    background-color 0.2s,
    color 0.2s;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.9375rem;

  &:hover {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ProductsSidebarItemActive = styled(ProductsSidebarItem)`
  background-color: var(--bg-secondary);
  color: var(--button-primary-bg);
  font-weight: 600;
`

export const ProductsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

export const ProductsHeader = styled.div`
  margin-bottom: 3rem;
  text-align: center;

  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
  }
`

export const ProductsSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin: 0;
`

export const ProductsEmpty = styled.div`
  text-align: center;
  padding: 4rem 2rem;

  p {
    color: var(--text-secondary);
    font-size: 1.125rem;
    margin: 0;
  }
`

export const ProductsCategorySection = styled.section`
  margin-bottom: 4rem;
`

export const CategoryTitle = styled.h2`
  font-size: 2rem;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
`

export const Subcategories = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`

export const SubcategoryBadge = styled.button`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;
  background: none;

  &:hover {
    background-color: var(--bg-secondary);
    border-color: var(--button-primary-bg);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const SubcategoryBadgeActive = styled(SubcategoryBadge)`
  background-color: var(--button-primary-bg);
  border-color: var(--button-primary-bg);
  color: var(--button-primary-text);

  &:hover {
    background-color: var(--button-primary-hover);
    border-color: var(--button-primary-hover);
  }
`

export const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export const ProductCard = styled.a`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px var(--shadow-light);
    border-color: var(--button-primary-bg);
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px var(--focus-ring),
      0 4px 12px var(--shadow-light);
  }
`

export const ProductImagePlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`

export const ProductImageFallback = styled.div`
  font-size: 4rem;
  opacity: 0.5;
`

export const ProductImage = styled(Image)`
  object-fit: cover;
`

export const ProductsLoadMoreContainer = styled.div`
  text-align: center;
  margin-top: 1.5rem;
`

export const ProductInfo = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`

export const ProductName = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
`

export const ProductSubcategory = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const ProductDescription = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.5;
  flex: 1;
`

export const ProductPrice = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--button-primary-bg);
`

export const ProductDetailPage = styled.div`
  padding: 2rem 0;
`

export const ProductDetailBack = styled.a`
  display: inline-block;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s;
  border-radius: 2px;

  &:hover {
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ProductDetailContent = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 520px) 1fr;
  gap: 3rem;
  align-items: start;

  @media (max-width: 768px) {
    flex-direction: column;
    grid-template-columns: 1fr;
  }
`

export const ProductDetailImageColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const ProductDetailImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-color);
  position: relative;
`

export const ProductDetailThumbnailRow = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
`

export const ProductDetailThumbnailButton = styled.button`
  width: 70px;
  height: 70px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background-color: var(--bg-secondary);
  padding: 0;
  cursor: pointer;
  flex: 0 0 auto;
  overflow: hidden;
  position: relative;
  transition: border-color 0.2s;

  ${(props) => {
    if (props.$isActive) {
      return `
        border-color: var(--button-primary-bg);
      `
    }
    return ""
  }}

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`

export const ProductDetailThumbnailImage = styled(Image)`
  object-fit: cover;
`

export const ProductImageFallbackLarge = styled.div`
  font-size: 8rem;
  opacity: 0.5;
`

export const ProductDetailImageAsset = styled(Image)`
  object-fit: contain;
`

export const ProductDetailInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

export const ProductDetailHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const ProductDetailCategory = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const ProductDetailName = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  color: var(--text-primary);
`

export const ProductDetailPrice = styled.p`
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: var(--button-primary-bg);
`

export const ProductDetailDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.6;
    color: var(--text-secondary);
  }
`

export const ProductDetailActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const ProductDetailQuantity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

export const QuantityLabel = styled.label`
  font-size: 0.9375rem;
  color: var(--text-secondary);
  font-weight: 500;
`

export const QuantitySelect = styled.select`
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  cursor: pointer;
`

export const ProductDetailError = styled.div`
  text-align: center;
  padding: 4rem 2rem;

  h1 {
    margin: 0 0 1rem 0;
  }

  p {
    margin: 0 0 2rem 0;
    color: var(--text-secondary);
  }
`
