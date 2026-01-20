"use client"

import SearchBar from "@/components/search/SearchBar"
import {
  HeaderContainer,
  HeaderLeft,
  SidebarToggle,
  HeaderSearchWrapper,
  HeaderRight,
} from "@/components/ui/uiStyles"

export default function Header({ onToggleSidebar, isCollapsed }) {
  let toggleLabel = "Collapse sidebar"
  if (isCollapsed) {
    toggleLabel = "Expand sidebar"
  }

  return (
    <HeaderContainer>
      <HeaderLeft>
        <SidebarToggle
          onClick={onToggleSidebar}
          aria-label={toggleLabel}
          title={toggleLabel}
          $isCollapsed={isCollapsed}
        />
      </HeaderLeft>

      <HeaderSearchWrapper>
        <SearchBar />
      </HeaderSearchWrapper>

      <HeaderRight />
    </HeaderContainer>
  )
}
