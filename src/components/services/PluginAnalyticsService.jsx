/**
 * Plugin Analytics Service
 * Handles real-time analytics streaming from plugins
 */

class PluginAnalyticsService {
  constructor() {
    this.connections = new Map();
    this.dataBuffers = new Map();
  }

  /**
   * Connect to plugin analytics stream
   */
  connectStream(pluginId, streamingEndpoint, onData, onError) {
    if (this.connections.has(pluginId)) {
      this.disconnectStream(pluginId);
    }

    try {
      // Determine if WebSocket or SSE
      if (streamingEndpoint.startsWith('ws://') || streamingEndpoint.startsWith('wss://')) {
        this._connectWebSocket(pluginId, streamingEndpoint, onData, onError);
      } else {
        this._connectSSE(pluginId, streamingEndpoint, onData, onError);
      }
    } catch (error) {
      console.error(`Failed to connect to plugin ${pluginId} analytics stream:`, error);
      onError?.(error);
    }
  }

  /**
   * WebSocket connection
   */
  _connectWebSocket(pluginId, endpoint, onData, onError) {
    const ws = new WebSocket(endpoint);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this._bufferData(pluginId, data);
        onData(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };

    ws.onclose = () => {
      console.log(`WebSocket connection closed for plugin ${pluginId}`);
      this.connections.delete(pluginId);
    };

    this.connections.set(pluginId, { type: 'websocket', connection: ws });
  }

  /**
   * Server-Sent Events connection
   */
  _connectSSE(pluginId, endpoint, onData, onError) {
    const eventSource = new EventSource(endpoint);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this._bufferData(pluginId, data);
        onData(data);
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      onError?.(error);
      eventSource.close();
      this.connections.delete(pluginId);
    };

    this.connections.set(pluginId, { type: 'sse', connection: eventSource });
  }

  /**
   * Disconnect from analytics stream
   */
  disconnectStream(pluginId) {
    const conn = this.connections.get(pluginId);
    if (!conn) return;

    if (conn.type === 'websocket') {
      conn.connection.close();
    } else if (conn.type === 'sse') {
      conn.connection.close();
    }

    this.connections.delete(pluginId);
    this.dataBuffers.delete(pluginId);
  }

  /**
   * Buffer data for historical queries
   */
  _bufferData(pluginId, data) {
    if (!this.dataBuffers.has(pluginId)) {
      this.dataBuffers.set(pluginId, []);
    }

    const buffer = this.dataBuffers.get(pluginId);
    buffer.push({ timestamp: Date.now(), data });

    // Keep last 1000 data points
    if (buffer.length > 1000) {
      buffer.shift();
    }
  }

  /**
   * Get buffered historical data
   */
  getHistoricalData(pluginId, since = null) {
    const buffer = this.dataBuffers.get(pluginId) || [];
    if (!since) return buffer;

    return buffer.filter(item => item.timestamp >= since);
  }

  /**
   * Disconnect all streams
   */
  disconnectAll() {
    for (const pluginId of this.connections.keys()) {
      this.disconnectStream(pluginId);
    }
  }
}

export const pluginAnalyticsService = new PluginAnalyticsService();