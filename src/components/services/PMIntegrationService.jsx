/**
 * Project Management Integration Service
 * Handles two-way sync with external PM tools via plugins
 */

import { base44 } from '@/api/base44Client';

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
      errors: [],
      timestamp: new Date().toISOString(),
    };

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

      return syncResults;
    } catch (error) {
      syncResults.errors.push(error.message);
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
        // Handle conflict
        const conflictResolution = plugin.pm_integration.sync_config.conflict_resolution;
        if (conflictResolution === 'external_wins' || conflictResolution === 'latest_wins') {
          await base44.entities[entityName].update(existing[0].id, mappedData);
          imported++;
        } else {
          conflicts++;
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