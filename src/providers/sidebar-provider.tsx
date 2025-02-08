import { useState } from "react"
import { SidebarContext } from "./context/sidebar-context"

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

