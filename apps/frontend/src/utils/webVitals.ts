import { onCLS, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { trackEvent } from './analytics';

const sendToAnalytics = (metric: Metric) => {
  trackEvent(metric.name, 'Web Vitals', metric.id, Math.round(metric.value));
};

export const initializeWebVitals = () => {
  if (import.meta.env.PROD) {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }
};