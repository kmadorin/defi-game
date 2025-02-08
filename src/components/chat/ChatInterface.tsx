"use client"
import { useState } from "react"
import { Message } from "@/components/chat/message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

export function ChatInterface() {
  const [messages] = useState([
    {
      isBot: true,
      content:
        "Hi! I'm Deffi, your DEFI portfolio manager. It's great to have you here. May I start by asking your name?",
    },
    {
      isBot: false,
      content: "Kirill",
    },
    {
      isBot: true,
      content:
        "Nice to meet you, Kirill! Now, I'd love to understand what you're aiming for with your investment in decentralized finance.",
      actions: ["I want to understand DeFi", "I want to invest in crypto"],
    },
    {
      isBot: true,
      content: "Got it, thanks! Since you're want to earn on crypto, could you share how you feel about risk?",
      actions: ["Low risk", "Mid risk", "High risk"],
    },
  ])

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 p-6 overflow-y-auto space-y-6 !pt-14 md:!pt-6">
        {messages.map((message, i) => (
          <Message key={i} isBot={message.isBot} actions={message.actions}>
            {message.content}
          </Message>
        ))}
      </div>
      <div className="border-t p-4">
        <div className="flex gap-4 max-w-2xl mx-auto">
          <Input placeholder="Message" className="text-sm h-10 border-border" />
          <Button size="icon" className="h-10 w-10 bg-black hover:bg-black/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

