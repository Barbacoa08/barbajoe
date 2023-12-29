export const copyTextToClipboard = async (text: string) =>
  await navigator.clipboard.writeText(text);
