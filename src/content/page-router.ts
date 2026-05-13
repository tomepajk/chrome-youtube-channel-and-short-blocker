import { getBlockedChannels, isBlocked } from '../storage';
import { parseChannelHref, type ChannelRef } from './extract-channel';

const REDIRECT_TARGET = 'https://www.youtube.com/';
const WATCH_OWNER_SELECTOR =
  'ytd-video-owner-renderer a[href^="/@"], ytd-video-owner-renderer a[href^="/channel/"], #owner a[href^="/@"], #owner a[href^="/channel/"]';
const WATCH_TIMEOUT_MS = 5000;

export function getCurrentChannelFromUrl(): ChannelRef {
  const path = location.pathname;
  if (path.startsWith('/@') || path.startsWith('/channel/')) {
    return { ...parseChannelHref(path), name: null };
  }
  return { id: null, handle: null, name: null };
}

function waitForElement(
  selector: string,
  timeoutMs: number,
): Promise<Element | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) return resolve(existing);
    const root = document.body ?? document.documentElement;
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(el);
      }
    });
    observer.observe(root, { childList: true, subtree: true });
    const timer = window.setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);
  });
}

function pauseAllMedia(): void {
  document.querySelectorAll<HTMLMediaElement>('video, audio').forEach((m) => {
    try {
      m.pause();
    } catch {
      // ignore
    }
  });
}

async function checkChannelPage(): Promise<void> {
  const ref = getCurrentChannelFromUrl();
  if (!ref.id && !ref.handle) return;
  const blocked = await getBlockedChannels();
  if (isBlocked(ref, blocked)) {
    location.replace(REDIRECT_TARGET);
  }
}

async function checkWatchPage(): Promise<void> {
  if (location.pathname !== '/watch') return;
  const link = await waitForElement(WATCH_OWNER_SELECTOR, WATCH_TIMEOUT_MS);
  if (!link) return;
  if (location.pathname !== '/watch') return;
  const ref = parseChannelHref((link as HTMLAnchorElement).getAttribute('href'));
  if (!ref.id && !ref.handle) return;
  const blocked = await getBlockedChannels();
  if (isBlocked(ref, blocked)) {
    pauseAllMedia();
    location.replace(REDIRECT_TARGET);
  }
}

async function runRouteCheck(): Promise<void> {
  await checkChannelPage();
  await checkWatchPage();
}

export function startPageRouter(): void {
  void runRouteCheck();
  document.addEventListener('yt-navigate-finish', () => {
    void runRouteCheck();
  });
}
