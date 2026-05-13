import { removeBlockedChannel } from '../storage';

let host: HTMLElement | null = null;
let shadow: ShadowRoot | null = null;
let timeoutId: number | null = null;
let currentUndoHandler: (() => void) | null = null;

const TOAST_MS = 5000;

function ensureRoot(): ShadowRoot {
  if (shadow) return shadow;
  host = document.createElement('div');
  host.id = 'ytdb-toast-host';
  host.style.cssText =
    'position:fixed;bottom:24px;right:24px;z-index:2147483647;all:initial;';
  document.body.appendChild(host);
  shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .toast {
        display: none;
        font-family: Roboto, Arial, sans-serif;
        font-size: 14px;
        background: #1f1f1f;
        color: #fff;
        padding: 10px 6px 10px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.45);
        align-items: center;
        gap: 8px;
        max-width: 360px;
      }
      .toast.visible { display: flex; }
      .msg {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      button {
        background: transparent;
        color: #3ea6ff;
        border: none;
        font-weight: 600;
        font-family: inherit;
        font-size: 14px;
        cursor: pointer;
        padding: 6px 10px;
        border-radius: 4px;
      }
      button:hover { background: rgba(62,166,255,0.12); }
      button:focus-visible { outline: 2px solid #3ea6ff; outline-offset: 1px; }
    </style>
    <div class="toast" role="status" aria-live="polite">
      <span class="msg"></span>
      <button class="undo" type="button">Undo</button>
    </div>
  `;
  return shadow;
}

function dismiss(): void {
  if (!shadow) return;
  const toast = shadow.querySelector('.toast');
  toast?.classList.remove('visible');
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (currentUndoHandler) {
    const undoBtn = shadow.querySelector('.undo');
    undoBtn?.removeEventListener('click', currentUndoHandler);
    currentUndoHandler = null;
  }
}

export function showUndoToast(
  channelName: string,
  ref: { id?: string | null; handle?: string | null; name?: string | null },
): void {
  const root = ensureRoot();
  const toast = root.querySelector('.toast') as HTMLElement;
  const msg = root.querySelector('.msg') as HTMLElement;
  const undoBtn = root.querySelector('.undo') as HTMLButtonElement;

  dismiss();

  msg.textContent = `Blocked ${channelName}`;
  toast.classList.add('visible');

  const handler = () => {
    void removeBlockedChannel(ref).then(dismiss);
  };
  currentUndoHandler = handler;
  undoBtn.addEventListener('click', handler);
  timeoutId = window.setTimeout(dismiss, TOAST_MS);
}
