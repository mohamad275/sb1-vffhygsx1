export const AUTH_STORAGE_KEY = 'modern_feed_auth';

export const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const AUTH_ERRORS = {
  NO_SESSION: 'لم يتم العثور على جلسة',
  EXPIRED_SESSION: 'انتهت صلاحية الجلسة',
  INVALID_SESSION: 'جلسة غير صالحة',
  NETWORK_ERROR: 'خطأ في الاتصال بالخادم'
} as const;