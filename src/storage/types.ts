export type BlockedChannel = {
  id: string;
  handle: string;
  name?: string;
  blockedAt: number;
};

export type Settings = {
  hideAllShorts: boolean;
};

export type Counters = {
  hiddenToday: { date: string; count: number };
  hiddenTotal: number;
};

export type ExtensionStorage = {
  blockedChannels: BlockedChannel[];
  settings: Settings;
  counters: Counters;
};
