# Agent Hiring Implementation Plan

## Step 1: Enhanced Agent Data Models
```typescript:src/types/index.ts
// ... existing code ...
interface Agent {
  id: string;
  type: 'manager' | 'yield-bot' | 'risk-analyst' | 'news-aggregator';
  cost: number;
  unlockedAtLevel: number;
  personalityTraits: string[];
  communicationStyle: 'formal' | 'casual' | 'technical';
  status: 'active' | 'locked' | 'available';
  hiredAt?: number; // Added for cost tracking
}
```

## Step 2: Updated Mock Agents
```typescript:src/data/mockData.ts
export const mockAgents: Agent[] = [
  // ... existing agents ...
  {
    id: "news-bot-1",
    type: "news-aggregator",
    cost: 50,
    unlockedAtLevel: 2,
    personalityTraits: ["informative", "alert", "fast"],
    communicationStyle: "technical",
    status: "locked"
  }
];
```

## Step 3: Hiring UI
```typescript:src/ui/UIManager.ts
// ... existing code ...
async showAgentHiring(availableAgents: Agent[], balance: number) {
  console.log(chalk.bold(`\n💼 Available Agents (Balance: $${balance})`));
  
  const choices = availableAgents.map(agent => ({
    name: `${agent.type} - Cost: $${agent.cost}/month | ${agent.personalityTraits.join(', ')}`,
    value: agent.id
  }));
  
  return inquirer.prompt({
    type: 'list',
    name: 'agentId',
    message: 'Select agent to hire:',
    choices: [...choices, { name: '↩️ Cancel', value: 'back' }]
  });
}

// Added for management
async showAgentManagement(activeAgents: Agent[]) {
  console.log(chalk.bold("\n👥 Active Agents"));
  
  const choices = activeAgents.map(agent => ({
    name: `${agent.type} | Cost: $${agent.cost}/month`,
    value: agent.id
  }));
  
  return inquirer.prompt({
    type: 'list',
    name: 'agentId',
    message: 'Manage agents:',
    choices: [...choices, { name: '↩️ Back', value: 'back' }]
  });
}
```

## Step 4: Game Engine Integration
```typescript:src/models/GameEngine.ts
// Hiring system
hireAgent(agentId: string) {
  const agent = mockAgents.find(a => a.id === agentId);
  
  if (!agent) throw new Error("Agent not found");
  if (this.gameState.portfolio.totalBalance < agent.cost) 
    throw new Error("Insufficient funds");
  if (this.gameState.player.level < agent.unlockedAtLevel)
    throw new Error("Level requirement not met");
  
  this.activeAgents.push({ 
    ...agent, 
    status: 'active',
    hiredAt: this.gameState.currentDay
  });
  this.gameState.portfolio.totalBalance -= agent.cost;
  
  return `Hired ${agent.type} for $${agent.cost}/month`;
}

// Firing system
fireAgent(agentId: string) {
  const index = this.activeAgents.findIndex(a => a.id === agentId);
  if (index === -1) throw new Error("Agent not active");
  
  this.activeAgents.splice(index, 1);
  return `Dismissed ${agentId}`;
}

// Monthly costs
processMonthlyCosts() {
  const totalCost = this.activeAgents.reduce((sum, a) => sum + a.cost, 0);
  this.gameState.portfolio.totalBalance -= totalCost;
  return totalCost;
}
```

## Step 5: Agent Effects System
```typescript:src/models/GameEngine.ts
// Add to processDay()
private calculateAgentEffects() {
  return this.activeAgents.reduce((effects, agent) => {
    switch(agent.type) {
      case 'news-aggregator':
        effects.apyMultiplier += 0.05;
        break;
      case 'yield-bot':
        effects.automationSpeed += 2;
        break;
    }
    return effects;
  }, { apyMultiplier: 0, automationSpeed: 1 });
}

// Update daily processing
processDay() {
  const effects = this.calculateAgentEffects();
  // Apply effects to game calculations...
}
```

## Step 6: Dialog Flow Updates
```typescript:src/models/DialogManager.ts
async handleAgentManagement() {
  const { action } = await this.uiManager.prompt([{
    type: 'list',
    name: 'action',
    message: 'Agent management:',
    choices: ['Hire new', 'Manage existing', 'Back']
  }]);

  if (action === 'Hire new') {
    await this.handleAgentHiring();
  } else if (action === 'Manage existing') {
    const { agentId } = await this.uiManager.showAgentManagement(
      this.gameEngine.activeAgents
    );
    
    if (agentId !== 'back') {
      this.gameEngine.fireAgent(agentId);
      await this.uiManager.showSuccess(`Agent dismissed`);
    }
  }
}
```

## Step 7: Cost Reminders
```typescript:src/models/GameEngine.ts
// Add to processDay()
if (this.gameState.currentDay % 30 === 0) {
  const cost = this.processMonthlyCosts();
  this.addToDailyReport(`Agent costs: -$${cost}`);
  
  if (this.gameState.portfolio.totalBalance < 0) {
    this.addToDailyReport("WARNING: Negative balance! Agents may become inactive");
  }
}
```

## Implementation Checklist
1. Add agent management UI components
2. Implement hire/fire engine methods
3. Add monthly cost system
4. Create agent effect calculations
5. Integrate with dialog system
6. Add balance warnings
7. Implement level requirements


describe('Agent System', () => {
  it('should deduct monthly costs automatically', () => {
    const engine = new GameEngine({
      activeAgents: [{ cost: 50 }, { cost: 30 }],
      portfolio: { totalBalance: 100 },
      currentDay: 30
    });
    engine.processDay();
    expect(engine.portfolio.totalBalance).toBe(20);
  });

  it('should apply news aggregator APY bonus', () => {
    const