"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import ThemeToggle from "@/components/ui/ThemeToggle"
import {
  SidebarContainer,
  SidebarHeader,
  SidebarLogoLink,
  SidebarLogo,
  SidebarBottomButtons,
  LogoIcon,
  LogoText,
  SidebarNav,
  NavItem,
  NavItemActive,
  NavIcon,
  NavLabel,
  SidebarFooter,
  UserInfo,
  UserAvatar,
  UserDetails,
  UserEmail,
  UserRole,
  LogoutButton,
} from "@/components/ui/uiStyles"

const navItems = [
  { href: "/", icon: "📊", label: "Dashboard" },
  { href: "/users", icon: "👥", label: "Users" },
  { href: "/orders", icon: "📦", label: "Orders" },
  { href: "/refunds", icon: "↩️", label: "Refunds" },
  { href: "/catalog/products", icon: "🗂️", label: "Catalog" },
  { href: "/communications/email", icon: "✉️", label: "Communications" },
]

export default function Sidebar({ isCollapsed }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const getInitials = (email) => {
    if (!email) {
      return "?"
    }
    return email.charAt(0).toUpperCase()
  }

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <SidebarHeader $isCollapsed={isCollapsed}>
        <SidebarLogoLink as={Link} href="/" aria-label="Go to dashboard">
          <SidebarLogo>
            <LogoIcon>💸</LogoIcon>
            <LogoText $isCollapsed={isCollapsed}>Ballast</LogoText>
          </SidebarLogo>
        </SidebarLogoLink>
      </SidebarHeader>

      <SidebarNav>
        {navItems.map((item) => {
          let NavComponent = NavItem
          if (isActive(item.href)) {
            NavComponent = NavItemActive
          }

          let title = undefined
          if (isCollapsed) {
            title = item.label
          }

          return (
            <NavComponent
              key={item.href}
              as={Link}
              href={item.href}
              title={title}
              $isCollapsed={isCollapsed}
            >
              <NavIcon>{item.icon}</NavIcon>
              <NavLabel $isCollapsed={isCollapsed}>{item.label}</NavLabel>
            </NavComponent>
          )
        })}
      </SidebarNav>

      <SidebarFooter $isCollapsed={isCollapsed}>
        {!isCollapsed && (
          <UserInfo>
            <UserAvatar>{getInitials(user?.email)}</UserAvatar>
            <UserDetails $isCollapsed={isCollapsed}>
              <UserEmail>{user?.email}</UserEmail>
              <UserRole>Admin</UserRole>
            </UserDetails>
          </UserInfo>
        )}
        <SidebarBottomButtons $isCollapsed={isCollapsed}>
          <ThemeToggle isCollapsed={isCollapsed} />
          <LogoutButton
            onClick={logout}
            $isCollapsed={isCollapsed}
            aria-label="Log out"
            title="Log out"
          >
            <NavIcon>🔒</NavIcon>
            {!isCollapsed && <NavLabel $isCollapsed={false}>Log out</NavLabel>}
          </LogoutButton>
        </SidebarBottomButtons>
      </SidebarFooter>
    </SidebarContainer>
  )
}
