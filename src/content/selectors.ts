export const CARD_SELECTORS = [
  // 'ytd-rich-item-renderer',
  'ytd-rich-grid-media',
  'ytd-video-renderer',
  'ytd-compact-video-renderer',
  'ytd-grid-video-renderer',
  'ytd-playlist-video-renderer',
  'ytd-channel-renderer',
  'yt-lockup-view-model',
];

export const cardSelector = CARD_SELECTORS.join(', ');

export const CARD_MARK_ATTR = 'data-ytdb-card';

// For cards with no channel link (e.g. sidebar `yt-lockup-view-model`),
// the channel name appears as plain text in the first metadata row.
export const CHANNEL_NAME_TEXT_SELECTOR =
  '.ytContentMetadataViewModelMetadataRow .ytContentMetadataViewModelMetadataText';

// Localized ("Go to channel <name>"); used only as a fallback.
export const CHANNEL_AVATAR_LABEL_SELECTOR = '[aria-label^="Go to channel "]';
