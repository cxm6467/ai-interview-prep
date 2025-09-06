import ReactGA from 'react-ga4';

// Get GA ID from environment variables only
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

const devLog = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

const devWarn = (...args: unknown[]) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

// Check if analytics is properly configured
const isAnalyticsConfigured = (): boolean => {
  if (!GA_MEASUREMENT_ID) {
    devWarn('⚠️ GA_MEASUREMENT_ID not found in environment variables. Analytics disabled.');
    return false;
  }
  
  if (!GA_MEASUREMENT_ID.startsWith('G-')) {
    devWarn('⚠️ Invalid GA_MEASUREMENT_ID format. Should start with "G-". Analytics disabled.');
    return false;
  }
  
  return true;
};

export const initializeGA = () => {
  if (!isAnalyticsConfigured()) {
    devLog('📊 Analytics disabled - missing or invalid VITE_GA_MEASUREMENT_ID');
    return;
  }
  
  const enableAnalytics = isProduction || import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  
  if (enableAnalytics) {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      testMode: isDevelopment,
      gtagOptions: {
        cookie_domain: '.chrismarasco.io',
        cookie_flags: 'SameSite=None;Secure',
      },
    });

    const subdomain = getSubdomain();
    const environment = getEnvironment();
    const projectType = getProjectType();
    
    ReactGA.gtag('config', GA_MEASUREMENT_ID, {
      custom_map: {
        custom_parameter_1: 'environment',
        custom_parameter_2: 'subdomain',
        custom_parameter_3: 'project_type',
      },
    });

    ReactGA.gtag('event', 'page_view', {
      environment: environment,
      subdomain: subdomain,
      project_type: projectType,
    });

    devLog('📊 GA4 initialized for AI Tools:', { 
      environment, 
      subdomain, 
      projectType,
      gaId: GA_MEASUREMENT_ID?.slice(0, 5) + '...' // Only show first part in logs
    });
  } else {
    devLog('📊 Analytics configured but disabled - set VITE_ENABLE_ANALYTICS=true to enable');
  }
};

export const getSubdomain = (): string => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  }
  
  if (hostname === 'ai-ip.chrismarasco.io') {
    return 'ai-ip';
  }
  
  return hostname;
};

export const getEnvironment = (): string => {
  if (isProduction) return 'production';
  if (isDevelopment) return 'development';
  return 'unknown';
};

export const getProjectType = (): string => {
  return 'ai-tools';
};

// Safe analytics functions
const executeIfConfigured = (fn: () => void) => {
  if (isAnalyticsConfigured()) {
    try {
      fn();
    } catch (error) {
      devWarn('Analytics error:', error);
    }
  }
};

export const trackAIToolUsage = (toolName: string, action: string, details?: string) => {
  executeIfConfigured(() => {
    ReactGA.event({
      action: action,
      category: 'AI Tool Usage',
      label: `${toolName}_${details || ''}`,
    });
    
    devLog('🤖 AI Tool Event:', { toolName, action, details });
  });
};

export const trackAPICall = (endpoint: string, duration: number, success: boolean) => {
  executeIfConfigured(() => {
    ReactGA.event({
      action: success ? 'api_success' : 'api_error',
      category: 'API Calls',
      label: endpoint,
      value: Math.round(duration),
    });
    
    devLog('🔗 API Call:', { endpoint, duration, success });
  });
};

export const trackGenerationEvent = (type: string, inputLength: number, outputLength: number, processingTime: number) => {
  executeIfConfigured(() => {
    ReactGA.event({
      action: 'content_generated',
      category: 'AI Generation',
      label: type,
      value: Math.round(processingTime),
    });
    
    devLog('✨ Generation Event:', { type, inputLength, outputLength, processingTime });
  });
};

export const trackPageView = (page: string, title?: string) => {
  executeIfConfigured(() => {
    ReactGA.send({ 
      hitType: 'pageview', 
      page: page,
      title: title,
    });
    
    devLog('📄 Page view:', page);
  });
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  executeIfConfigured(() => {
    ReactGA.event({
      action,
      category,
      label,
      value,
    });
  });
};

export const getAnalyticsStatus = () => {
  return {
    configured: isAnalyticsConfigured(),
    gaId: GA_MEASUREMENT_ID ? GA_MEASUREMENT_ID.slice(0, 5) + '...' : 'NOT_SET',
    enabled: isProduction || import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    environment: getEnvironment(),
    subdomain: getSubdomain(),
  };
};