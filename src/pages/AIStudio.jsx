/**
 * AI Studio - Unified AI Generation Platform
 * Content, Visual, and Code generation in one place
 */

import { useAuth } from '../components/hooks/useAuth';
import { ProtectedRoute } from '../components/ui-library/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image, Code, Sparkles } from 'lucide-react';
import { ContentGeneratorPro } from '../components/ai-studio/ContentGeneratorPro';
import { VisualGeneratorPro } from '../components/ai-studio/VisualGeneratorPro';
import { CodeAssistantPro } from '../components/ai-studio/CodeAssistantPro';

export default function AIStudioPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <ProtectedRoute />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-bold text-white">AI Studio</h1>
          </div>
          <p className="text-slate-400">
            Generate content, visuals, and code with advanced AI
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 mb-8">
            <TabsTrigger value="content" className="data-[state=active]:bg-orange-500">
              <FileText className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="visual" className="data-[state=active]:bg-orange-500">
              <Image className="w-4 h-4 mr-2" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-orange-500">
              <Code className="w-4 h-4 mr-2" />
              Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <ContentGeneratorPro />
          </TabsContent>

          <TabsContent value="visual">
            <VisualGeneratorPro />
          </TabsContent>

          <TabsContent value="code">
            <CodeAssistantPro />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}