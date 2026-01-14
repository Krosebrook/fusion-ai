# User Journey Analyzer - Documentation

## Overview
The User Journey Analyzer is an AI-powered tool that maps user flows, identifies friction points, and generates actionable A/B test scenarios. It combines the **UserJourneyMapper** AI agent with automated UX research capabilities.

---

## Features

### 1. **Preset Scenarios**
Pre-configured complex user journeys with detailed analysis prompts:

- **New User First-Time Recognition** - Onboarding → first recognition sent
- **Admin Dispute Resolution** - Handling flagged content moderation
- **Owner Gamification Setup** - Configuring points, badges, leaderboards
- **Cross-Department Recognition Flow** - Multi-approval workflows
- **Complete User Onboarding to Activation** - Signup → first value realization
- **Admin Bulk User Management** - Bulk operations with safeguards

Each preset includes:
- **Role** (User/Admin/Owner)
- **Flow type** (Onboarding/Recognition/Moderation/etc.)
- **Detailed prompt** with step-by-step journey mapping instructions
- **Icon & description** for quick identification

### 2. **Custom Journey Analysis**
Configure manual analysis with:
- **Role selection** (User, Admin, Owner)
- **Flow selection** (Onboarding, Recognition, Moderation, Gamification, Custom)
- **Custom prompt input** for unique scenarios

### 3. **AI-Driven A/B Test Generation**
Automatically generates experiment scenarios from identified friction points:

**For each friction point, AI creates:**
- **Hypothesis** - Expected improvement
- **Variant A (Control)** - Current design with detailed specs
- **Variant B (Treatment)** - Proposed changes with specific UI/UX modifications
- **Success Metrics** - Measurable KPIs (conversion rate, time on task, error rate)
- **Implementation Details** - Technical requirements
- **Test Duration & Sample Size** - Statistical recommendations
- **Risk Assessment** - Potential negative impacts

---

## Components

### `pages/UserJourneyAnalyzer.js`
Main page component orchestrating the analysis flow.

**State Management:**
```javascript
const [selectedRole, setSelectedRole] = useState('user');
const [selectedFlow, setSelectedFlow] = useState('onboarding');
const [selectedPreset, setSelectedPreset] = useState(null);
const [conversation, setConversation] = useState(null);
const [abTestScenarios, setAbTestScenarios] = useState(null);
```

**Key Functions:**
- `handlePresetSelect(presetKey)` - Loads preset configuration
- `handleStartAnalysis()` - Initiates AI agent conversation
- `generateABTests()` - Extracts friction points and generates test scenarios
- `handleSimulateTest(scenario)` - Triggers A/B test simulation

### `components/user-journey/ABTestScenarios.jsx`
Interactive display of generated A/B test scenarios.

**Features:**
- Tabbed interface (Overview, Variants, Metrics, Implementation)
- Priority-based color coding (High/Medium/Low)
- Copy & export functionality
- Simulation trigger buttons

**Props:**
```typescript
interface ABTestScenariosProps {
  scenarios: Array<ABTestScenario>;
  onSimulate?: (scenario: ABTestScenario) => void;
}
```

### `functions/generateABTestScenarios.js`
Backend function that uses AI to generate test scenarios.

**Input:**
```json
{
  "analysisContent": "Full journey analysis from AI agent",
  "role": "user|admin|owner",
  "flow": "onboarding|recognition|moderation|etc."
}
```

**Output:**
```json
{
  "success": true,
  "scenarios": [
    {
      "id": "unique-id",
      "frictionPoint": "Confusing navigation",
      "hypothesis": "Simplified nav will increase completion by 25%",
      "variantA": { "name": "Control", "description": "...", "designDetails": [...] },
      "variantB": { "name": "Treatment", "description": "...", "keyChanges": [...] },
      "successMetrics": [
        { "metric": "Task completion rate", "target": "85%", "priority": "high" }
      ],
      "implementationDetails": "...",
      "testDuration": "2 weeks",
      "recommendedSampleSize": "1,000 users per variant",
      "riskAssessment": "...",
      "priority": "high"
    }
  ],
  "summary": "Generated 5 high-impact test scenarios"
}
```

---

## Usage Flow

### 1. **Select Preset or Configure Custom**
```javascript
// Preset selection auto-fills role, flow, and detailed prompt
handlePresetSelect('first-recognition');

// Or configure manually
setSelectedRole('admin');
setSelectedFlow('moderation');
setCustomPrompt('Analyze the dispute escalation flow...');
```

### 2. **Start Analysis**
```javascript
// Creates agent conversation and sends prompt
await handleStartAnalysis();

// Agent responds with:
// - Step-by-step journey map
// - Friction point identification
// - Mermaid flowchart visualization
// - Actionable recommendations
```

