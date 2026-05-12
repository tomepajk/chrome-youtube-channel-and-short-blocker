# 09 — Options page: search, bulk unblock, JSON export/import

## What to build

A dedicated options page for power management of the blocklist, linked from the popup. The popup stays minimal; this page is where you go when the list grows long or you need to migrate it.

- Options page registered in the manifest via `options_page` (or `options_ui` with `open_in_tab: true`).
- A "Manage all..." link in the popup opens this page via `chrome.runtime.openOptionsPage()`.
- Page contents:
  - Search box that filters the blocklist by handle and display name.
  - Bulk-select checkboxes with "Unblock selected" action and a confirmation step before applying.
  - "Export" button that downloads the current blocklist + settings (`hideAllShorts`, counters) as a JSON file.
  - "Import" file picker that accepts a previously exported JSON file, validates schema, and merges or replaces (user picks via a dialog) into current storage.
- Imports must be schema-validated; reject files that don't match with a clear error message rather than silently corrupting storage.

## Acceptance criteria

- [ ] Clicking "Manage all..." in the popup opens the options page in a new tab.
- [ ] Search filters the list live as the user types.
- [ ] Bulk-select + "Unblock selected" removes all checked entries after a confirm dialog.
- [ ] Export downloads a JSON file containing blocklist + settings.
- [ ] Import accepts a previously exported file and offers merge vs. replace.
- [ ] Invalid import files produce a visible error and do not modify storage.
- [ ] Changes made on the options page propagate to open popups and YouTube tabs without reload.

## Blocked by

- Issue 06
