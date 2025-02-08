import { Button } from "@/components/ui/button"
import type React from "react"

interface MessageProps {
  isBot?: boolean
  children: React.ReactNode
  actions?: string[]
}

export function Message({ isBot = false, children, actions }: MessageProps) {
  return (
    <div className={`flex gap-4 ${isBot ? "" : "flex-row-reverse"}`}>
      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
        {isBot ? (
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%2010-po9jQ4nk7xCOy8csHHmqlxyNwUvbae.png"
            alt="Deffi"
            className="w-5 h-5"
          />
        ) : (
          <span className="text-sm">K</span>
        )}
      </div>
      <div className="flex flex-col gap-4 max-w-[85%] md:max-w-[70%]">
        <div className={`p-4 rounded-lg ${isBot ? "bg-muted" : "bg-white border border-border"}`}>
          <div className="text-sm">{children}</div>
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, i) => (
              <Button key={i} variant="outline" size="sm" className="text-xs h-8">
                {action}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

