
export const APP_CONSTANTS = {
  STORAGE_KEYS: {
    USER_PREFERENCES: 'user_preferences',
    THEME: 'theme',
    LANGUAGE: 'language'
  },
  
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  },
  
  DEBOUNCE_DELAYS: {
    SEARCH: 300,
    INPUT: 500,
    API_CALL: 1000
  },
  
  TOAST_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000
  },
  
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
  }
} as const;

export const ROUTE_PATHS = {
  HOME: '/',
  LANDING: '/landing',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
  BOARD: '/board',
  TASKS: '/tasks',
  ASSETS: '/assets',
  ROOMS: '/rooms',
  SPACES: '/spaces',
  DOCUMENTS: '/documents',
  QR_CODES: '/qr-codes',
  INSIGHTS: '/insights',
  ORGANISATION: '/organisation',
  HELP: '/help',
  BUILDING: '/building'
} as const;
