/**
 * Global TypeScript Type Definitions
 * Centralized type system for type safety across the application
 */

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
  bio?: string;
  created_date: string;
  updated_date?: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: Error | null;
  checkAuth: () => Promise<void>;
  logout: (redirectUrl?: string) => Promise<void>;
  login: (nextUrl?: string) => void;
}

// ============================================================================
// AI Generation Types
// ============================================================================

export type GenerationType = 'content' | 'image' | 'icon' | 'illustration' | 'code';

export interface AIGeneration {
  id: string;
  type: GenerationType;
  prompt: string;
  result: string;
  parameters?: Record<string, any>;
  share_token?: string;
  share_expires_at?: string;
  is_public?: boolean;
  created_date: string;
  updated_date?: string;
  created_by: string;
}

export interface GenerationRequest {
  type: GenerationType;
  prompt: string;
  parameters?: Record<string, any>;
}

export interface GenerationResponse {
  id: string;
  result: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Prompt Template Types
// ============================================================================

export type PromptCategory = 'agent' | 'api' | 'workflow' | 'analysis' | 'generation' | 'chain' | 'custom';

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'context';
  description?: string;
  default?: string;
  required?: boolean;
  source?: 'user_input' | 'user_data' | 'pipeline_data' | 'environment' | 'api_response' | 'previous_step';
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  category: PromptCategory;
  template: string;
  variables?: PromptVariable[];
  tags?: string[];
  is_public?: boolean;
  usage_count?: number;
  avg_latency_ms?: number;
  success_rate?: number;
  total_cost_usd?: number;
  last_executed_at?: string;
  created_date: string;
  updated_date?: string;
  created_by: string;
}

// ============================================================================
// UI Component Types
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export interface CinematicButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  disabled?: boolean;
  glow?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface CinematicCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  gradient?: boolean;
  hover?: boolean;
  delay?: number;
}

export interface CinematicInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string;
  disabled?: boolean;
  type?: string;
  className?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// Service Types
// ============================================================================

export interface CacheOptions {
  ttl?: number;
  key?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv' | 'txt' | 'png' | 'jpg';
  filename?: string;
}

export interface ShareOptions {
  expiresIn?: number; // days
  isPublic?: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorLog {
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
  context?: Record<string, any>;
  stack?: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsMetrics {
  totalExecutions: number;
  successRate: number;
  avgLatency: number;
  avgCost: number;
  totalCost: number;
}

export interface PerformanceData {
  date: string;
  executions: number;
  avgLatency: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T | null>;
export type ID = string;