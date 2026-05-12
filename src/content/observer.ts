import { cardSelector } from './selectors';

export type CardProcessor = (card: HTMLElement) => void;

export function startCardObserver(processors: CardProcessor[]): void {
  function runProcessors(card: HTMLElement) {
    for (const p of processors) p(card);
  }

  function processAll() {
    document
      .querySelectorAll<HTMLElement>(cardSelector)
      .forEach(runProcessors);
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      processAll();
    });
  };

  const observer = new MutationObserver(schedule);

  function begin() {
    observer.observe(document.body, { childList: true, subtree: true });
    processAll();
  }

  if (document.body) begin();
  else document.addEventListener('DOMContentLoaded', begin, { once: true });
}
