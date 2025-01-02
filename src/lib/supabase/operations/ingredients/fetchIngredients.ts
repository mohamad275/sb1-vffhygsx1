```typescript
import { supabase } from '../../client';

export const fetchIngredients = async () => {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
```