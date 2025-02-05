import Chat from "@/Chat"
import { Providers } from "@/providers/providers"
import '@coinbase/onchainkit/styles.css'; 

function App() {

  return (
    <Providers>
      <Chat />
    </Providers>
  )
}

export default App
