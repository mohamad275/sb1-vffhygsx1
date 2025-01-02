export const validateApiKey = (apiKey: string | undefined): boolean => {
  return apiKey === process.env.REPORT_API_KEY;
};