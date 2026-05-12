import { getBlockedChannels, onBlocklistChange } from '../storage';
import type { BlockedChannel } from '../storage/types';
import {
  ensureHideStyles,
  processCardForHiding,
  reapplyHidingAll,
  resetAllHiding,
} from './hide';
import { ensureBlockButtonStyles, injectBlockButton } from './block-button';
import { startCardObserver } from './observer';
import { startPageRouter } from './page-router';
import { startChannelPageWatcher } from './channel-page';
import { startShorts } from './shorts';

let blockedChannels: BlockedChannel[] = [];

async function init(): Promise<void> {
  blockedChannels = await getBlockedChannels();

  onBlocklistChange((list) => {
    blockedChannels = list;
    resetAllHiding();
    reapplyHidingAll(blockedChannels);
  });

  ensureHideStyles();
  ensureBlockButtonStyles();
  startCardObserver([
    (card) => processCardForHiding(card, blockedChannels),
    (card) => injectBlockButton(card),
  ]);

  startPageRouter();
  startChannelPageWatcher();
  startShorts();
}

void init();
