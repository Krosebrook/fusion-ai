/**
 * Workflow Documentation Tab
 * Integrated documentation viewer for workflows
 */

import React from 'react';
import { DocumentationViewer } from '../documentation/DocumentationViewer';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function WorkflowDocumentationTab({ workflow }) {
  const handleRegenerateDocumentation = async (documentation) => {
    try {
      await base44.entities.Workflow.update(workflow.id, {
        metadata: {
          ...workflow.metadata,
          documentation,
        },
      });
      toast.success('Documentation saved to workflow');
    } catch (error) {
      console.error('Failed to save documentation', error);
      toast.error('Failed to save documentation');
    }
  };

  return (
    <div className="p-6">
      <DocumentationViewer
        entity={workflow}
        entityType="workflow"
        onRegenerate={handleRegenerateDocumentation}
      />
    </div>
  );
}

export default WorkflowDocumentationTab;