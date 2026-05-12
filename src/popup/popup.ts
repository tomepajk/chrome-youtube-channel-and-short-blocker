import {
  getBlockedChannels,
  getCounters,
  getSettings,
  onBlocklistChange,
  onCountersChange,
  onSettingsChange,
  removeBlockedChannel,
  setSettings,
} from '../storage';
import type { BlockedChannel } from '../storage/types';

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

function renderBlocklist(list: BlockedChannel[]): void {
  const ul = el<HTMLUListElement>('blocklist');
  const empty = el<HTMLParagraphElement>('empty-state');
  const count = el<HTMLSpanElement>('blocklist-count');

  count.textContent = String(list.length);
  ul.replaceChildren();

  if (list.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const sorted = [...list].sort((a, b) => b.blockedAt - a.blockedAt);
  for (const entry of sorted) {
    const li = document.createElement('li');

    const channel = document.createElement('div');
    channel.className = 'channel';

    const name = document.createElement('span');
    name.className = 'channel-name';
    name.textContent = entry.name || entry.handle || entry.id;

    const handle = document.createElement('span');
    handle.className = 'channel-handle';
    handle.textContent = entry.handle ? `@${entry.handle}` : entry.id;

    channel.append(name, handle);

    const btn = document.createElement('button');
    btn.className = 'unblock-btn';
    btn.type = 'button';
    btn.textContent = '×';
    btn.title = `Unblock ${entry.name || entry.handle}`;
    btn.setAttribute('aria-label', `Unblock ${entry.name || entry.handle}`);
    btn.addEventListener('click', () => {
      void removeBlockedChannel(entry.id || entry.handle);
    });

    li.append(channel, btn);
    ul.append(li);
  }
}

function renderCounters(today: number, total: number): void {
  el<HTMLSpanElement>('hidden-today').textContent = today.toLocaleString();
  el<HTMLSpanElement>('hidden-total').textContent = total.toLocaleString();
}

async function init(): Promise<void> {
  const [list, counters, settings] = await Promise.all([
    getBlockedChannels(),
    getCounters(),
    getSettings(),
  ]);
  renderBlocklist(list);
  renderCounters(counters.hiddenToday.count, counters.hiddenTotal);

  const shortsToggle = el<HTMLInputElement>('shorts-toggle');
  shortsToggle.checked = settings.hideAllShorts;
  shortsToggle.addEventListener('change', () => {
    void setSettings({ hideAllShorts: shortsToggle.checked });
  });

  el<HTMLAnchorElement>('open-options').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  onBlocklistChange(renderBlocklist);
  onCountersChange((c) => renderCounters(c.hiddenToday.count, c.hiddenTotal));
  onSettingsChange((s) => {
    shortsToggle.checked = s.hideAllShorts;
  });
}

void init();
