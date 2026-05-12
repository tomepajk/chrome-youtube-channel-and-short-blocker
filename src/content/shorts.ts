import { getSettings, onSettingsChange } from '../storage';

const SHORTS_HIDDEN_ATTR = 'data-ytdb-shorts-hidden';
const REDIRECT_TARGET = 'https://www.youtube.com/';

const SHORTS_SELECTORS = [
  'ytd-reel-shelf-renderer',
  'ytd-rich-shelf-renderer[is-shorts]',
  'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
  'ytd-rich-section-renderer:has(ytd-reel-shelf-renderer)',
  'ytd-rich-section-renderer:has(a[href^="/shorts/"])',
  'grid-shelf-view-model',
  'ytd-reel-item-renderer',
  'ytm-shorts-lockup-view-model',
  'ytm-shorts-lockup-view-model-v2',
  'ytd-video-renderer:has(a[href^="/shorts/"])',
  'ytd-rich-item-renderer:has(a[href^="/shorts/"])',
  'yt-lockup-view-model:has(a[href^="/shorts/"])',
  'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
  'ytd-guide-entry-renderer:has(a[title="Shorts"])',
  'a[title="Shorts"]',
];

let hideAllShorts = true;

function applyAttrs(): void {
  for (const sel of SHORTS_SELECTORS) {
    let nodes: NodeListOf<Element>;
    try {
      nodes = document.querySelectorAll(sel);
    } catch {
      continue;
    }
    nodes.forEach((el) => {
      if (hideAllShorts) el.setAttribute(SHORTS_HIDDEN_ATTR, '1');
      else el.removeAttribute(SHORTS_HIDDEN_ATTR);
    });
  }
}

function clearAttrs(): void {
  document
    .querySelectorAll(`[${SHORTS_HIDDEN_ATTR}="1"]`)
    .forEach((el) => el.removeAttribute(SHORTS_HIDDEN_ATTR));
}

function checkShortsRedirect(): void {
  if (!hideAllShorts) return;
  if (location.pathname.startsWith('/shorts/')) {
    location.replace(REDIRECT_TARGET);
  }
}

export function startShorts(): void {
  void getSettings().then((settings) => {
    hideAllShorts = settings.hideAllShorts;
    checkShortsRedirect();
    applyAttrs();
  });

  onSettingsChange((settings) => {
    hideAllShorts = settings.hideAllShorts;
    if (hideAllShorts) {
      checkShortsRedirect();
      applyAttrs();
    } else {
      clearAttrs();
    }
  });

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (hideAllShorts) applyAttrs();
    });
  };

  const obs = new MutationObserver(schedule);
  const begin = () => {
    obs.observe(document.body, { childList: true, subtree: true });
    schedule();
  };
  if (document.body) begin();
  else document.addEventListener('DOMContentLoaded', begin, { once: true });

  document.addEventListener('yt-navigate-finish', () => {
    checkShortsRedirect();
    schedule();
  });
}