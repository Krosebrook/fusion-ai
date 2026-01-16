import { base44 } from '@/api/base44Client';

/**
 * PersonalizationService - Track behavior and generate insights
 */
export class PersonalizationService {
  /**
   * Track user behavior event
   */
  static async trackBehavior(eventType, eventData = {}, context = {}) {
    try {
      const user = await base44.auth.me().catch(() => null);
      if (!user) return;

      // Enrich context with browser info
      const enrichedContext = {
        device: this.getDeviceType(),
        browser: this.getBrowserInfo(),
        time_of_day: this.getTimeOfDay(),
        ...context
      };

      await base44.entities.UserBehavior.create({
        user_id: user.id,
        event_type: eventType,
        event_data: eventData,
        context: enrichedContext,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Behavior tracking error:', error);
    }
  }

  /**
   * Track page view
   */
  static async trackPageView(pageName, duration = null) {
    await this.trackBehavior('page_view', {
      page: pageName,
      duration_seconds: duration
    });
  }

  /**
   * Track app interaction
   */
  static async trackAppClick(appId, appName) {
    await this.trackBehavior('app_click', {
      app_id: appId,
      app_name: appName
    });
  }

  /**
   * Track feature usage
   */
  static async trackFeatureUse(featureName, success = true) {
    await this.trackBehavior('feature_use', {
      feature: featureName,
      success
    });
  }

  /**
   * Track search query
   */
  static async trackSearch(query) {
    await this.trackBehavior('search_query', {
      query
    });
  }

  /**
   * Get personalized insights from AI
   */
  static async getPersonalizedInsights() {
    try {
      const result = await base44.functions.invoke('generatePersonalizedInsights', {});
      return result.data;
    } catch (error) {
      console.error('Failed to get insights:', error);
      return null;
    }
  }

  // Helper methods
  static getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  static getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  static getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
}