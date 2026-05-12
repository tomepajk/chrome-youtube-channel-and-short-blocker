import { getBlockedChannels, onBlocklistChange } from '../storage';
import type { BlockedChannel } from '../storage/types';
import { processCardForHiding, reapplyHidingAll, resetAllHiding } from './hide';
import { injectBlockButton, startBlockButtonDelegation } from './block-button';
import { startCardObserver } from './observer';
import { startPageRouter } from './page-router';
import { startChannelPageWatcher } from './channel-page';
import { startShorts } from './shorts';

let blockedChannels: BlockedChannel[] = [];

async function init(): Promise<void> {
  blockedChannels = await getBlockedChannels();

  onBlocklistChange((list) => {
    console.log('[ytdb] 3. onBlocklistChange fired, new list size:', list.length, list);
    blockedChannels = list;
    resetAllHiding();
    reapplyHidingAll(blockedChannels);
  });

  console.log('test');
  startBlockButtonDelegation();
  startCardObserver([
    (card) => processCardForHiding(card, blockedChannels),
    (card) => injectBlockButton(card),
  ]);

  startPageRouter();
  startChannelPageWatcher();
  startShorts();

}

void init();