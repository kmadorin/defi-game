"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus } from "lucide-react"

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
}

interface DailyReport {
  date: string
  balanceChange: string
  currentBalance: string
  activeStrategies: string[]
  topPerformers: { name: string; performance: string }[]
}

export default function PixelChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [activeTab, setActiveTab] = useState<"portfolio" | "agents">("portfolio")
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState("")
  const [dailyReport, setDailyReport] = useState<DailyReport>({
    date: new Date().toLocaleDateString(),
    balanceChange: "+$120.50 (2.4%)",
    currentBalance: "$5,120.50",
    activeStrategies: ["DeFi Yield Farming", "NFT Flipping", "Crypto Arbitrage"],
    topPerformers: [
      { name: "ETH/USDC LP", performance: "+5.2%" },
      { name: "Bored Ape #1234", performance: "+12.0%" },
      { name: "BTC/ETH Arbitrage", performance: "+3.1%" },
    ],
  })

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return

    const newMessage: Message = {
      id: Date.now(),
      sender: "You",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: Date.now(),
        sender: "Assistant",
        content: `Response to: "${inputMessage}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, response])
    }, 1000)
  }

  const handleTopUp = () => {
    // Implement top-up logic here
    console.log(`Topping up with ${topUpAmount} USDC`)
    setIsTopUpOpen(false)
    setTopUpAmount("")
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Header */}
      <header className="bg-white px-4 py-2 flex justify-between items-center border-b shadow-sm">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <h1
          className="text-2xl font-bold text-center"
          style={{
            fontFamily: '"Press Start 2P", system-ui',
            background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          INDUSTRY
        </h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
          style={{ fontFamily: '"Press Start 2P", system-ui', fontSize: "0.7rem" }}
        >
          Create Character
        </Button>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-[300px_1fr_300px] gap-4">
          {/* Left Sidebar */}
          <div className="space-y-4">
            {/* Wallet Management Block */}
            <Card className="p-4 shadow-lg">
              <h2
                className="font-medium mb-4"
                style={{
                  fontFamily: '"Press Start 2P", system-ui',
                  fontSize: "0.8rem",
                  color: "#4F46E5",
                }}
              >
                Wallet
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Address:</span>
                  <span className="text-sm text-muted-foreground font-mono">0x1234...5678</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Balance:</span>
                  <span className="text-sm text-muted-foreground">1000 USDC</span>
                </div>
                <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-2 bg-green-600 hover:bg-green-700" size="sm">
                      <Plus className="w-4 h-4 mr-2" /> Top Up
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle style={{ fontFamily: '"Press Start 2P", system-ui', fontSize: "1rem" }}>
                        Top Up Wallet
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                          Amount
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          className="col-span-3"
                          placeholder="Enter USDC amount"
                        />
                      </div>
                    </div>
                    <Button onClick={handleTopUp} className="w-full bg-green-600 hover:bg-green-700">
                      Confirm Top Up
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            <Card className="p-4 shadow-lg">
              <h2
                className="font-medium mb-2"
                style={{
                  fontFamily: '"Press Start 2P", system-ui',
                  fontSize: "0.8rem",
                  color: "#4F46E5",
                }}
              >
                Chat Mode
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Choose how AI agents communicate with each other</p>
              <Select defaultValue="recursive">
                <SelectTrigger className="w-full rounded-xl border-2 border-indigo-100">
                  <SelectValue placeholder="Select chat mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recursive">Recursive Chat...</SelectItem>
                  <SelectItem value="direct">Direct Chat</SelectItem>
                  <SelectItem value="group">Group Chat</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            <Card className="p-4 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2
                  style={{
                    fontFamily: '"Press Start 2P", system-ui',
                    fontSize: "0.8rem",
                    color: "#4F46E5",
                  }}
                >
                  Chat History
                </h2>
                <span className="text-xs text-muted-foreground font-mono">0e0D9d...119E</span>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium" style={{ color: "#4F46E5" }}>
                          {msg.sender}
                        </p>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Main Chat Area */}
          <Card className="relative shadow-lg">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "portfolio"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={{ fontFamily: '"Press Start 2P", system-ui', fontSize: "0.7rem" }}
                onClick={() => setActiveTab("portfolio")}
              >
                Portfolio Manager
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "agents"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={{ fontFamily: '"Press Start 2P", system-ui', fontSize: "0.7rem" }}
                onClick={() => setActiveTab("agents")}
              >
                Agents Chat
              </button>
            </div>

            <ScrollArea className="h-[600px] p-4">
              {activeTab === "portfolio" ? (
                <DailyReportCard report={dailyReport} />
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{msg.sender}</p>
                          <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                        </div>
                        <p className="text-muted-foreground">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Just ask..."
                  className="flex-1 rounded-xl border-2 border-indigo-100"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage()
                    }
                  }}
                />
                <Button size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700" onClick={handleSendMessage}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Agents Crew Block */}
            <Card className="p-4 shadow-lg">
              <h2
                className="font-medium mb-4"
                style={{
                  fontFamily: '"Press Start 2P", system-ui',
                  fontSize: "0.8rem",
                  color: "#4F46E5",
                }}
              >
                Agents Crew
              </h2>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4 pr-4">
                  {/* Uniswap Agent */}
                  <div className="p-3 bg-gray-50 rounded-lg space-y-3">
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
                        <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-100">
                          Onchain History
                        </span>
                        <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-100">
                          Pool Analysis
                        </span>
                        <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-100">
                          Price Tracking
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ethereum Agent */}
                  <div className="p-3 bg-gray-50 rounded-lg space-y-3">
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
                        <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-100">
                          Contract Audit
                        </span>
                        <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-100">Gas Tracker</span>
                        <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-100">
                          Block Explorer
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* NFT Agent */}
                  <div className="p-3 bg-gray-50 rounded-lg space-y-3">
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
                        <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-100">Floor Price</span>
                        <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-100">
                          Rarity Check
                        </span>
                        <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-100">
                          Market Stats
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </Card>

            {/* System Events Block */}
            <Card className="p-4 shadow-lg">
              <h2
                className="font-medium mb-4"
                style={{
                  fontFamily: '"Press Start 2P", system-ui',
                  fontSize: "0.8rem",
                  color: "#4F46E5",
                }}
              >
                System Events
              </h2>
              <div className="space-y-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-pink-500">Yasmin</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">image_created</span>
                    <span className="text-xs text-muted-foreground ml-auto">15:04:23</span>
                  </div>
                  <p className="text-sm text-muted-foreground">System event: image_created</p>
                  <div className="mt-2 rounded-lg overflow-hidden">
                    <img src="/placeholder.svg" alt="Created image" className="w-full h-32 object-cover" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function DailyReportCard({ report }: { report: DailyReport }) {
  return (
    <Card className="mb-4 p-4 shadow-lg bg-white">
      <h3
        className="text-lg font-bold mb-2"
        style={{ fontFamily: '"Press Start 2P", system-ui', fontSize: "0.9rem", color: "#4F46E5" }}
      >
        Daily Portfolio Report
      </h3>
      <p className="text-sm text-gray-500 mb-4">Date: {report.date}</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium">Balance Change</p>
          <p className="text-lg font-bold text-green-600">{report.balanceChange}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Current Balance</p>
          <p className="text-lg font-bold">{report.currentBalance}</p>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Active Strategies</p>
        <div className="flex flex-wrap gap-2">
          {report.activeStrategies.map((strategy, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {strategy}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Top Performers</p>
        <div className="space-y-2">
          {report.topPerformers.map((performer, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{performer.name}</span>
              <span className="text-sm font-bold text-green-600">{performer.performance}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

