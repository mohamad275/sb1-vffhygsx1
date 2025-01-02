export interface OperationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ProductionResult extends OperationResult {}
export interface SaleResult extends OperationResult {}
export interface MixResult extends OperationResult {}