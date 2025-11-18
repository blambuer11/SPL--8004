// Simple analytics placeholder
class Analytics {
  static track(event: string, properties?: Record<string, any>) {
    console.log('Analytics:', event, properties);
    // In production, integrate with your analytics service
  }
}

export default Analytics;