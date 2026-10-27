# Our List adoption guidance

## Current authority

Our List's current `AGENTS.md`, `DECISIONS.md`, and `PLANNING.md` govern application adoption. The October 25 standards reset (D122) superseded the appearance-preservation approach below: start from published library components and defaults, and remove application appearance overrides unless a later explicit decision approves an exception. Later scoped exceptions, including D126's grocery rows and D128's Manage composition, remain valid; the reset is not a blanket instruction to undo subsequent approvals. Read the current application branch before acting.

Reusable presentation changes belong in the library. Application-owned composition, semantics, and behavior remain with Our List. Library approval does not approve an application migration, and this guide does not authorize deployment or data changes.

For new adoption work:

1. Identify the published package and the current application decisions. Compare rendered results using the built package.
2. Apply documented markup and default appearance, preserving explicitly approved exceptions and application behavior. Discuss any new appearance exception before implementation.
3. Verify the affected layouts, accessible names, keyboard/focus behavior, disabled/pending states, and draft/cancellation safeguards. Preserve the relevant persistence, synchronization, offline, and update checks; distinguish browser evidence from device and screen-reader acceptance.

## Historical 0.4.0 adoption snapshot

The remainder records the earlier review against the commit named below. Its instructions to retain the brand reset, borderless metadata density, compact field styling, always-outlined Delete, or prior dialog placement are historical proposals, not current authority. The component structure and behavioral risks remain useful investigation leads, but must be rechecked against the current application. Do not restore removed overrides solely because this snapshot recommends retaining them.

Plan only: no Our List code, dependency, deployment, or data is changed by this PR. Adopt after Joe approves the library and its package is published. Review application visuals separately; a library approval does not approve every application migration.

Reviewed October 25, 2026 against Our List commit `eeab2859ed35dd6db9d5fa225a91dd6fefaf80f5`: `AGENTS.md`, current planning/decisions, `src/app.css`, and `FilterChip`, `QuickAdd`, `ShortcutInput`, `ItemDetails`, `TagPicker`, `TagManager`, `TagFilters`, `ShoppingScreen`, `SettingsScreen`, and `CollapsibleSection` components. Recheck the current branch before implementation.

### Sequence and acceptance

1. Record current phone/desktop light/dark screenshots and keyboard behavior; upgrade the published dependency in an isolated Our List branch.
2. Migrate one pattern at a time. Change markup and remove only its redundant appearance overrides together; retain application layout, data/state, and recovery safeguards.
3. Verify built-package CSS, not source-catalog panels. Test narrow widths, wrapping, padded clicks without overlaps, disabled states, keyboard focus, actual 200% zoom, and actual screen-reader announcements. Keep pending/composition, offline, update suspension, and cancellation tests.
4. Bring application appearance changes (especially disclosure borders and quick-edit density) to Joe before committing their adoption. Deployment is a separate decision; this document authorizes none.

### Replace shared appearance; keep application behavior

| Area | Candidate removals after equivalent markup and verification | Retain or adapt for application needs |
| --- | --- | --- |
| Header | Repeated `.header-action` display, padding, type, background, and border rules; list-item padding and right-alignment overrides now supplied by library navigation. | `.site-title` H1 reset, app spacing if intentional, conditional Update now, actual destinations, loading/suspension/inert logic. Compare wrapping before removing `.header-actions` layout. |
| Filter chips | `.filter-chip-target` and `.filter-chip-face` appearance, selection, hover, and custom face-focus rules. | `FilterChip.svelte` props, disabled, and `onToggle`, filter semantics, All behavior, result counts, and application list/group spacing. Library focus outlines the generous target; don't retain `outline:none`. |
| Tag chips | Shared `.tag-chip` border/background/type rules where the new markup is adopted; custom X appearance. | Metadata-specific borderless density, photo/tag summaries, wrapping, and contextual grouping. These are deliberately different from interactive filters; don't globally replace every `.tag-chip`. |
| Dialogs | Repeated structured grid reset, header action arrangement, and shared X styling once using `.dialog-header-actions` plus icon attributes; equivalent full dividers/sizing if approved. | Draft models, save/delete/confirm guards, read-only/pending handling, focus lifecycle, suspension, photos/recovery UI, body content layout, and intentional action grouping. Existing 6dvb/88dvb placement is not identical to the library's extra-room option. |
| Clear X | Shared shape, SVG sizing, hover, disabled color once attributes are used. | Field positioning until nested-input structure is deliberately adapted; clear callback, composition safeguards, and focus timing. |
| Hidden state | Redundant display:none rules for ordinary `[hidden]` on shell/dialog/photo/tag-editor elements after testing against 0.4.0. | `hidden`/`inert` bindings, retained draft state, update suspension, dialog close/reopen lifecycle. Hiding is not a substitute for disabling submission or stopping work. |

### Approved chip markup and generous targets

`FilterChip.svelte` already separates a minimum 44×44px button from a compact 28px face. Migrate its native button to `class="chip"` with unchanged `aria-pressed`, `disabled`, and handler, and its child to `class="chip-face"`. Keep the label inside the face. Use `.chip-list` only where its wrapping/list structure matches the application; do not impose list markup on unrelated content.

