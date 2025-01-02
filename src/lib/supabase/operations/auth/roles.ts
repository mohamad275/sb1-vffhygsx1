import { supabase } from '../../client';

export const getUserRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.role || 'viewer';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'viewer'; // Default to viewer role on error
  }
};