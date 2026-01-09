/**
 * Prompt Library Page
 * Main page for accessing the prompt template library
 */

import { PromptTemplateLibrary } from '../components/prompt-library/PromptTemplateLibrary';
import { useAuth } from '../components/hooks/useAuth';
import { ProtectedRoute } from '../components/ui-library/ProtectedRoute';

export default function PromptLibraryPage() {
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

  return <PromptTemplateLibrary />;
}