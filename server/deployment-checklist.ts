/**
 * TULBOXX DEPLOYMENT CHECKLIST
 * 
 * This file provides a comprehensive checklist for deploying Tulboxx
 * from demo mode to production with proper data management.
 */

export interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  required: boolean;
  category: 'preparation' | 'data' | 'testing' | 'production';
}

export const DEPLOYMENT_CHECKLIST: DeploymentStep[] = [
  // Preparation Phase
  {
    id: 'demo-backup',
    name: 'Backup Demo Data',
    description: 'Create backup of current demo data for reference',
    completed: false,
    required: true,
    category: 'preparation'
  },
  {
    id: 'environment-check',
    name: 'Environment Variables',
    description: 'Verify all production environment variables are set',
    completed: false,
    required: true,
    category: 'preparation'
  },
  {
    id: 'api-keys-verify',
    name: 'API Keys Verification',
    description: 'Test OpenAI API key and other external services',
    completed: false,
    required: true,
    category: 'preparation'
  },

  // Data Management Phase
  {
    id: 'clear-demo-data',
    name: 'Clear Demo Data',
    description: 'Remove all demo customers, jobs, estimates, and invoices',
    completed: false,
    required: true,
    category: 'data'
  },
  {
    id: 'setup-beta-accounts',
    name: 'Setup Beta Testing Accounts',
    description: 'Create accounts for 2-4 beta testers with sample data',
    completed: false,
    required: false,
    category: 'data'
  },
  {
    id: 'seed-production-data',
    name: 'Seed Production Data',
    description: 'Install fresh data structure for production use',
    completed: false,
    required: true,
    category: 'data'
  },

  // Testing Phase
  {
    id: 'workflow-testing',
    name: 'Core Workflow Testing',
    description: 'Test estimate creation, job management, and invoicing',
    completed: false,
    required: true,
    category: 'testing'
  },
  {
    id: 'ai-features-test',
    name: 'AI Features Testing',
    description: 'Verify AI scheduling and estimate generation',
    completed: false,
    required: true,
    category: 'testing'
  },
  {
    id: 'mobile-responsiveness',
    name: 'Mobile Responsiveness',
    description: 'Test on mobile devices for field worker usability',
    completed: false,
    required: true,
    category: 'testing'
  },

  // Production Phase
  {
    id: 'deploy-to-production',
    name: 'Deploy to Production',
    description: 'Deploy application to production environment',
    completed: false,
    required: true,
    category: 'production'
  },
  {
    id: 'monitoring-setup',
    name: 'Setup Monitoring',
    description: 'Configure error tracking and performance monitoring',
    completed: false,
    required: true,
    category: 'production'
  },
  {
    id: 'beta-user-onboarding',
    name: 'Beta User Onboarding',
    description: 'Provide access and training to beta testers',
    completed: false,
    required: false,
    category: 'production'
  }
];

export class DeploymentChecker {
  private checklist: DeploymentStep[] = [...DEPLOYMENT_CHECKLIST];

  markCompleted(stepId: string): void {
    const step = this.checklist.find(s => s.id === stepId);
    if (step) {
      step.completed = true;
    }
  }

  getProgress(): { completed: number; total: number; percentage: number } {
    const required = this.checklist.filter(s => s.required);
    const completed = required.filter(s => s.completed);
    return {
      completed: completed.length,
      total: required.length,
      percentage: Math.round((completed.length / required.length) * 100)
    };
  }

  getStepsByCategory(category: DeploymentStep['category']): DeploymentStep[] {
    return this.checklist.filter(s => s.category === category);
  }

  isReadyForProduction(): boolean {
    const required = this.checklist.filter(s => s.required);
    return required.every(s => s.completed);
  }

  getNextSteps(): DeploymentStep[] {
    return this.checklist.filter(s => !s.completed && s.required).slice(0, 3);
  }
}

export const deploymentChecker = new DeploymentChecker();