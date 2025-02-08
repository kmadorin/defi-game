import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useSidebar } from "@/providers/hooks/use-sidebar"
import { cn } from "@/lib/utils"
import type React from "react" // Added import for React

export function RightSidebar() {
  const { rightSidebarOpen } = useSidebar()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 w-[280px] bg-muted border-l p-6",
        "transform transition-transform duration-300 ease-in-out z-40",
        "md:translate-x-0 md:!relative",
        rightSidebarOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex flex-col gap-4 h-full overflow-y-auto pt-14 md:pt-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xxs font-semibold tracking-wide">AGENTS</h2>
          <Button variant="ghost" size="sm" className="text-xs h-8">
            <PlusCircle className="w-4 h-4 mr-2" />
            ADD NEW
          </Button>
        </div>

        <div className="space-y-4">
          <AgentCard
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%2010-po9jQ4nk7xCOy8csHHmqlxyNwUvbae.png"
                alt="Deffi"
                className="w-5 h-5"
              />
            }
            title="Deffi Portfolio Manager"
            subtitle="Smart Contract Expert"
            isActive
          />
          <AgentCard
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Layer_x0020_1-oBoVb628yeKi9AhLO6BBnk6ls7svLx.png"
                alt="Ethereum"
                className="w-4 h-6"
              />
            }
            title="Ethereum Agent"
            subtitle="Smart Contract Expert"
          />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8">
              Contract Audit
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              Gas Tracker
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              Block Explorer
            </Button>
          </div>

          <AgentCard
            icon={
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%2018-hRoWL4LEJgSV3jGWPO4UYlAnToMmia.png"
                alt="Uniswap"
                className="w-5 h-5"
              />
            }
            title="Uniswap Agent"
            subtitle="Smart Contract Expert"
          />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8">
              Onchain History
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              Pool Analysis
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              Price Tracking
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}

interface AgentCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  isActive?: boolean
}

function AgentCard({ icon, title, subtitle, isActive = false }: AgentCardProps) {
  return (
    <div className={`p-3 rounded-lg ${isActive ? "bg-white" : "bg-transparent"}`}>
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">{icon}</div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
    </div>
  )
}

