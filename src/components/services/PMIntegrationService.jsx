/**
 * Project Management Integration Service
 * Handles two-way sync with external PM tools via plugins
 */

import { base44 } from '@/api/base44Client';
import { aiService } from './AIService';

class PMIntegrationService {
  /**
   * Initialize sync for a plugin
   */
  async initializeSync(pluginInstallation, pmConfig) {
    const { plugin_id, configuration } = pluginInstallation;
    const { provider, sync_config } = pmConfig;

    // Store sync state
    await base44.entities.PluginInstallation.update(pluginInstallation.id, {
      configuration: {
        ...configuration,
        pm_sync: {
          enabled: true,
          provider,
          last_sync: null,
          sync_errors: [],
        },
      },
    });

    // Start periodic sync
    if (sync_config.sync_interval_minutes > 0) {
      this.startPeriodicSync(pluginInstallation.id, sync_config.sync_interval_minutes);
    }

    return { success: true, message: 'Sync initialized' };
  }

  /**
   * Resolve conflict using AI
   */
  async resolveConflictWithAI(conflict) {
    const prompt = `You are a data sync conflict resolver. Analyze this conflict and suggest the best resolution:

**Field:** ${conflict.field}
**FlashFusion Value:** ${conflict.flashfusion_value}
**External Tool Value:** ${conflict.external_value}
**FlashFusion Last Updated:** ${conflict.flashfusion_updated}
**External Last Updated:** ${conflict.external_updated}

Consider:
1. Timestamp proximity
2. Data completeness
3. Semantic meaning
4. User intent

Provide:
1. Recommended choice ("flashfusion" or "external" or "merge")
2. Confidence score (0-1)
3. Brief explanation
4. If merge suggested, provide merged value

Return JSON with: { choice, confidence, explanation, merged_value }`;

    try {
      const result = await aiService.invokeLLM({
        prompt,
        schema: {
          type: 'object',
          properties: {
            choice: { type: 'string' },
            confidence: { type: 'number' },
            explanation: { type: 'string' },
            merged_value: { type: 'string' },
          },
        },
      });

      return result;
    } catch (error) {
      console.error('AI conflict resolution failed:', error);
      return {
        choice: 'latest_wins',
        confidence: 0.5,
        explanation: 'Fallback to latest_wins strategy',
      };
    }
  }

  /**
   * Perform two-way sync
   */
  async performSync(pluginInstallation, direction = 'bidirectional') {
    const { plugin_id, api_key, configuration } = pluginInstallation;
    const pmConfig = configuration.pm_sync;

    if (!pmConfig || !pmConfig.enabled) {
      throw new Error('PM sync not configured');
    }

    const syncResults = {
      imported: 0,
      exported: 0,
      conflicts: 0,
      conflicts_resolved: 0,
      errors: [],
      timestamp: new Date().toISOString(),
      conflict_details: [],
    };

    // Create sync log
    const syncLog = await base44.entities.PMSyncLog.create({
      plugin_installation_id: pluginInstallation.id,
      direction,
      status: 'in_progress',
      started_at: syncResults.timestamp,
    });

    try {
      // Get plugin details
      const plugin = await base44.entities.Plugin.filter({ id: plugin_id });
      if (!plugin || plugin.length === 0) {
        throw new Error('Plugin not found');
      }

      const pmIntegration = plugin[0].pm_integration;
      const entityMappings = pmIntegration.sync_config.entity_mappings || [];

      // Process each entity mapping
      for (const mapping of entityMappings) {
        const { flashfusion_entity, external_resource, field_mappings, sync_direction } = mapping;

        // Import from external tool
        if (
          (direction === 'bidirectional' || direction === 'import') &&
          (sync_direction === 'bidirectional' || sync_direction === 'import_only')
        ) {
          const imported = await this._importFromExternal(
            plugin[0],
            flashfusion_entity,
            external_resource,
            field_mappings,
            api_key
          );
          syncResults.imported += imported.count;
          syncResults.conflicts += imported.conflicts;
        }

        // Export to external tool
        if (
          (direction === 'bidirectional' || direction === 'export') &&
          (sync_direction === 'bidirectional' || sync_direction === 'export_only')
        ) {
          const exported = await this._exportToExternal(
            plugin[0],
            flashfusion_entity,
            external_resource,
            field_mappings,
            api_key
          );
          syncResults.exported += exported.count;
        }
      }

      // Update last sync time
      await base44.entities.PluginInstallation.update(pluginInstallation.id, {
        configuration: {
          ...configuration,
          pm_sync: {
            ...pmConfig,
            last_sync: syncResults.timestamp,
          },
        },
      });

      // Update sync log
      await base44.entities.PMSyncLog.update(syncLog.id, {
        status: 'completed',
        items_imported: syncResults.imported,
        items_exported: syncResults.exported,
        conflicts_detected: syncResults.conflicts,
        conflicts_resolved: syncResults.conflicts_resolved,
        conflicts: syncResults.conflict_details,
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - new Date(syncResults.timestamp).getTime(),
      });

      return syncResults;
    } catch (error) {
      syncResults.errors.push(error.message);
      
      // Update sync log as failed
      await base44.entities.PMSyncLog.update(syncLog.id, {
        status: 'failed',
        errors: [{ code: 'SYNC_ERROR', message: error.message }],
        completed_at: new Date().toISOString(),
      });
      
      throw error;
    }
  }

