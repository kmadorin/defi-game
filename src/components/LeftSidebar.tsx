import { Button } from "@/components/ui/button"
import { useSidebar } from "@/providers/hooks/use-sidebar"
import { cn } from "@/lib/utils"
import { WalletDefault } from '@coinbase/onchainkit/wallet'
import { useAccount, useBalance, useSwitchChain } from 'wagmi'
import { formatEther } from 'viem'

export function LeftSidebar() {
  const { leftSidebarOpen } = useSidebar()
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { chains, switchChain } = useSwitchChain()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 w-[280px] bg-muted border-r p-6",
        "transform transition-transform duration-300 ease-in-out z-40",
        "md:translate-x-0 md:!relative",
        leftSidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex flex-col gap-8 h-full pt-14 md:pt-0">
        <div className="md:flex items-center gap-2 hidden">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20(1)-FiwTQiEguX0PUFKJHkQBVZxHzoJgSk.png"
            alt="Deffi Logo"
            className="h-8"
          />
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {chains.map((chain) => (
              <Button 
                key={chain.id} 
                onClick={() => switchChain({ chainId: chain.id })}
                variant="outline"
                size="sm"
                className="text-xs h-8"
              >
                {chain.name}
              </Button>
            ))}
          </div>
          <WalletDefault />
          <div className="text-3xl font-bold tracking-tight mt-4">
            {formatEther(balance?.value ?? 0n)} {balance?.symbol ?? 'USDC'}
          </div>
          <div className="font-mono text-xs text-muted-foreground mt-1">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x1234...5678'}
          </div>
          <Button className="mt-4 w-24 bg-black hover:bg-black/90 text-white" variant="default">
            TOP UP
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xxs font-semibold tracking-wide mb-4">DAILY PORTFOLIO REPORT</h3>
            <div>
              <div className="text-xxs text-muted-foreground tracking-wide">BALANCE CHANGE</div>
              <div className="text-success">+$120.50 (2.4%)</div>
            </div>
          </div>

          <div>
            <h3 className="text-xxs font-semibold tracking-wide mb-4">ACTIVE STRATEGIES</h3>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="text-xs h-8">
                DeFi Yield Farming
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8">
                NFT Flipping
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-xxs font-semibold tracking-wide mb-4">TOP PERFORMERS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>ETH/USDC LP</span>
                <span className="text-success">+5.2%</span>
              </div>
              <div className="flex justify-between">
                <span>BORED APE #1234</span>
                <span className="text-success">+12.0%</span>
              </div>
              <div className="flex justify-between">
                <span>BTC/ETH ARBITRAGE</span>
                <span className="text-success">+3.1%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xxs font-semibold tracking-wide mb-4">SYSTEM EVENTS</h3>
            <div className="space-y-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="p-2 bg-white rounded-md">
                    <div className="text-xxs text-muted-foreground font-mono">NFT Agent at 15:06:23</div>
                    <div className="text-xs">System event: image_created</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

