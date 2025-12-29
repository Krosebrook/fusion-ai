/**
 * Plugin Service
 * Manages plugin lifecycle, execution, and API access
 */

import { base44 } from '@/api/base44Client';
import { errorService } from './ErrorService';

class PluginService {
  async installPlugin(pluginId, configuration = {}) {
    try {
      const user = await base44.auth.me();
      
      const apiKey = this.generateAPIKey();
      const webhookSecret = this.generateSecret();

      const installation = await base44.entities.PluginInstallation.create({
        plugin_id: pluginId,
        user_id: user.id,
        status: 'active',
        configuration,
        api_key: apiKey,
        webhook_secret: webhookSecret,
        usage_count: 0,
        error_count: 0,
      });

      const plugin = await base44.entities.Plugin.filter({ id: pluginId });
      if (plugin.length > 0) {
        await base44.entities.Plugin.update(pluginId, {
          installation_count: (plugin[0].installation_count || 0) + 1,
        });
      }

      return {
        success: true,
        installation,
        apiKey,
        webhookSecret,
      };
    } catch (error) {
      errorService.handle(error, { action: 'installPlugin', pluginId }, 'high');
      throw error;
    }
  }

  async executePlugin(installationId, action, payload) {
    try {
      const installations = await base44.entities.PluginInstallation.filter({ 
        id: installationId 
      });
      
      if (installations.length === 0) {
        throw new Error('Plugin installation not found');
      }

      const installation = installations[0];
      const plugins = await base44.entities.Plugin.filter({ id: installation.plugin_id });
      
      if (plugins.length === 0) {
        throw new Error('Plugin not found');
      }

      const plugin = plugins[0];

      if (!plugin.api_endpoint) {
        throw new Error('Plugin has no API endpoint');
      }

      const response = await fetch(`${plugin.api_endpoint}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Plugin-Key': installation.api_key,
          'X-Webhook-Secret': installation.webhook_secret,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Plugin API error: ${response.statusText}`);
      }

      const result = await response.json();

      await base44.entities.PluginInstallation.update(installationId, {
        usage_count: installation.usage_count + 1,
        last_used: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      const installations = await base44.entities.PluginInstallation.filter({ 
        id: installationId 
      });
      
      if (installations.length > 0) {
        await base44.entities.PluginInstallation.update(installationId, {
          error_count: installations[0].error_count + 1,
          last_error: error.message,
        });
      }

      errorService.handle(error, { action: 'executePlugin', installationId }, 'medium');
      throw error;
    }
  }

  async sendWebhook(installationId, event, data) {
    try {
      const installations = await base44.entities.PluginInstallation.filter({ 
        id: installationId 
      });
      
      if (installations.length === 0) return;

      const installation = installations[0];
      const plugins = await base44.entities.Plugin.filter({ id: installation.plugin_id });
      
      if (plugins.length === 0 || !plugins[0].webhook_url) return;

      const plugin = plugins[0];

      await fetch(plugin.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Plugin-Key': installation.api_key,
          'X-Webhook-Secret': installation.webhook_secret,
          'X-Event-Type': event,
        },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          data,
        }),
      });
    } catch (error) {
      console.error('Failed to send webhook', error);
    }
  }

  async executeCustomAIModel(installationId, input) {
    try {
      const installations = await base44.entities.PluginInstallation.filter({ 
        id: installationId 
      });
      
      if (installations.length === 0) {
        throw new Error('Plugin installation not found');
      }

      const installation = installations[0];
      const plugins = await base44.entities.Plugin.filter({ id: installation.plugin_id });
      
      if (plugins.length === 0) {
        throw new Error('Plugin not found');
      }

      const plugin = plugins[0];

      if (!plugin.ai_model_config) {
        throw new Error('Not an AI model plugin');
      }

      const { api_endpoint, authentication_type } = plugin.ai_model_config;

      const headers = {
        'Content-Type': 'application/json',
      };

      if (authentication_type === 'api_key') {
        headers['Authorization'] = `Bearer ${installation.configuration.api_key}`;
      }

      const response = await fetch(api_endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`AI model API error: ${response.statusText}`);
      }

      const result = await response.json();

      await base44.entities.PluginInstallation.update(installationId, {
        usage_count: installation.usage_count + 1,
        last_used: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      errorService.handle(error, { action: 'executeCustomAIModel', installationId }, 'medium');
      throw error;
    }
  }

  generateAPIKey() {
    return 'plugin_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  generateSecret() {
    return 'whsec_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  getCategoryIcon(category) {
    const icons = {
      ai_model: '🤖',
      integration: '🔌',
      analytics: '📊',
      security: '🔒',
      workflow: '⚡',
      cicd: '🚀',
      utility: '🔧',
    };
    return icons[category] || '📦';
  }
}

export const pluginService = new PluginService();
export default pluginService;