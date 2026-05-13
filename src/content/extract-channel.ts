import {
  CHANNEL_AVATAR_LABEL_SELECTOR,
  CHANNEL_NAME_TEXT_SELECTOR,
  WATCH_OWNER_LINK_SELECTOR,
} from './selectors';

export type ChannelRef = {
  id: string | null;
  handle: string | null;
  name: string | null;
};

type HrefRef = { id: string | null; handle: string | null };

export function parseChannelHref(href: string | null | undefined): HrefRef {
  if (!href) return { id: null, handle: null };
  try {
    const url = href.startsWith('http')
      ? new URL(href)
      : new URL(href, 'https://www.youtube.com');
    const path = url.pathname;
    if (path.startsWith('/@')) {
      const segment = (path.split('/')[1] ?? '').replace(/^@/, '');
      return { id: null, handle: segment || null };
    }
    if (path.startsWith('/channel/')) {
      const segment = path.split('/')[2] ?? '';
      return { id: segment || null, handle: null };
    }
  } catch {
    // fall through
  }
  return { id: null, handle: null };
}

function findChannelNameFallback(card: Element): string | null {
  const span = card.querySelector(CHANNEL_NAME_TEXT_SELECTOR);
  const spanText = span?.textContent?.trim();
  if (spanText) return spanText;

  const avatar = card.querySelector(CHANNEL_AVATAR_LABEL_SELECTOR);
  const label = avatar?.getAttribute('aria-label');
  if (label) {
    const stripped = label.replace(/^Go to channel\s+/i, '').trim();
    if (stripped && stripped !== label) return stripped;
  }
  return null;
}

export function extractChannelFromCard(card: Element): ChannelRef {
  const links = card.querySelectorAll<HTMLAnchorElement>(
    'a[href^="/@"], a[href^="/channel/"]',
  );
  let id: string | null = null;
  let handle: string | null = null;
  let name: string | null = null;
  for (const link of links) {
    const ref = parseChannelHref(link.getAttribute('href'));
    if (ref.id && !id) id = ref.id;
    if (ref.handle && !handle) handle = ref.handle;
    if (!name && link.id !== 'avatar-link' && link.id !== 'thumbnail') {
      const text = link.textContent?.trim();
      if (text) name = text;
    }
    if (id && handle && name) break;
  }

  if (!name) name = findChannelNameFallback(card);

  return { id, handle, name };
}

// Extracts the channel of the currently-playing video on /watch by reading
// the owner section. The owner usually has two links to the same channel
// (avatar + name); we prefer the text-bearing one so we also capture the name.
export function extractChannelFromWatchPage(): ChannelRef | null {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    WATCH_OWNER_LINK_SELECTOR,
  );
  if (!links.length) return null;
  const linkWithText = Array.from(links).find((a) => a.textContent?.trim());
  const sourceLink = linkWithText ?? links[0];
  return {
    ...parseChannelHref(sourceLink.getAttribute('href')),
    name: linkWithText?.textContent?.trim() || null,
  };
}
