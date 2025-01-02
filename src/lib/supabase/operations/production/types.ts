export interface ProductionData {
  mixId: string;
  bagSize: number;
  quantity: number;
}

export interface ProductionResult {
  success: boolean;
  message?: string;
}