### 3. **Generate A/B Tests**
```javascript
// Extracts friction points from analysis
await generateABTests();

// AI generates 3-5 test scenarios with:
// - Specific UI/UX changes
// - Measurable success criteria
// - Implementation roadmap
```

### 4. **Review & Simulate**
```javascript
// User reviews test details in tabbed interface
// Clicks "Simulate" to trigger test setup
handleSimulateTest(scenario);
```

---

## Mermaid Flowchart Support

The analyzer detects and renders Mermaid syntax in AI responses:

```markdown
```mermaid
graph TD
    A[User lands] --> B{Has account?}
    B -->|No| C[Sign up flow]
    B -->|Yes| D[Login]
    C --> E[Friction: Long form]
    D --> F[Dashboard]
```
```

Rendered using `components/visualization/MermaidDiagram.jsx` with dark theme and custom colors.

---

## Preset Prompt Template

Each preset follows this structure:

```javascript
{
  name: 'Scenario Name',
  role: 'user|admin|owner',
  flow: 'onboarding|recognition|etc.',
  icon: '🎉',
  description: 'Brief description',
  prompt: `Analyze the complete journey from:
1. Step one
2. Step two
3. Step three
...

Identify friction points such as: X, Y, Z.

Generate a detailed Mermaid flowchart with decision points and success metrics.`
}
```

---

## A/B Test Scenario Schema

```typescript
interface ABTestScenario {
  id: string;
  frictionPoint: string;
  hypothesis: string;
  variantA: {
    name: string;
    description: string;
    designDetails: string[];
  };
  variantB: {
    name: string;
    description: string;
    designDetails: string[];
    keyChanges: string[];
  };
  successMetrics: Array<{
    metric: string;
    target: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  implementationDetails: string;
  testDuration: string;
  recommendedSampleSize: string;
  riskAssessment: string;
  priority: 'high' | 'medium' | 'low';
}
```

---

## Integration with Agent System

The analyzer uses the **Base44 Agent SDK**:

```javascript
// Create conversation
const conv = await base44.agents.createConversation({
  agent_name: 'UserJourneyMapper',
  metadata: { role, flow, preset }
});

// Send message
await base44.agents.addMessage(conv, {
  role: 'user',
  content: prompt
});

// Subscribe to updates
const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
  setConversation(data);
});
```

The **UserJourneyMapper** agent has read access to:
- User
- UserOnboarding  
- UserProfile
- Role
- Workflow
- WorkflowExecution

---

## Visual Design

**Color System:**
- **Primary gradient:** Purple (500) → Pink (600)
- **Secondary gradient:** Orange (500) → Pink (500)
- **Priority indicators:**
  - High: Red → Orange
  - Medium: Yellow → Amber  
  - Low: Blue → Cyan

**Animations:**
- Preset cards: Scale on hover (1.02), tap (0.98)
- Results: Fade in from bottom (y: 20)
- A/B scenarios: Staggered reveal (0.1s delay)

**Typography:**
- Headers: Space Grotesk, bold
- Body: System font stack
- Code: Monospace with syntax highlighting

---

## Best Practices

1. **Start with presets** - They provide comprehensive prompts
2. **Review variants carefully** - Check design details and key changes
3. **Prioritize high-impact tests** - Focus on friction with biggest user impact
4. **Monitor metrics** - Track all success metrics, not just primary
5. **Document learnings** - Use export feature to save scenarios

---

## Future Enhancements

- **Live A/B test tracking** - Real-time metric monitoring
- **Automated variant deployment** - One-click test activation
- **Historical test library** - Browse past experiments
- **Multi-variate testing** - Test 3+ variants simultaneously
- **Predictive analytics** - AI forecasts test outcomes
- **Visual diff viewer** - Side-by-side variant comparison

---

## Troubleshooting

**Agent not responding?**
- Check that UserJourneyMapper agent exists
- Verify agent has proper entity access
- Review browser console for errors

**A/B tests not generating?**
- Ensure analysis has completed
- Check that friction points were identified
- Verify OPENAI_API_KEY or ANTHROPIC_API_KEY is set

**Mermaid charts not rendering?**
- Confirm mermaid package is installed
- Check syntax in markdown code blocks
- Use `language-mermaid` code fence identifier

---

## API Reference

### Backend Functions

**generateABTestScenarios**
```javascript
POST /api/functions/generateABTestScenarios
Body: {
  analysisContent: string,
  role: string,
  flow: string
}
Response: {
  success: boolean,
  scenarios: ABTestScenario[],
  summary: string
}
```

---

## License & Credits

Built with:
- **Base44 Platform** - Agent orchestration & backend
- **Framer Motion** - Animations
- **Mermaid** - Flowchart rendering
- **React Query** - State management
- **Tailwind CSS** - Styling