```typescript
import { supabase } from '../../client';

export const deleteIngredient = async (id: string) => {
  try {
    const { data, error } = await supabase.rpc('delete_ingredient_safe', {
      p_ingredient_id: id
    });

    if (error) throw error;
    if (!data?.success) {
      throw new Error(data?.message || 'لا يمكن حذف هذا الصنف');
    }

    return {
      success: true,
      message: 'تم حذف الصنف بنجاح'
    };
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الصنف'
    };
  }
};
```