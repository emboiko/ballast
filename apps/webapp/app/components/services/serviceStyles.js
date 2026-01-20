import styled, { keyframes } from "styled-components"
import Image from "next/image"

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
`

export const ServicesPage = styled.div`
  padding: 2rem 0;
`

export const ServiceSection = styled.section`
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  &:nth-child(even) {
    background-color: var(--bg-secondary);
  }

  @media (max-width: 768px) {
    .service-section-content {
      flex-direction: column;
      text-align: center;
    }
  }
`

export const ServiceSectionContent = styled.div`
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    grid-template-columns: 1fr;
  }
`

export const ServiceSectionImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background-color: var(--bg-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-color);
  position: relative;
`

export const ServiceImageFallback = styled.div`
  font-size: 8rem;
  opacity: 0.5;
`

export const ServiceImage = styled(Image)`
  object-fit: cover;
`

export const ServiceSectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const ServiceSectionTitle = styled.h2`
  margin: 0;
  font-size: 2.5rem;
  color: var(--text-primary);
`

export const ServiceSectionDescription = styled.p`
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-secondary);
`

export const ServiceSectionPrice = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: var(--button-primary-bg);
`

export const ServiceSectionScrollIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  color: var(--text-secondary);
  animation: ${bounce} 2s infinite;
`

export const ServiceDetailPage = styled.div`
  padding: 2rem 0;
`

export const ServiceDetailBack = styled.a`
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

export const ServiceDetailContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export const ServiceDetailImageColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const ServiceDetailImage = styled.div`
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

export const ServiceDetailThumbnailRow = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
`

export const ServiceDetailThumbnailButton = styled.button`
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

export const ServiceDetailThumbnailImage = styled(Image)`
  object-fit: cover;
`

export const ServiceImageFallbackLarge = styled.div`
  font-size: 8rem;
  opacity: 0.5;
`

export const ServiceDetailImageAsset = styled(Image)`
  object-fit: cover;
`

export const ServiceDetailInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

export const ServiceDetailHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const ServiceDetailName = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  color: var(--text-primary);
`

export const ServiceDetailPrice = styled.p`
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: var(--button-primary-bg);
`

export const ServiceDetailDescription = styled.div`
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

export const ServiceDetailLongDescription = styled.div`
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

export const ServiceDetailActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`

export const ServiceDetailError = styled.div`
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
