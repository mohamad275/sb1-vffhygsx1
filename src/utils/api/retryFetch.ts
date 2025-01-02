/**
 * Utility for retrying failed API calls with exponential backoff
 */
 export const retryFetch = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryFetch(operation, retries - 1, delay * 2);
  }
};