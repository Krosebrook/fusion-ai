// User Journey Analyzer Constants & Configuration

export const USER_ROLES = {
  user: { icon: 'Users', color: 'from-blue-500 to-cyan-500', label: 'User' },
  admin: { icon: 'Shield', color: 'from-purple-500 to-pink-500', label: 'Admin' },
  owner: { icon: 'Crown', color: 'from-orange-500 to-amber-500', label: 'Owner' }
};

export const FLOW_TYPES = {
  onboarding: 'User Onboarding Journey',
  recognition: 'Giving Recognition Flow',
  moderation: 'Content Moderation Review',
  gamification: 'Gamification Rule Configuration',
  custom: 'Custom Flow Analysis'
};

export const JOURNEY_PRESETS = {
  'first-recognition': {
    name: 'New User First-Time Recognition',
    role: 'user',
    flow: 'recognition',
    icon: '🎉',
    description: 'User discovers and sends their first recognition to a colleague',
    prompt: `Analyze the complete journey of a brand new user discovering and sending their first recognition. Map the flow from: 
1. Landing on the platform (post-onboarding)
2. Discovering the recognition feature (navigation, tooltips, prompts)
3. Understanding what recognition is and why to use it
4. Finding a colleague to recognize
5. Composing their first recognition message
6. Selecting rewards/badges (if applicable)
7. Sending and confirmation
8. Post-send experience (notifications, social proof)

Identify friction points such as: unclear CTAs, difficulty finding colleagues, uncertainty about what to write, technical barriers, lack of encouragement to complete the action. Generate a detailed Mermaid flowchart with decision points, potential dead ends, and success metrics.`
  },
  'admin-dispute': {
    name: 'Admin Dispute Resolution',
    role: 'admin',
    flow: 'moderation',
    icon: '⚖️',
    description: 'Admin handles a flagged content dispute between users',
    prompt: `Analyze the complete admin workflow for resolving a content dispute or moderation case:
1. Receiving notification of flagged content
2. Accessing the moderation queue/dashboard
3. Reviewing the flagged content and context (original post, reporter's reason, user history)
4. Investigating additional evidence (user profiles, previous incidents, community guidelines)
5. Making a decision (approve, remove, warn, ban)
6. Documenting the decision with reasoning
7. Communicating with involved parties
8. Implementing the decision (content removal, user sanctions)
9. Following up and monitoring

Identify friction points: insufficient context, unclear guidelines, lack of tools for investigation, difficult communication interfaces, no audit trail, excessive steps. Generate a detailed Mermaid flowchart highlighting decision branches and potential escalation paths.`
  },
  'owner-gamification': {
    name: 'Owner Gamification Setup',
    role: 'owner',
    flow: 'gamification',
    icon: '🎮',
    description: 'Owner configures complex gamification rules for the first time',
    prompt: `Analyze the complete owner journey for setting up a comprehensive gamification system from scratch:
1. Accessing gamification settings/configuration
2. Understanding available gamification mechanics (points, badges, leaderboards, levels)
3. Defining point rules (what actions earn points, how many)
4. Creating custom badges with criteria
5. Configuring leaderboards (timeframes, visibility, categories)
6. Setting up level thresholds and rewards
7. Testing the configuration with sample scenarios
8. Publishing/activating the gamification system
9. Monitoring initial user engagement and metrics

Identify friction points: complex configuration interfaces, lack of templates/presets, unclear impact preview, difficulty testing before launch, no validation of rule conflicts, missing documentation. Generate a detailed Mermaid flowchart with configuration steps, validation gates, and rollback points.`
  },
  'multi-role-recognition': {
    name: 'Cross-Department Recognition Flow',
    role: 'user',
    flow: 'recognition',
    icon: '🤝',
    description: 'User sends recognition across departments with approval workflow',
    prompt: `Analyze the complex journey of sending recognition that requires cross-departmental approval:
1. User identifies someone from another department to recognize
2. Searches/finds the person in the system
3. Composes recognition with specific achievements
4. Selects reward tier (triggering approval requirement)
5. Submission and notification to approvers
6. Approval workflow (manager review, budget check, HR approval)
7. Notification back to original user
8. Final delivery to recipient
9. Social sharing and celebration

Identify friction points: confusing approval requirements, lack of visibility into approval status, unclear budget constraints, lost context during approvals, delayed notifications, abandonment during waiting periods. Generate a detailed Mermaid flowchart showing parallel approval paths and timeout scenarios.`
  },
  'onboarding-activation': {
    name: 'Complete User Onboarding to Activation',
    role: 'user',
    flow: 'onboarding',
    icon: '🚀',
    description: 'New user journey from signup through first meaningful action',
    prompt: `Analyze the critical activation journey from initial signup to first value realization:
1. Landing page arrival and signup decision
2. Account creation (email, OAuth, form fields)
3. Email verification and first login
4. Profile setup (photo, bio, department, role)
5. Product tour/walkthrough
6. Connecting with colleagues (imports, search, suggestions)
7. Understanding the value proposition
8. Taking first meaningful action (give recognition, join challenge, etc.)
9. Receiving first notification/engagement
10. Returning for second session

Identify friction points: lengthy signup forms, unclear value proposition, overwhelming feature tours, difficulty finding relevant connections, lack of immediate value, poor mobile experience, confusing next steps. Generate a detailed Mermaid flowchart with drop-off points, intervention opportunities, and success indicators.`
  },
  'admin-bulk-actions': {
    name: 'Admin Bulk User Management',
    role: 'admin',
    flow: 'custom',
    icon: '👥',
    description: 'Admin performs bulk operations on user accounts',
    prompt: `Analyze the admin workflow for performing bulk operations on multiple user accounts:
1. Accessing user management dashboard
2. Defining selection criteria (department, role, activity level, date joined)
3. Previewing affected users
4. Selecting bulk action (role change, deactivation, messaging, export)
5. Confirming action with safeguards
6. Processing and progress tracking
7. Handling errors/exceptions
8. Reviewing completion report
9. Undoing if needed

Identify friction points: unclear selection criteria, no preview of impact, accidental actions, slow processing, lack of progress visibility, inadequate error handling, no undo option, missing audit logs. Generate a detailed Mermaid flowchart with safety checks and rollback procedures.`
  }
};

export const ANALYTICS_PROVIDERS = [
  { value: 'google-analytics', label: 'Google Analytics 4' },
  { value: 'mixpanel', label: 'Mixpanel' },
  { value: 'amplitude', label: 'Amplitude' },
  { value: 'segment', label: 'Segment' },
  { value: 'custom', label: 'Custom Events' }
];

export const DEPLOYMENT_ENVIRONMENTS = [
  { value: 'development', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' }
];

export const PRIORITY_COLORS = {
  high: 'from-red-500 to-orange-500',
  medium: 'from-yellow-500 to-amber-500',
  low: 'from-blue-500 to-cyan-500'
};