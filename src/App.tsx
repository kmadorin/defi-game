import { LeftSidebar } from "@/components/LeftSidebar"
import { RightSidebar } from "@/components/RightSidebar"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { MobileNav } from "@/components/MobileNav"
import "@coinbase/onchainkit/styles.css"
import { Providers } from "@/providers/providers"

function App() {
  return (
    <Providers>
        <div className="flex h-screen bg-background overflow-hidden relative">
          <div className="flex h-full w-full relative">
            <MobileNav />
            <LeftSidebar />
            <main className="flex-1 relative">
              <ChatInterface />
            </main>
            <RightSidebar />
          </div>
        </div>
    </Providers>
  )
}

export default App

