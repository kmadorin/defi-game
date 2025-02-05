import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight } from "lucide-react"

interface Message {
  id: number
  sender: "user" | "assistant"
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return

    const newUserMessage: Message = {
      id: messages.length,
      sender: "user",
      content: inputMessage,
    }

    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const newAssistantMessage: Message = {
        id: messages.length + 1,
        sender: "assistant",
        content: `This is a simulated response to: "${inputMessage}"`,
      }
      setMessages((prevMessages) => [...prevMessages, newAssistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white p-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">
          INDUSTRY
        </h1>
        <Button className="bg-blue-600 hover:bg-blue-700">Create Character</Button>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-[300px_1fr_300px] gap-4">
          {/* Left Sidebar */}
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <h2 className="font-medium text-sm">Chat Mode</h2>
              <p className="text-sm text-muted-foreground">Choose how AI agents communicate with each other</p>
              <Select defaultValue="recursive">
                <SelectTrigger>
                  <SelectValue placeholder="Select chat mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recursive">Recursive Chat...</SelectItem>
                  <SelectItem value="direct">Direct Chat</SelectItem>
                  <SelectItem value="group">Group Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Chat History</h2>
                <span className="text-xs text-muted-foreground">0e0D9d...119E</span>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">Assistant {i + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Previous chat message {i + 1}...</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>

          {/* Main Chat Area */}
          <Card className="p-4 flex flex-col h-[calc(100vh-2rem)]">
            <ScrollArea className="flex-grow pr-4 mb-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{message.sender === "user" ? "U" : "A"}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-medium">{message.sender === "user" ? "You" : "Assistant"}</p>
                      <p className="text-muted-foreground">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-medium">Assistant</p>
                      <p className="text-muted-foreground">Typing...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                className="flex-1"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage()
                  }
                }}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Right Sidebar */}
          <Card className="p-4 flex flex-col h-[calc(100vh-2rem)]">
            <div className="space-y-4 flex-grow overflow-hidden">
              {/* Agents Crew Block */}
              <div className="space-y-4 h-full flex flex-col">
                <h2 className="font-medium">Agents Crew</h2>
                <ScrollArea className="flex-grow">
                  <div className="space-y-4 pr-4">
                    {/* Uniswap Agent */}
                    <div className="p-3 bg-muted rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">Uniswap Agent</p>
                          <p className="text-xs text-muted-foreground">DEX Specialist</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Tools:</p>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs bg-background px-2 py-1 rounded">Onchain History</span>
                          <span className="text-xs bg-background px-2 py-1 rounded">Pool Analysis</span>
                          <span className="text-xs bg-background px-2 py-1 rounded">Price Tracking</span>
                        </div>
                      </div>
                    </div>

                    {/* Ethereum Agent */}
                    <div className="p-3 bg-muted rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>E</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">Ethereum Agent</p>
                          <p className="text-xs text-muted-foreground">Smart Contract Expert</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Tools:</p>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs bg-background px-2 py-1 rounded">Contract Audit</span>
                          <span className="text-xs bg-background px-2 py-1 rounded">Gas Tracker</span>
                          <span className="text-xs bg-background px-2 py-1 rounded">Block Explorer</span>
                        </div>
                      </div>
                    </div>

                    {/* NFT Agent */}
                    <div className="p-3 bg-muted rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>N</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">NFT Agent</p>
                          <p className="text-xs text-muted-foreground">Collection Analyst</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Tools:</p>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs bg-background px-2 py-1 rounded">Floor Price</span>
                          <span className="text-xs bg-background px-2 py-1 rounded">Rarity Check</span>
                          <span className="text-xs bg-background px-2 py-1 rounded">Market Stats</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* System Events Block - Visually Separated */}
            <div className="pt-4 mt-4 border-t space-y-4">
              <h2 className="font-medium">System Events</h2>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Agent Connected</span>
                    <span className="text-xs text-muted-foreground">15:04:23</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Uniswap Agent joined the conversation</p>
                </div>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analysis Complete</span>
                    <span className="text-xs text-muted-foreground">15:03:45</span>
                  </div>
                  <p className="text-xs text-muted-foreground">ETH/USDC pool analysis finished</p>
                </div>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tool Activated</span>
                    <span className="text-xs text-muted-foreground">15:02:30</span>
                  </div>
                  <p className="text-xs text-muted-foreground">NFT floor price tracking started</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

