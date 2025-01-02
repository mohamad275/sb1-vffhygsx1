export class DatabaseError extends Error {
  constructor(message: string, public table: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof DatabaseError) {
    return `خطأ في قاعدة البيانات: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'حدث خطأ غير متوقع';
};