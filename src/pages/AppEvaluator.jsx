import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  evaluateApplication,
  EVALUATION_CRITERIA
} from '@/lib/app-evaluator';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  TrendingUp,
  Activity,
  Shield,
  Zap,
  Code,
  Users,
  Eye,
  Layers,
  GitBranch
} from 'lucide-react';

/**
 * Icon mapping for each evaluation category
 */
const CATEGORY_ICONS = {
  architecture: Layers,
  stateManagement: GitBranch,
  performance: Zap,
  security: Shield,
  uxAccessibility: Users,
  offlineResilience: Activity,
  scalability: TrendingUp,
  developerExperience: Code,
  observability: Eye,
  productClarity: CheckCircle2
};

/**
 * Get badge color based on score
 */
function getScoreBadgeVariant(score) {
  if (score >= 8) return 'default'; // Green
  if (score >= 6) return 'secondary'; // Yellow
  return 'destructive'; // Red
}

/**
 * Get grade color
 */
function getGradeColor(grade) {
  switch (grade) {
    case 'A': return 'text-green-600 dark:text-green-400';
    case 'B': return 'text-blue-600 dark:text-blue-400';
    case 'C': return 'text-yellow-600 dark:text-yellow-400';
    case 'D': return 'text-orange-600 dark:text-orange-400';
    case 'F': return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * Convert camelCase to SCREAMING_SNAKE_CASE for EVALUATION_CRITERIA lookup
 */
function getCriteriaKey(camelCaseKey) {
  return camelCaseKey
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, '');
}

/**
 * Get short label for a criteria (first word)
 */
function getShortCriteriaLabel(key) {
  const criteriaKey = getCriteriaKey(key);
  const fullLabel = EVALUATION_CRITERIA[criteriaKey];
  if (!fullLabel) return key;
  return fullLabel.split(' ')[0] || fullLabel.split('/')[0] || fullLabel;
}

/**
 * Score Card Component
 */
function ScoreCard({ category, data, icon: Icon }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {EVALUATION_CRITERIA[getCriteriaKey(category)]}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl font-bold">{data.score}/10</div>
          <Badge variant={getScoreBadgeVariant(data.score)}>
            {data.score >= 8 ? 'Excellent' : data.score >= 6 ? 'Good' : 'Needs Work'}
          </Badge>
        </div>
        
        {data.strengths.length > 0 && (
          <div className="mt-3 space-y-1">
            <div className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Strengths
            </div>
            {data.strengths.map((strength, idx) => (
              <div key={idx} className="text-xs text-muted-foreground pl-4">
                • {strength}
              </div>
            ))}
          </div>
        )}
        
        {data.issues.length > 0 && (
          <div className="mt-3 space-y-1">
            <div className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Issues
            </div>
            {data.issues.map((issue, idx) => (
              <div key={idx} className="text-xs text-muted-foreground pl-4">
                • {issue}
              </div>
            ))}
          </div>
        )}
        
        {data.symptoms.length > 0 && (
          <div className="mt-3 space-y-1">
            <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              User Impact
            </div>
            {data.symptoms.map((symptom, idx) => (
              <div key={idx} className="text-xs text-muted-foreground pl-4">
                • {symptom}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main App Evaluator Component
 */
export default function AppEvaluator() {
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState(null);

  // Current application context (from the fusion-ai codebase)
  const appContext = useMemo(() => ({
    appType: 'PWA / Web Application',
    primaryUsers: 'Developers, Product Teams, DevOps Engineers',
    coreUseCases: 'AI-powered development, code generation, CI/CD automation, integration management',
    techStack: 'React 18.2, Vite 6.1, Base44 SDK, TanStack Query, Tailwind CSS',
    deploymentTarget: 'Vercel (web), Base44 Platform',
    
    // Architecture
    hasLayeredArchitecture: true,
    hasModularComponents: true,
    usesDependencyInjection: false,
    hasPluginArchitecture: true,
    hasCircularDependencies: false,
    
    // State Management
    stateManagement: 'tanstack-query',
    hasServerStateManagement: true,
    hasOptimisticUpdates: false,
    hasDataNormalization: false,
    usesImmutability: true,
    
    // Performance
    ttfb: null, // Would need real measurement
    lcp: null,
    bundleSize: null, // Would need build analysis
    hasCodeSplitting: false,
    hasImageOptimization: false,
    usesMemoization: true,
    
    // Security
    hasXSSPrevention: true,
    hasCSRFProtection: false,
    authMethod: 'base44-sdk',
    hasRBAC: true,
    hasSecretsVault: true,
    usesHTTPS: true,
    corsConfig: 'wildcard', // Known issue
    
    // UX & Accessibility
    wcagLevel: '2.1-AA',
    hasKeyboardNav: true,
    hasARIALabels: true,
    hasGoodContrast: true,
    isMobileResponsive: true,
    hasLoadingStates: true,
    
    // Offline & Resilience
    hasServiceWorker: false,
    hasErrorBoundaries: false,
    hasRetryLogic: true,
    hasErrorMonitoring: false,
    hasGracefulDegradation: true,
    
    // Scalability
    usesTypeScript: 'partial',
    testCoverage: 0, // Known issue - no tests yet
    hasLinting: true,
    hasCodeReview: false,
    documentationQuality: 'good',
    
    // Developer Experience
    buildTool: 'vite',
    hasHMR: true,
    hasDevTools: true,
    hasCICD: false, // To be implemented
    easySetup: true,
    hasEnvManagement: true,
    
    // Observability
    loggingLevel: 'basic',
    hasAPM: false,
    hasErrorTracking: false,
    hasAnalytics: true,
    hasFeatureFlags: false,
    
    // Product Clarity
    hasClearValue: true,
    hasOnboarding: false,
    hasFeatureDiscovery: true,
    hasClearUserJourney: true,
    hasFeedbackLoops: false,
    
    // Non-goals
    nonGoals: [
      'Native mobile apps (current phase)',
      'Real-time collaboration (current phase)',
      'Self-hosted deployment (current phase)'
    ]
  }), []);

  const handleEvaluate = () => {
    setEvaluating(true);
    
    // Simulate async evaluation
    setTimeout(() => {
      const evaluation = evaluateApplication(appContext);
      setResults(evaluation);
      setEvaluating(false);
    }, 500);
  };

  const handleDownloadReport = () => {
    if (!results) return;
    
    const report = `# Application Evaluation Report
Generated: ${new Date().toISOString()}

## Executive Scorecard
Grade: ${results.grade.grade} (${results.grade.average}/10)
${results.grade.label}

${results.executiveSummary}

## Detailed Scores
${Object.entries(results.scores).map(([key, data]) => `
### ${EVALUATION_CRITERIA[getCriteriaKey(key)]}
Score: ${data.score}/10

**Strengths:**
${data.strengths.map(s => `- ${s}`).join('\n')}

**Issues:**
${data.issues.map(i => `- ${i}`).join('\n')}

**User Impact:**
${data.symptoms.map(s => `- ${s}`).join('\n')}
`).join('\n')}

## Reconstruction Recommendations

### Architecture
${results.reconstruction.architecture.frontend.map(r => `- ${r}`).join('\n')}

### Backend
${results.reconstruction.architecture.backend.map(r => `- ${r}`).join('\n')}

### State Management
${results.reconstruction.architecture.state.map(r => `- ${r}`).join('\n')}

## Feature-Level Plan
**Keep:**
${results.reconstruction.featureLevel.keep.map(f => `- ${f}`).join('\n') || '- (None specified)'}

**Refactor:**
${results.reconstruction.featureLevel.refactor.map(f => `- ${f}`).join('\n')}

**Remove:**
${results.reconstruction.featureLevel.remove.map(f => `- ${f}`).join('\n') || '- (None specified)'}

**Add:**
${results.reconstruction.featureLevel.add.map(f => `- ${f}`).join('\n')}

## Reconstruction Prompt
${results.reconstructionPrompt}
`;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-evaluation-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Application Evaluator</h1>
        <p className="text-muted-foreground">
          Principal-level architecture and quality assessment against 2024-2026 best practices
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          onClick={handleEvaluate}
          disabled={evaluating}
          size="lg"
          className="gap-2"
        >
          {evaluating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <Activity className="h-4 w-4" />
              Run Evaluation
            </>
          )}
        </Button>

        {results && (
          <Button
            onClick={handleDownloadReport}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        )}
      </div>

      {!results && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Evaluation Yet</AlertTitle>
          <AlertDescription>
            Click "Run Evaluation" to assess this application against modern best practices.
            The evaluation covers 10 categories: Architecture, State Management, Performance,
            Security, UX/Accessibility, Offline Support, Scalability, Developer Experience,
            Observability, and Product Clarity.
          </AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="space-y-6">
          {/* Executive Scorecard */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Executive Scorecard</CardTitle>
                  <CardDescription>Overall assessment and grade</CardDescription>
                </div>
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getGradeColor(results.grade.grade)}`}>
                    {results.grade.grade}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {results.grade.average}/10
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{results.grade.label}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {results.executiveSummary}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(results.scores).map(([key, data]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold">{data.score}</div>
                      <div className="text-xs text-muted-foreground">
                        {getShortCriteriaLabel(key)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Scores */}
          <Tabs defaultValue="scores" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scores">Detailed Scores</TabsTrigger>
              <TabsTrigger value="reconstruction">Reconstruction</TabsTrigger>
              <TabsTrigger value="plan">Feature Plan</TabsTrigger>
              <TabsTrigger value="prompt">Rebuild Prompt</TabsTrigger>
            </TabsList>

            <TabsContent value="scores" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(results.scores).map(([key, data]) => (
                  <ScoreCard
                    key={key}
                    category={key}
                    data={data}
                    icon={CATEGORY_ICONS[key]}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reconstruction" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Modern Reconstruction Strategy</CardTitle>
                  <CardDescription>
                    Recommended architecture for rebuilding with 2024-2026 best practices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Recommended Architecture</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {results.reconstruction.architecture.recommended}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Frontend Patterns
                      </h3>
                      <ul className="space-y-1">
                        {results.reconstruction.architecture.frontend.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Backend Patterns
                      </h3>
                      <ul className="space-y-1">
                        {results.reconstruction.architecture.backend.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        State & Data Strategy
                      </h3>
                      <ul className="space-y-1">
                        {results.reconstruction.architecture.state.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Caching Strategy
                      </h3>
                      <ul className="space-y-1">
                        {results.reconstruction.architecture.caching.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Auth & Security
                      </h3>
                      <ul className="space-y-1">
                        {results.reconstruction.architecture.auth.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Deployment & CI/CD
                      </h3>
                      <ul className="space-y-1">
                        {results.reconstruction.architecture.deployment.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Risks & Tradeoffs
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium mb-1">Risks:</div>
                        <ul className="space-y-1">
                          {results.reconstruction.risks.map((risk, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">
                              • {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Tradeoffs:</div>
                        <ul className="space-y-1">
                          {results.reconstruction.tradeoffs.map((tradeoff, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">
                              • {tradeoff}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plan" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {results.reconstruction.featureLevel.keep.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        Keep
                      </CardTitle>
                      <CardDescription>Features to preserve as-is</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.reconstruction.featureLevel.keep.map((item, idx) => (
                          <li key={idx} className="text-sm">• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {results.reconstruction.featureLevel.refactor.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <RefreshCw className="h-5 w-5" />
                        Refactor
                      </CardTitle>
                      <CardDescription>Features needing improvement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.reconstruction.featureLevel.refactor.map((item, idx) => (
                          <li key={idx} className="text-sm">• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {results.reconstruction.featureLevel.remove.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <XCircle className="h-5 w-5" />
                        Remove
                      </CardTitle>
                      <CardDescription>Features to eliminate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.reconstruction.featureLevel.remove.map((item, idx) => (
                          <li key={idx} className="text-sm">• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {results.reconstruction.featureLevel.add.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <TrendingUp className="h-5 w-5" />
                        Add
                      </CardTitle>
                      <CardDescription>High-leverage new features</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.reconstruction.featureLevel.add.map((item, idx) => (
                          <li key={idx} className="text-sm">• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="prompt">
              <Card>
                <CardHeader>
                  <CardTitle>Reconstruction Prompt</CardTitle>
                  <CardDescription>
                    Copy this prompt to rebuild the application with best practices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {results.reconstructionPrompt}
                    </pre>
                  </ScrollArea>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      navigator.clipboard.writeText(results.reconstructionPrompt);
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
