
import { supabase } from '../supabase';
import { retryOperation } from '../utils/apiUtils';

export class BaseService {
  protected static async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    try {
      const { data, error } = await retryOperation(queryFn);
      
      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Query failed: ${error.message}`);
      }
      
      if (!data) {
        console.error('No data returned from query');
        throw new Error('No data returned from query');
      }
      
      return data;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }
}
