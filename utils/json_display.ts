export default function jsonToLabeledText(obj?: Record<string, any>): string {
  if (!obj || Object.keys(obj).length === 0) {
    return "No content available";
  }
  
  return Object.entries(obj)
    .map(([key, value]) => `**${key}**: ${value}`)
    .join('\n');
}
