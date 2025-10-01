import Logo from "@/components/logo"
import UserMenu from "@/components/user-menu"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from "@/context/AuthContext"
import { useLocation } from "react-router-dom"
import * as preloadUtils from "@/utils/preload"

// Navigation links array to be used in both desktop and mobile menus
const allNavigationLinks = [
  { href: "/dashboard", label: "Dashboard", page: "dashboard" },
  { href: "/assets", label: "Assets", page: "assets" },
  { href: "/inspections", label: "Inspections", page: "inspections" },
  { href: "/analytics", label: "Analytics", page: "analytics" },
  { href: "/alerts", label: "Alerts", page: "alerts" },
]

interface NavbarProps {
  onLogout?: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const { canAccessPage } = useAuth()
  const location = useLocation()
  
  // Filter navigation links based on user permissions
  const navigationLinks = allNavigationLinks.filter(link => canAccessPage(link.page))
  
  // Check if a link is the current page
  const isActivePage = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }
  
  // Preload route on hover for instant navigation
  const handleLinkHover = (href: string) => {
    const preloadMap: Record<string, () => Promise<any>> = {
      '/dashboard': preloadUtils.preloadDashboard,
      '/assets': preloadUtils.preloadAssets,
      '/inspections': preloadUtils.preloadInspections,
      '/analytics': preloadUtils.preloadAnalytics,
      '/alerts': preloadUtils.preloadAlerts,
    }
    
    const preloadFn = preloadMap[href]
    if (preloadFn) {
      preloadFn()
    }
  }
  
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => {
                    const isActive = isActivePage(link.href)
                    return (
                      <NavigationMenuItem key={index} className="w-full">
                        <NavigationMenuLink 
                          href={link.href}
                          onMouseEnter={() => handleLinkHover(link.href)}
                          className={`py-1.5 px-3 rounded-md transition-colors ${
                            isActive 
                              ? 'bg-primary text-primary-foreground font-semibold' 
                              : 'hover:bg-accent'
                          }`}
                        >
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    )
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-primary hover:text-primary/90">
              <Logo />
            </a>
            {/* Navigation menu */}
            <NavigationMenu className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link, index) => {
                  const isActive = isActivePage(link.href)
                  return (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink
                        href={link.href}
                        onMouseEnter={() => handleLinkHover(link.href)}
                        className={`py-1.5 px-3 rounded-full font-medium transition-colors ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:text-primary hover:bg-accent'
                        }`}
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* User menu */}
          <UserMenu onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}
