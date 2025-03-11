
import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const BACKOFF_FACTOR = 1.5; // Exponential backoff factor

export const retryOperation = async <T,>(
  operation: () => Promise<T>, 
  retries = MAX_RETRIES, 
  delayMs = RETRY_DELAY
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error instanceof Error && 
       (error.message.includes('fetch') || 
        error.message.includes('network') || 
        error.message.includes('timeout'))) {
      console.log(`Operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return retryOperation(operation, retries - 1, delayMs * BACKOFF_FACTOR);
    }
    throw error;
  }
};

export const handleApiResponse = <T>(response: PostgrestResponse<T> | PostgrestSingleResponse<T>): T => {
  if (response.error) {
    console.error('API error:', response.error);
    throw new Error(`API request failed: ${response.error.message}`);
  }
  
  if (!response.data) {
    console.error('No data returned from API');
    throw new Error('No data returned from API');
  }
  
  return response.data;
};
