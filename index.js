import 'dotenv/config';
import { startOnboarding } from './agents/onboardingAgent.js';
import { initializePortfolioAgent, runPortfolioAgent } from './agents/portfolioAgent.js';
import fs from 'fs';
import inquirer from 'inquirer';

const MEMORY_FILE = "memory.json";

const sessionState = {
  username: null,
  currentAgent: null,  // 'onboarding' or 'portfolio'
  profileData: null,
  wallet: null
};

async function loadExistingProfile() {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      const profileData = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
      if (profileData.username && profileData.experience && profileData.riskTolerance) {
        return profileData;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error reading profile:', error);
    return null;
  }
}

async function askToUseExistingProfile(profile) {
  const { useExisting } = await inquirer.prompt([{
    type: 'confirm',
    name: 'useExisting',
    message: `Found existing profile for ${profile.username} (${profile.experience} level, ${profile.riskTolerance} risk). Would you like to use it?`,
    default: true
  }]);
  return useExisting;
}

async function main() {
  try {
    console.log('🚀 Initializing DeFi Copilot...');
    
    // Check for existing profile
    const existingProfile = await loadExistingProfile();
    let profile;

    if (existingProfile) {
      const useExisting = await askToUseExistingProfile(existingProfile);
      if (useExisting) {
        profile = existingProfile;
        console.log(`\n👋 Welcome back, ${profile.username}!`);
      }
    }
    
    // If no profile or user wants new one, start onboarding
    if (!profile) {
      sessionState.currentAgent = 'onboarding';
      profile = await startOnboarding();
    }
    
    if (profile) {
      sessionState.profileData = profile;
      sessionState.username = profile.username;
      
      // Switch to portfolio agent
      sessionState.currentAgent = 'portfolio';
      const portfolioAgent = await initializePortfolioAgent(profile);
      await runPortfolioAgent(portfolioAgent);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main(); 