Removable selections use `.chip.chip-removable`, a text span, and a **separate** named button with `data-barba-variant="icon" data-barba-shape="icon" data-barba-size="compact"`. The X face stays small but reserves a full target slot. Do not shrink targets or extend them over neighbors to preserve previous density. Removal must focus the next enabled removal action, previous one, or a meaningful surviving control. Recheck live updates that remove selections remotely. Informational metadata remains noninteractive.

### Quick add is not a wrapper-class migration

`QuickAdd.svelte` places `ShortcutInput` and `.clear-add-search` inside `.add-name`. `ShortcutInput.svelte` renders a `.shortcut-input` wrapper containing its input, suggestion popup, and status region. The actual input is **not** a direct sibling of the clear button. Adding `.input-action` to `.add-name` would not satisfy the library's direct-child input selector or its grid placement.

Keep the existing `.add-name` positioning and input-end reservation initially, while optionally adopting the X appearance. A later structural adapter could place the action beside the actual input inside `ShortcutInput`, but must deliberately expose the action and preserve combobox ownership, suggestion positioning, accessible name/descriptions, active-descendant behavior, IME composition, shortcut completion, and focus. Do not flatten this component or use `display:contents` merely to fit a CSS selector. Keep the actual clear callback/state update; move focus to the input before a conditionally mounted clear control disappears, accounting for asynchronous completion and update locks.

### Quick edit: compact labels and content layout remain application-owned

`ItemDetails.svelte` uses `.details-field` for both Name and Notes. Its labels are small, weight 400, with tighter input/textarea margins and 44px minimum controls. The library's `.inline-field` is a single-line input pattern with a larger 1.3rem, weight-500 label. It is not an equivalent shared compact textarea-label API.

Retain `.details-field > label` and its control spacing until Joe reviews any replacement. The maintained library editor demonstrates ordinary stacked labels and does not establish a compact field API. Keep `.dialog-body` content gaps, photo/tag summaries, editor visibility, helper placement, and `.details-form-actions`/`.details-action-spacer` grouping. Apply shared text/danger/icon attributes selectively and remove only the matching appearance rules; preserve explicit secondary Cancel emphasis if desired. Confirm Escape, Close, Cancel, and backdrop share cancellation guards, and focus returns sensibly when the originating row is gone.

### Manage's Delete is intentionally always outlined

`TagManager.svelte` and `.tag-management .danger-action` / `.tag-confirmation-dialog .danger-action` use red text, a surface face, and a red border **at rest**, retaining them on hover. Library enabled danger starts transparent and becomes outlined on interaction. Therefore these overrides are not redundant: keep a scoped always-outlined treatment with its intended states unless Joe explicitly changes the Manage design. Preserve separate Aliases/Rename/Delete hierarchy, small action typography, wrapping, merge/rename/delete confirmation, and permission guards.

### Disclosures introduce visible borders

Settings currently uses native details/summary and application spacing, with no enclosing library panel border. Adopting `details.disclosure`, title/description hooks, and `.disclosure-content` adds an enclosing border, a trailing chevron, full-width summary feedback, body padding, and an open-state divider. This is a visible change, not a cleanup-only substitution. Keep the five sections independently expandable and initially closed; preserve lifecycle ownership outside collapsed sections.

`TagFilters.svelte` also has application-specific summary counts and a separate Clear control positioned alongside it. Preserve that control's independence and available width; don't place a button inside summary. `CollapsibleSection.svelte` uses an explicit button and externally controlled expansion/count state for To buy/Completed. It is not automatically a details/disclosure migration. Review each context separately, including heading navigation in actual assistive technology.

### Visually hidden text and filter-result timing are separate changes

Replace equivalent component-local `.sr-only` in `ShortcutInput.svelte` and `.row-announcement` in `ShoppingScreen.svelte` with `.visually-hidden` after the dependency upgrade. Preserve each region's role, atomicity, and distinct purpose. The existing row-move region is already persistently mounted; do not merge unrelated feedback into it casually.

The filter-result status in `ShoppingScreen.svelte` is currently created only while search or category/store filters are active. Replacing its class alone does **not** solve first-announcement reliability. Keep one initially empty `role="status" aria-atomic="true"` region mounted before results change, then update it after the settled filter/search result. Use the application's existing search timing, avoiding every-keystroke chatter, redundant selected-value announcements, and duplicate regions. Preserve the result counts, but don't rewrite an identical string on ordinary rerenders. Decide how clearing filters, equal-count changes, and no results should be communicated; test distinct user operations, not just changed string equality.

Verify actual speech for first activation, rapid changes, no results, clearing, and equal counts with different results. DOM assertions can verify persistent mounting and text updates, but cannot certify announcement order or quality. See the library's [visually hidden guidance](../src/packages/css-lib/README.md#visually-hidden-text), [W3C ARIA22](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22), and [status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).
