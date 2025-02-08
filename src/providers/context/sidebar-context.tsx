import { createContext, useContext } from "react"

interface SidebarContextType {
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
} 