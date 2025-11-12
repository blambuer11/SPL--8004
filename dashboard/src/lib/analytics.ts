// Simple analytics helper - extendable for backend or third-party services
export type AnalyticsEvent = {
  event: string;
  properties?: Record<string, unknown>;
  ts?: number;
};

class Analytics {
  private static buffer: AnalyticsEvent[] = [];
  private static maxBuffer = 200;

  static track(event: string, properties?: Record<string, unknown>) {
    const payload: AnalyticsEvent = { event, properties, ts: Date.now() };
    this.buffer.unshift(payload);
    if (this.buffer.length > this.maxBuffer) this.buffer.pop();
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] ${event}`, properties || {});
    }
    // TODO: Optionally POST to /api/analytics
  }

  static getRecent(limit = 25) {
    return this.buffer.slice(0, limit);
  }
}

export default Analytics;
