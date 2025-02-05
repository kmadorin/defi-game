import { Button } from './components/ui/button'

function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-center">Welcome to DeFi Game</h1>
        <div className="flex gap-4 justify-center">
          <Button variant="default">Default Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
        </div>
      </div>
    </div>
  )
}

export default App