  /**
   * Import data from external PM tool
   */
  async _importFromExternal(plugin, entityName, externalResource, fieldMappings, apiKey) {
    const endpoint = `${plugin.api_endpoint}/pm/import`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        resource: externalResource,
        field_mappings: fieldMappings,
      }),
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`);
    }

    const { items } = await response.json();
    let imported = 0;
    let conflicts = 0;

    // Create or update entities
    for (const item of items) {
      const mappedData = this._mapFields(item, fieldMappings, 'import');

      // Check if item already exists
      const existing = await base44.entities[entityName].filter({
        external_id: item.id,
      });

      if (existing && existing.length > 0) {
        // Detect conflicts
        const hasConflicts = this._detectConflicts(existing[0], mappedData);
        
        if (hasConflicts.length > 0) {
          conflicts++;
          
          const conflictResolution = plugin.pm_integration.sync_config.conflict_resolution;
          
          if (conflictResolution === 'ai_suggest') {
            // Use AI to resolve conflicts
            for (const conflict of hasConflicts) {
              const aiSuggestion = await this.resolveConflictWithAI(conflict);
              
              if (aiSuggestion.choice === 'external' || aiSuggestion.confidence > 0.8) {
                await base44.entities[entityName].update(existing[0].id, mappedData);
                imported++;
              }
              
              // Store conflict details
              return {
                count: imported,
                conflicts,
                conflict_details: hasConflicts.map(c => ({
                  ...c,
                  ai_suggestion: aiSuggestion.explanation,
                  ai_confidence: aiSuggestion.confidence,
                })),
              };
            }
          } else if (conflictResolution === 'external_wins' || conflictResolution === 'latest_wins') {
            await base44.entities[entityName].update(existing[0].id, mappedData);
            imported++;
          }
        } else {
          await base44.entities[entityName].update(existing[0].id, mappedData);
          imported++;
        }
      } else {
        await base44.entities[entityName].create({
          ...mappedData,
          external_id: item.id,
          external_source: plugin.pm_integration.provider,
        });
        imported++;
      }
    }

    return { count: imported, conflicts };
  }

  /**
   * Export data to external PM tool
   */
  async _exportToExternal(plugin, entityName, externalResource, fieldMappings, apiKey) {
    // Get entities modified since last sync
    const entities = await base44.entities[entityName].list();

    const endpoint = `${plugin.api_endpoint}/pm/export`;
    const mappedItems = entities.map((entity) =>
      this._mapFields(entity, fieldMappings, 'export')
    );

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        resource: externalResource,
        items: mappedItems,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const { count } = await response.json();
    return { count };
  }

  /**
   * Detect conflicts between local and external data
   */
  _detectConflicts(localData, externalData) {
    const conflicts = [];
    
    for (const [key, value] of Object.entries(externalData)) {
      if (localData[key] !== undefined && localData[key] !== value) {
        conflicts.push({
          field: key,
          flashfusion_value: localData[key],
          external_value: value,
          flashfusion_updated: localData.updated_date,
          external_updated: externalData.updated_date || new Date().toISOString(),
        });
      }
    }
    
    return conflicts;
  }

  /**
   * Map fields between FlashFusion and external tool
   */
  _mapFields(data, fieldMappings, direction) {
    const mapped = {};

    for (const [ffField, externalField] of Object.entries(fieldMappings)) {
      if (direction === 'import') {
        mapped[ffField] = data[externalField];
      } else {
        mapped[externalField] = data[ffField];
      }
    }

    return mapped;
  }

  /**
   * Start periodic sync
   */
  startPeriodicSync(installationId, intervalMinutes) {
    const intervalMs = intervalMinutes * 60 * 1000;

    const intervalId = setInterval(async () => {
      try {
        const installation = await base44.entities.PluginInstallation.filter({
          id: installationId,
        });

        if (installation && installation.length > 0) {
          await this.performSync(installation[0]);
        } else {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    }, intervalMs);

    return intervalId;
  }
}

export const pmIntegrationService = new PMIntegrationService();