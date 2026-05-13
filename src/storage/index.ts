import type { BlockedChannel, Counters, Settings } from './types';

const KEY_BLOCKLIST = 'blockedChannels';
const KEY_SETTINGS = 'settings';
const KEY_COUNTERS = 'counters';

const DEFAULT_SETTINGS: Settings = { hideAllShorts: true };
const DEFAULT_COUNTERS: Counters = {
  hiddenToday: { date: localDateString(), count: 0 },
  hiddenTotal: 0,
};

function localDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isExtensionAlive(): boolean {
  try {
    return !!chrome?.runtime?.id;
  } catch {
    return false;
  }
}

let migrationPromise: Promise<void> | null = null;
async function ensureSyncToLocalMigration(): Promise<void> {
  if (migrationPromise) return migrationPromise;
  migrationPromise = (async () => {
    if (!isExtensionAlive()) return;
    try {
      const keys = [KEY_BLOCKLIST, KEY_SETTINGS, KEY_COUNTERS];
      const local = await chrome.storage.local.get(keys);
      if (keys.some((k) => local[k] !== undefined)) return;
      const sync = await chrome.storage.sync.get(keys);
      const toCopy: Record<string, unknown> = {};
      for (const k of keys) if (sync[k] !== undefined) toCopy[k] = sync[k];
      if (Object.keys(toCopy).length > 0) {
        await chrome.storage.local.set(toCopy);
      }
    } catch {
      // migration is best-effort; existing data stays in sync as a fallback
    }
  })();
  return migrationPromise;
}

async function safeGet<T>(key: string, fallback: T): Promise<T> {
  if (!isExtensionAlive()) return fallback;
  await ensureSyncToLocalMigration();
  try {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T | undefined) ?? fallback;
  } catch {
    return fallback;
  }
}

async function safeSet(payload: Record<string, unknown>): Promise<void> {
  if (!isExtensionAlive()) return;
  await ensureSyncToLocalMigration();
  try {
    await chrome.storage.local.set(payload);
  } catch {
    // extension context invalidated or quota exceeded
  }
}

function safeOnChanged(
  listener: (
    changes: { [k: string]: chrome.storage.StorageChange },
    area: string,
  ) => void,
): () => void {
  if (!isExtensionAlive()) return () => {};
  try {
    chrome.storage.onChanged.addListener(listener);
    return () => {
      try {
        chrome.storage.onChanged.removeListener(listener);
      } catch {
        // ignore
      }
    };
  } catch {
    return () => {};
  }
}

export async function getBlockedChannels(): Promise<BlockedChannel[]> {
  return safeGet<BlockedChannel[]>(KEY_BLOCKLIST, []);
}

export async function setBlockedChannels(list: BlockedChannel[]): Promise<void> {
  await safeSet({ [KEY_BLOCKLIST]: list });
}

export async function addBlockedChannel(entry: BlockedChannel): Promise<void> {
  const list = await getBlockedChannels();
  const entryName = entry.name?.trim().toLowerCase() ?? '';
  const exists = list.some((c) => {
    if (entry.id && c.id === entry.id) return true;
    if (entry.handle && c.handle === entry.handle) return true;
    if (entryName && c.name && c.name.trim().toLowerCase() === entryName) {
      return true;
    }
    return false;
  });
  if (exists) return;
  await setBlockedChannels([...list, entry]);
}

export async function removeBlockedChannel(
  ref: { id?: string | null; handle?: string | null; name?: string | null },
): Promise<void> {
  const list = await getBlockedChannels();
  const refName = ref.name?.trim().toLowerCase() ?? '';
  const next = list.filter((c) => {
    if (ref.id && c.id === ref.id) return false;
    if (ref.handle && c.handle === ref.handle) return false;
    if (refName && c.name && c.name.trim().toLowerCase() === refName) return false;
    return true;
  });
  if (next.length !== list.length) {
    await setBlockedChannels(next);
  }
}

export function onBlocklistChange(
  cb: (list: BlockedChannel[]) => void,
): () => void {
  return safeOnChanged((changes, area) => {
    if (area === 'local' && changes[KEY_BLOCKLIST]) {
      cb((changes[KEY_BLOCKLIST].newValue as BlockedChannel[] | undefined) ?? []);
    }
  });
}

export function isBlocked(
  channel: { id?: string | null; handle?: string | null; name?: string | null },
  list: BlockedChannel[],
): boolean {
  const cardName = channel.name?.trim().toLowerCase() ?? '';
  const isBlockedValue =  list.some((c) => {
    if (channel.id && c.id === channel.id) return true;
    if (channel.handle && c.handle === channel.handle) return true;
    if (channel.name && c.name === channel.name) return true;
    // Fallback for cards with no channel link (e.g. sidebar yt-lockup-view-model):
    // match on name when neither id nor handle is available on the card.
    if (!channel.id && !channel.handle && cardName && c.name) {
      return c.name.trim().toLowerCase() === cardName;
    }
    return false;
  });

  return isBlockedValue;
}

export async function getSettings(): Promise<Settings> {
  const stored = await safeGet<Partial<Settings>>(KEY_SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function setSettings(patch: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await safeSet({ [KEY_SETTINGS]: { ...current, ...patch } });
}

export function onSettingsChange(cb: (settings: Settings) => void): () => void {
  return safeOnChanged((changes, area) => {
    if (area === 'local' && changes[KEY_SETTINGS]) {
      cb({
        ...DEFAULT_SETTINGS,
        ...((changes[KEY_SETTINGS].newValue as Settings | undefined) ?? {}),
      });
    }
  });
}

export async function getCounters(): Promise<Counters> {
  const stored = await safeGet<Counters | null>(KEY_COUNTERS, null);
  if (!stored) {
    return { ...DEFAULT_COUNTERS, hiddenToday: { date: localDateString(), count: 0 } };
  }
  if (stored.hiddenToday.date !== localDateString()) {
    return { ...stored, hiddenToday: { date: localDateString(), count: 0 } };
  }
  return stored;
}

let pendingIncrement = 0;
let flushTimer: number | null = null;

async function flushIncrement(): Promise<void> {
  if (pendingIncrement === 0) return;
  const inc = pendingIncrement;
  pendingIncrement = 0;
  flushTimer = null;
  if (!isExtensionAlive()) return;
  const today = localDateString();
  const current = await getCounters();
  const next: Counters = {
    hiddenToday:
      current.hiddenToday.date === today
        ? { date: today, count: current.hiddenToday.count + inc }
        : { date: today, count: inc },
    hiddenTotal: current.hiddenTotal + inc,
  };
  await safeSet({ [KEY_COUNTERS]: next });
}

export function incrementHiddenCount(by = 1): void {
  pendingIncrement += by;
  if (flushTimer === null) {
    flushTimer = (globalThis as unknown as { setTimeout: typeof setTimeout })
      .setTimeout(() => void flushIncrement(), 750) as unknown as number;
  }
}

export function onCountersChange(cb: (c: Counters) => void): () => void {
  return safeOnChanged((changes, area) => {
    if (area === 'local' && changes[KEY_COUNTERS]) {
      void getCounters().then(cb);
    }
  });
}

export const STORAGE_KEYS = {
  blocklist: KEY_BLOCKLIST,
  settings: KEY_SETTINGS,
  counters: KEY_COUNTERS,
} as const;
