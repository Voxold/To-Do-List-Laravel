// Configuration file for the application

// API configuration
export const API_CONFIG = {
  BASE_URL: "http://127.0.0.1:8000",
  ENDPOINTS: {
    TODOS: "/todos",
  },
  // Add any additional API configuration here
}

// Feature flags
export const FEATURES = {
  ENABLE_OFFLINE_MODE: false,
  ENABLE_NOTIFICATIONS: false,
}

// App settings
export const APP_SETTINGS = {
  APP_NAME: "TaskNest",
  APP_DESCRIPTION: "Your cozy productivity home",
  THEME_COLOR: "#d97706", // Amber-600
}
