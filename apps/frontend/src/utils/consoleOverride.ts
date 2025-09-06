/**
 * Global Console Override
 * 
 * Overrides native console methods to respect VITE_ENABLE_CONSOLE_LOGS environment variable.
 * When VITE_ENABLE_CONSOLE_LOGS=false, all console output is suppressed.
 */

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
};

/**
 * Initialize console override based on environment configuration
 */
export const initializeConsoleOverride = (): void => {
  const consoleLogsEnabled = import.meta.env.VITE_ENABLE_CONSOLE_LOGS !== 'false';
  
  if (!consoleLogsEnabled) {
    // Replace all console methods with no-op functions
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};
    console.debug = () => {};
  } else {
    // Restore original console methods (in case they were disabled before)
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
  }
};

/**
 * Restore original console methods
 */
export const restoreConsole = (): void => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
};