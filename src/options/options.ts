import {
  getBlockedChannels,
  getCounters,
  getSettings,
  onBlocklistChange,
  removeBlockedChannel,
  setBlockedChannels,
  setSettings,
} from '../storage';
import type { BlockedChannel, Counters, Settings } from '../storage/types';

type ExportPayload = {
  version: 1;
  exportedAt: string;
  blockedChannels: BlockedChannel[];
  settings: Settings;
  counters: Counters;
};

let currentList: BlockedChannel[] = [];
let selected = new Set<string>();
let searchTerm = '';

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

function keyOf(c: BlockedChannel): string {
  return c.id || c.handle;
}

function filtered(): BlockedChannel[] {
  if (!searchTerm) return currentList;
  const term = searchTerm.toLowerCase();
  return currentList.filter((c) =>
    [c.name, c.handle, c.id].some((v) => v?.toLowerCase().includes(term)),
  );
}

function render(): void {
  const ul = el<HTMLUListElement>('blocklist');
  const empty = el<HTMLParagraphElement>('empty-state');
  const total = el<HTMLSpanElement>('total-count');
  const bulkBtn = el<HTMLButtonElement>('bulk-unblock');
  const selectedCount = el<HTMLSpanElement>('selected-count');

  total.textContent = String(currentList.length);
  selectedCount.textContent = String(selected.size);
  bulkBtn.disabled = selected.size === 0;

  const view = filtered();
  ul.replaceChildren();

  if (view.length === 0) {
    empty.hidden = false;
    empty.textContent = currentList.length === 0
      ? 'No channels blocked yet.'
      : 'No channels match your search.';
    return;
  }
  empty.hidden = true;

  const sorted = [...view].sort((a, b) => b.blockedAt - a.blockedAt);
  for (const entry of sorted) {
    const li = document.createElement('li');
    const key = keyOf(entry);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selected.has(key);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selected.add(key);
      else selected.delete(key);
      render();
    });

    const channel = document.createElement('div');
    channel.className = 'channel';
    const name = document.createElement('span');
    name.className = 'channel-name';
    name.textContent = entry.name || entry.handle || entry.id;
    const handle = document.createElement('span');
    handle.className = 'channel-handle';
    handle.textContent = entry.handle ? `@${entry.handle}` : entry.id;
    channel.append(name, handle);

    const unblock = document.createElement('button');
    unblock.className = 'unblock-btn';
    unblock.type = 'button';
    unblock.textContent = 'Unblock';
    unblock.addEventListener('click', () => {
      void removeBlockedChannel(entry);
      selected.delete(key);
    });

    li.append(checkbox, channel, unblock);
    ul.append(li);
  }
}

function setStatus(message: string, kind: '' | 'success' | 'error' = ''): void {
  const status = el<HTMLParagraphElement>('status');
  status.textContent = message;
  status.classList.remove('success', 'error');
  if (kind) status.classList.add(kind);
}

async function exportPayload(): Promise<ExportPayload> {
  const [blockedChannels, settings, counters] = await Promise.all([
    getBlockedChannels(),
    getSettings(),
    getCounters(),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    blockedChannels,
    settings,
    counters,
  };
}

function downloadJson(payload: ExportPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yt-distraction-blocker-${payload.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function isValidPayload(value: unknown): value is ExportPayload {
  if (!value || typeof value !== 'object') return false;
  const p = value as Partial<ExportPayload>;
  if (p.version !== 1) return false;
  if (!Array.isArray(p.blockedChannels)) return false;
  return p.blockedChannels.every(
    (c) =>
      c &&
      typeof c === 'object' &&
      typeof (c as BlockedChannel).id === 'string' &&
      typeof (c as BlockedChannel).handle === 'string' &&
      typeof (c as BlockedChannel).blockedAt === 'number',
  );
}

async function handleImport(file: File): Promise<void> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!isValidPayload(parsed)) {
      setStatus('Import failed: file does not match expected format.', 'error');
      return;
    }
    const mode = window.confirm(
      `Import ${parsed.blockedChannels.length} channel(s).\n\n` +
        'OK = MERGE with existing list.\n' +
        'Cancel = REPLACE existing list entirely.',
    );
    if (mode) {
      const existing = await getBlockedChannels();
      const byKey = new Map<string, BlockedChannel>();
      for (const c of existing) byKey.set(keyOf(c), c);
      for (const c of parsed.blockedChannels) byKey.set(keyOf(c), c);
      await setBlockedChannels([...byKey.values()]);
      setStatus(`Merged. List now has ${byKey.size} channel(s).`, 'success');
    } else {
      await setBlockedChannels(parsed.blockedChannels);
      if (parsed.settings) await setSettings(parsed.settings);
      setStatus(
        `Replaced. List now has ${parsed.blockedChannels.length} channel(s).`,
        'success',
      );
    }
  } catch (err) {
    setStatus(`Import failed: ${(err as Error).message}`, 'error');
  }
}

async function init(): Promise<void> {
  currentList = await getBlockedChannels();
  render();

  el<HTMLInputElement>('search').addEventListener('input', (e) => {
    searchTerm = (e.target as HTMLInputElement).value.trim();
    render();
  });

  el<HTMLButtonElement>('select-all').addEventListener('click', () => {
    const view = filtered();
    const allSelected = view.every((c) => selected.has(keyOf(c)));
    if (allSelected) {
      view.forEach((c) => selected.delete(keyOf(c)));
    } else {
      view.forEach((c) => selected.add(keyOf(c)));
    }
    render();
  });

  el<HTMLButtonElement>('bulk-unblock').addEventListener('click', async () => {
    if (selected.size === 0) return;
    const ok = window.confirm(`Unblock ${selected.size} channel(s)?`);
    if (!ok) return;
    const remaining = currentList.filter((c) => !selected.has(keyOf(c)));
    await setBlockedChannels(remaining);
    selected.clear();
    setStatus(`Unblocked. ${remaining.length} channel(s) remain.`, 'success');
  });

  el<HTMLButtonElement>('export').addEventListener('click', async () => {
    const payload = await exportPayload();
    downloadJson(payload);
    setStatus(`Exported ${payload.blockedChannels.length} channel(s).`, 'success');
  });

  el<HTMLInputElement>('import').addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) await handleImport(file);
    input.value = '';
  });

  onBlocklistChange((list) => {
    currentList = list;
    selected = new Set([...selected].filter((k) =>
      list.some((c) => keyOf(c) === k),
    ));
    render();
  });
}

void init();
