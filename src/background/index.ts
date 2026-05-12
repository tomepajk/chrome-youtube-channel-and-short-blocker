import { getBlockedChannels, setBlockedChannels } from '../storage';

chrome.commands.onCommand.addListener((command) => {
  if (command === 'reload-extension') {
    chrome.runtime.reload();
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== 'install') return;

  const existing = await getBlockedChannels();
  if (existing.length > 0) return;

  await setBlockedChannels([
    {
      id: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
      handle: 'MrBeast',
      name: 'MrBeast',
      blockedAt: Date.now(),
    },
  ]);
});
