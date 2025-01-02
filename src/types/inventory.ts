export interface RemainingInventory {
  id: string;
  mix_id: string;
  bag_size: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  mixes?: {
    id: string;
    name: string;
  };
}