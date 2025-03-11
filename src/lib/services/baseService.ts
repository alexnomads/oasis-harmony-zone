
import { supabase } from '../supabase';

export class BaseService {
  protected static async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    const { data, error } = await queryFn();
      
    if (error) {
      console.error('Supabase query error:', error);
      throw new Error(`Query failed: ${error.message}`);
    }
    
    if (!data) {
      console.error('No data returned from query');
      throw new Error('No data returned from query');
    }
    
    return data;
  }
}
