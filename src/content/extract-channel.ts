export type ChannelRef = {
  id: string | null;
  handle: string | null;
};

export function parseChannelHref(href: string | null | undefined): ChannelRef {
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

export function extractChannelFromCard(card: Element): ChannelRef {
  const links = card.querySelectorAll<HTMLAnchorElement>(
    'a[href^="/@"], a[href^="/channel/"]',
  );
  let id: string | null = null;
  let handle: string | null = null;
  for (const link of links) {
    const ref = parseChannelHref(link.getAttribute('href'));
    if (ref.id && !id) id = ref.id;
    if (ref.handle && !handle) handle = ref.handle;
    if (id && handle) break;
  }
  return { id, handle };
}
