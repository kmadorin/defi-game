import { createContext, useContext, useState } from "react"

interface SidebarContextType {
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  const toggleLeftSidebar = () => setLeftSidebarOpen((prev) => !prev)
  const toggleRightSidebar = () => setRightSidebarOpen((prev) => !prev)

  return (
    <SidebarContext.Provider
      value={{
        leftSidebarOpen,
        rightSidebarOpen,
        toggleLeftSidebar,
        toggleRightSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within SidebarProvider")
  return context
}

