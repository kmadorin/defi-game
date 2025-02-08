import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useSidebar } from "../providers/sidebar-provider"

export function MobileNav() {
  const { toggleLeftSidebar, toggleRightSidebar } = useSidebar()

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b px-4 flex justify-between items-center z-50">
      <Button variant="ghost" size="icon" className="h-10 w-10" onClick={toggleLeftSidebar}>
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20(1)-FiwTQiEguX0PUFKJHkQBVZxHzoJgSk.png"
        alt="Deffi Logo"
        className="h-8"
      />
      <Button variant="ghost" size="icon" className="h-10 w-10" onClick={toggleRightSidebar}>
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle agents</span>
      </Button>
    </div>
  )
}

