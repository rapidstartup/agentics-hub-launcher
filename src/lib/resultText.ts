export const getResultText = (result: any): string => {
  if (!result) return "";
  if (typeof result === "string") return result;
  if (result.output) return result.output;
  if (result.result) return typeof result.result === "string" ? result.result : JSON.stringify(result.result, null, 2);
  if (result.raw) return result.raw;
  return JSON.stringify(result, null, 2);
};


