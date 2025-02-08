import { createContext } from "react"

export interface SidebarContextType {
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined) 