---
theme: white
highlightTheme: monokai
---

<!-- slide bg="#EDEDED" -->
# Deffi

Your AI-powered DeFi companion that simplifies investing and learning about decentralized finance

---

<!-- slide bg="#EDEDED" -->
## Problem

- Complex DeFi landscape with numerous protocols and strategies makes it difficult to choose optimal investments
- Information overload from rapid DeFi innovation makes staying current challenging
- High learning curve for newcomers to understand protocol mechanics and risks
- Time-consuming manual portfolio management across multiple protocols

---

<!-- slide bg="#EDEDED" -->
## Solution

- Gradual onboarding to DeFi concepts via Onboarding agent
- Simplified DEFI protocols interactions via chat with different specialized AI agents
- Defi strategies explanation and automatic search
- AI-generated daily portfolio updates

---

<!-- slide bg="#EDEDED" -->
## Onboarding agent

- Asks a user about their:
  - Name
  - DeFi investment goals
  - Experience level
  - Risk tolerance
- Updates user's profile

**Technologies used:** Coinbase Agentkit

---

<!-- slide bg="#EDEDED" -->
## Portfolio Manager

- Answers questions and provides information about different DeFi Strategies
- Manages daily wallet operations (balance, swap, deposit/withdraw to Morpho/Aave)  
- Hires other agents (yield optimization, liquidity provisioning, etc.)
- Provides daily updates about user's portfolio
- Executes tasks: liquidation protection, rebalancing, etc.

**Technologies used:** Coinbase Agentkit

---

<!-- slide bg="#EDEDED" -->
## DEFI Strategies Search and Explanation

- Searches Telegram Channels for the best strategies for a user's portfolio
- Explains the strategy, involved protocols and risks (Exa Search, DefiLlama API)
- Posts bounty on BountyCaster to build an agent

**Technologies used:** AWS Bedrock: lambda, sns, dynamoDB, RAG

---

<!-- slide bg="#EDEDED" -->
## DEMO

---

<!-- slide bg="#EDEDED" -->
## Thank you

https://deffi.flowlyapp.live/

t.me/defi_investements_ideas_bot

<style>
:root {
  --r-heading-color: #333;
  --r-main-font-size: 32px;
}
.fragment {
  margin-top: 20px;
}
.reveal .slides {
  text-align: left;
}
.reveal h1,
.reveal h2 {
  text-align: left;
}
</style>