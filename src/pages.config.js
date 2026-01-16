/**
 * Pages Configuration
 * 
 * Uses React.lazy for code splitting to improve initial load performance.
 * Critical pages (Home, Auth) are eagerly loaded, others are lazy loaded.
 */

import { lazy } from 'react';

// Eagerly loaded - critical pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import __Layout from './Layout.jsx';

// Lazy loaded pages for better performance
const ABTestManager = lazy(() => import('./pages/ABTestManager'));
const AICodeAgent = lazy(() => import('./pages/AICodeAgent'));
const AICodeGen = lazy(() => import('./pages/AICodeGen'));
const AICodeReview = lazy(() => import('./pages/AICodeReview'));
const AIDeployment = lazy(() => import('./pages/AIDeployment'));
const AIDocumentation = lazy(() => import('./pages/AIDocumentation'));
const AIFeaturePlanner = lazy(() => import('./pages/AIFeaturePlanner'));
const AIPipelineGenerator = lazy(() => import('./pages/AIPipelineGenerator'));
const AIStudio = lazy(() => import('./pages/AIStudio'));
const AITemplates = lazy(() => import('./pages/AITemplates'));
const AITestingSuite = lazy(() => import('./pages/AITestingSuite'));
const APIDocumentation = lazy(() => import('./pages/APIDocumentation'));
const APIGenerator = lazy(() => import('./pages/APIGenerator'));
const APIIntegration = lazy(() => import('./pages/APIIntegration'));
const AccessControl = lazy(() => import('./pages/AccessControl'));
const ActivityDashboard = lazy(() => import('./pages/ActivityDashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const AdvancedAnalytics = lazy(() => import('./pages/AdvancedAnalytics'));
const AgentManagement = lazy(() => import('./pages/AgentManagement'));
const AgentOrchestration = lazy(() => import('./pages/AgentOrchestration'));
const AgentOrchestrationHub = lazy(() => import('./pages/AgentOrchestrationHub'));
const AgentOrchestrator = lazy(() => import('./pages/AgentOrchestrator'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AppBuilder = lazy(() => import('./pages/AppBuilder'));
const AppEvaluator = lazy(() => import('./pages/AppEvaluator'));
const CICDAnalytics = lazy(() => import('./pages/CICDAnalytics'));
const CICDAutomation = lazy(() => import('./pages/CICDAutomation'));
const CinematicDemo = lazy(() => import('./pages/CinematicDemo'));
const CollaborationWorkspace = lazy(() => import('./pages/CollaborationWorkspace'));
const Commerce = lazy(() => import('./pages/Commerce'));
const ContentStudio = lazy(() => import('./pages/ContentStudio'));
const Copilot = lazy(() => import('./pages/Copilot'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DeploymentCenter = lazy(() => import('./pages/DeploymentCenter'));
const DeveloperConsole = lazy(() => import('./pages/DeveloperConsole'));
const DeveloperDashboard = lazy(() => import('./pages/DeveloperDashboard'));
const DeveloperTools = lazy(() => import('./pages/DeveloperTools'));
const EnhancedAnalytics = lazy(() => import('./pages/EnhancedAnalytics'));
const ExtendedAnalytics = lazy(() => import('./pages/ExtendedAnalytics'));
const IntegrationManager = lazy(() => import('./pages/IntegrationManager'));
const Integrations = lazy(() => import('./pages/Integrations'));
const IntegrationsHub = lazy(() => import('./pages/IntegrationsHub'));
const MarketingSuite = lazy(() => import('./pages/MarketingSuite'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const MediaStudio = lazy(() => import('./pages/MediaStudio'));
const MyGenerations = lazy(() => import('./pages/MyGenerations'));
const MyPlugins = lazy(() => import('./pages/MyPlugins'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Orchestration = lazy(() => import('./pages/Orchestration'));
const PipelineOptimization = lazy(() => import('./pages/PipelineOptimization'));
const PluginDashboards = lazy(() => import('./pages/PluginDashboards'));
const PluginDevStudio = lazy(() => import('./pages/PluginDevStudio'));
const PluginMarketplace = lazy(() => import('./pages/PluginMarketplace'));
const PluginSDK = lazy(() => import('./pages/PluginSDK'));
const Profile = lazy(() => import('./pages/Profile'));
const PromptHub = lazy(() => import('./pages/PromptHub'));
const PromptLibrary = lazy(() => import('./pages/PromptLibrary'));
const PromptStudio = lazy(() => import('./pages/PromptStudio'));
const RBACManager = lazy(() => import('./pages/RBACManager'));
const Secrets = lazy(() => import('./pages/Secrets'));
const SecretsVault = lazy(() => import('./pages/SecretsVault'));
const Security = lazy(() => import('./pages/Security'));
const SecurityMonitoring = lazy(() => import('./pages/SecurityMonitoring'));
const Settings = lazy(() => import('./pages/Settings'));
const Share = lazy(() => import('./pages/Share'));
const Tools = lazy(() => import('./pages/Tools'));
const UserJourneyAnalyzer = lazy(() => import('./pages/UserJourneyAnalyzer'));
const VisualPipelineBuilder = lazy(() => import('./pages/VisualPipelineBuilder'));
const WebsiteCloner = lazy(() => import('./pages/WebsiteCloner'));
const WorkflowBuilder = lazy(() => import('./pages/WorkflowBuilder'));
const Workflows = lazy(() => import('./pages/Workflows'));

export const PAGES = {
    "ABTestManager": ABTestManager,
    "AICodeAgent": AICodeAgent,
    "AICodeGen": AICodeGen,
    "AICodeReview": AICodeReview,
    "AIDeployment": AIDeployment,
    "AIDocumentation": AIDocumentation,
    "AIFeaturePlanner": AIFeaturePlanner,
    "AIPipelineGenerator": AIPipelineGenerator,
    "AIStudio": AIStudio,
    "AITemplates": AITemplates,
    "AITestingSuite": AITestingSuite,
    "APIDocumentation": APIDocumentation,
    "APIGenerator": APIGenerator,
    "APIIntegration": APIIntegration,
    "AccessControl": AccessControl,
    "ActivityDashboard": ActivityDashboard,
    "Admin": Admin,
    "AdvancedAnalytics": AdvancedAnalytics,
    "AgentManagement": AgentManagement,
    "AgentOrchestration": AgentOrchestration,
    "AgentOrchestrationHub": AgentOrchestrationHub,
    "AgentOrchestrator": AgentOrchestrator,
    "Analytics": Analytics,
    "AppBuilder": AppBuilder,
    "AppEvaluator": AppEvaluator,
    "Auth": Auth,
    "CICDAnalytics": CICDAnalytics,
    "CICDAutomation": CICDAutomation,
    "CinematicDemo": CinematicDemo,
    "CollaborationWorkspace": CollaborationWorkspace,
    "Commerce": Commerce,
    "ContentStudio": ContentStudio,
    "Copilot": Copilot,
    "Dashboard": Dashboard,
    "DeploymentCenter": DeploymentCenter,
    "DeveloperConsole": DeveloperConsole,
    "DeveloperDashboard": DeveloperDashboard,
    "DeveloperTools": DeveloperTools,
    "EnhancedAnalytics": EnhancedAnalytics,
    "ExtendedAnalytics": ExtendedAnalytics,
    "Home": Home,
    "IntegrationManager": IntegrationManager,
    "Integrations": Integrations,
    "IntegrationsHub": IntegrationsHub,
    "MarketingSuite": MarketingSuite,
    "Marketplace": Marketplace,
    "MediaStudio": MediaStudio,
    "MyGenerations": MyGenerations,
    "MyPlugins": MyPlugins,
    "Onboarding": Onboarding,
    "Orchestration": Orchestration,
    "PipelineOptimization": PipelineOptimization,
    "PluginDashboards": PluginDashboards,
    "PluginDevStudio": PluginDevStudio,
    "PluginMarketplace": PluginMarketplace,
    "PluginSDK": PluginSDK,
    "Profile": Profile,
    "PromptHub": PromptHub,
    "PromptLibrary": PromptLibrary,
    "PromptStudio": PromptStudio,
    "RBACManager": RBACManager,
    "Secrets": Secrets,
    "SecretsVault": SecretsVault,
    "Security": Security,
    "SecurityMonitoring": SecurityMonitoring,
    "Settings": Settings,
    "Share": Share,
    "Tools": Tools,
    "UserJourneyAnalyzer": UserJourneyAnalyzer,
    "VisualPipelineBuilder": VisualPipelineBuilder,
    "WebsiteCloner": WebsiteCloner,
    "WorkflowBuilder": WorkflowBuilder,
    "Workflows": Workflows,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};