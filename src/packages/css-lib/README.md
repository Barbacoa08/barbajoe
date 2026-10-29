# Barbajoe CSS library

One global stylesheet for personal applications. It gives ordinary semantic HTML a consistent foundation for typography, forms, links, dialogs, page layout, and a small set of reusable visual treatments.

## Contents

- [Installation](#installation-and-import) · [0.5.0 changes](#050-category-navigation) · [0.4.5 changes](#045-compact-chips) · [0.4.4 changes](#044-filled-disclosure-edge) · [0.4.3 changes](#043-disclosure-animation) · [0.4.1 changes](#041-disclosure-update) · [0.4.0 adoption](#040-compatibility-and-adoption)
- [API quick reference](#api-quick-reference) · [Application responsibilities](#what-the-library-owns)
- [Shell](#application-shell) · [Header navigation](#header-navigation) · [Tables](#data-tables)
- [Disclosures](#disclosures) · [Accessible names](#accessible-names-and-descriptions) · [Visually hidden text](#visually-hidden-text)
- [Buttons](#buttons-forms-and-dialogs) · [Inline fields](#inline-fields-and-input-actions) · [X actions](#shared-closeclearremove-icon-action) · [Chips](#chips) · [Dialogs](#dialogs)
- [Working editor](#working-editor) · [Tokens and themes](#tokens-and-accessibility-contract)
- [Development](#local-development) · [Browser review](#automated-browser-review) · [Release](#releasing-the-css-package)

## API quick reference

These are styling hooks, not JavaScript components. Read the linked pattern guidance before copying markup. Attributes not listed here retain their native HTML meaning.

| Pattern / public hooks | Required structure and states | Application responsibilities / customization |
| --- | --- | --- |
| `.app-shell`, `.site-header`, `.site-header-brand`, `.site-header-links`, `.skip-link` | Direct `main` in shell; optional direct header/footer. Navigation list with links/buttons; `aria-current="page"` (legacy `.active` supported). Skip link targets main. | Landmarks, meaningful headings/destinations, update actions; retain visible focus and content wrapping. |
| `.site-header-menu` | Sibling native `button[popovertarget]` and named `ul[popover="auto"]` within a `.site-header-links` item; unique target IDs and ordinary links. | Destinations, current-page state, routing, and optional focus-exit handling. Native popovers own toggling and light dismissal; [fallbacks and usage](#category-dropdowns). |
| Native buttons; `data-barba-variant="primary\|secondary\|tertiary\|text"`; `data-barba-intent="danger"` | Explicit native type; `disabled` for unavailable actions. Variants change appearance, not submit/reset behavior. | State, events, confirmation, pending/error feedback. Custom classes may override zero-specificity defaults; supply all interaction states. |
| `data-barba-variant="icon"`, `data-barba-shape="icon"`, optional `data-barba-size="compact"` | Native named button, decorative SVG hidden from AT. Compact is a smaller face within a generous target. | Context-specific name, native disabled/hidden, distinct close/clear/remove behavior and focus transitions. |
| `.inline-field`, `.input-row`, `.input-action` | Visible associated label for `.inline-field`; row contains input or action group then button. See the [compact naming exception](#compact-controls-in-persistent-context) for `.input-row` in persistent context. **Input-action requires the input and icon button as direct children.** Text/search inputs only. | Value/clear visibility, form ownership, validation, focus before hiding; not a generic textarea or nested-component layout. |
| `.chip-list`, `.chip`, `.chip-face`, `.chip-removable` | List of chips; informational span/list item; selectable `button.chip[aria-pressed] > .chip-face`; removable container with label span and separate compact icon button. | Selection/removal, disabled state, stable names, and next/previous/fallback focus. Preserve chip-list gaps and outer hit-area clearance; do not clip targets or make informational/removable labels actionable. |
| `details.disclosure`, `.disclosure--filled`, `.disclosure-label`, `.disclosure-title`, `.disclosure-description`, `.disclosure-content` | Direct summary, label/title and optional description, then content wrapper. Optional `.disclosure--filled` changes appearance; both share native `open` and have no invented disabled state. | Descriptive summary, optional persistence; keep required content visible. Avoid nested interactive summary content. |
| `dialog`, `.dialog-content-container`, `.dialog-header`, `.dialog-header-actions`, `.dialog-body`, `.dialog-footer` | Direct structured form/container; header/body/footer children. Named native dialog. Optional `data-barba-dialog-spacing="compact"`, `-height="content"`, `-room="extra"`, `-dividers="full"` (all prefixed `data-barba-dialog`). | Open/close, validation, cancel guards, initial/restored focus, fallback browser behavior. Standard width is unchanged. |
| `.visually-hidden` | Supplemental noninteractive text; optional empty persistent `role="status" aria-atomic="true"` region. | Naming source, live-region timing, and update ownership; not for focusable elements or essential instructions. Use `.skip-link` for focus-revealed navigation. |
| Native `hidden` | Ordinary hidden values suppress layout and keyboard access, including invalid values. `hidden="until-found"` stays browser-managed. | Remove the attribute / set `hidden=false` to reveal; do not write `hidden="false"`. Hidden is not disabled: form submission and scripts remain active. |
| Semantic HTML defaults; `.helper-text`, `.text-gradient`, `.scaleup-on-hover` | Forms/labels, tables, typography; helper text is scoped to forms. Decorative classes are optional; `.scaleup-on-hover.disabled` suppresses scaling, and legacy `li.disabled > a/span` supplies disabled appearance only. | Associate help via `aria-describedby`; table captions/header relationships and overflow are app-owned. Do not rely on hover/motion/color alone. |

Customize with public `--barba-color-*`, `--barba-font-size-{sm,base,lg,xl}`, `--barba-space-{1,2,3,4,6,8}`, `--barba-radius-{sm,md}`, `--barba-shadow-raised`, `--barba-motion-duration-{fast,base,decorative}`, and `--barba-motion-easing-emphasized`. Private `--_barba-*` and compiler-generated `--lightningcss-*` properties are implementation details. Recheck contrast, target sizes, focus, and reflow after overrides. See [the theme contract](#tokens-and-accessibility-contract).

Ordinary `hidden` deliberately wins over component display styles through one shared rule. It is distinct from `.visually-hidden`, which keeps text available to assistive technology. See [MDN hidden semantics](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden).

## Installation and import

Install the package, then import its stylesheet once from an application entry point. The package-root import is preferred:

```js
import "@barbajoe/css-lib";
```

The explicit stylesheet subpath remains supported:

```js
import "@barbajoe/css-lib/dist/barbajoe.css";
```

Both paths resolve to the same global stylesheet. The repository tracks the source in `lib/`; npm receives only the generated `dist/barbajoe.css` bundle, the package metadata, and this README.

## 0.5.0 category navigation

This minor release adds the opt-in `.site-header-menu` pattern for categorized header navigation. Native HTML popovers provide activation, exclusive opening, outside-click dismissal, and Escape focus return. CSS supplies readable panels, current-page indicators, anchor positioning, and usable fallbacks. Existing flat header links and buttons remain supported. Skip-link positioning now respects right-to-left text direction.

The documentation uses the new pattern across focused topic pages. See [category dropdowns](#category-dropdowns) for reusable markup, browser compatibility, and application responsibilities. The package remains CSS-only; the documentation's optional focus-exit script is not shipped.

Merging this version increase prepares the staged npm release. Version 0.5.0 becomes installable only after maintainer approval with npm 2FA.

## 0.4.5 compact chips

Informational, selectable, and removable chips now share 28px short faces and 8px visible gaps at a 16px root. The X sits closer to its label. Transparent extensions provide at least 36×36px chip targets in the default layout without changing faces or wrapping. This deliberately meets the size requirement of WCAG 2.2 SC 2.5.8 (AA), not the 44×44px requirement of SC 2.5.5 (AAA); it is not a claim of full-page conformance.

Existing chip markup remains valid. This supersedes 0.4.0's chip-specific 44px layout reservation: review consumers that override chip spacing, position controls beside chips, or clip overflowing content. Keep the documented [chip clearance](#chips), including space outside the list. Standalone compact icon buttons and ordinary close/clear actions retain their previous targets. Selection, removal, focus management, and persistence remain application-owned. There is no mouse/touch differentiation.

The specimen includes few/many chips in both themes and an inspection toggle for the actual extended targets. Merging the patch increase stages the package; npm publication still requires maintainer approval with 2FA.

## 0.4.4 filled disclosure edge

Filled disclosure bodies now have no inline-end padding, allowing child backgrounds to reach the header’s trailing edge. Block/start padding, header spacing, and the accent border are preserved. The rule mirrors in right-to-left content. Add padding inside child rows when their text needs an inset; see the [shaded shopping-list example](https://lib-staging.barbajoe.tech/disclosures.html#edge-content). Version 0.4.3’s disclosure animation is retained.

## 0.4.3 disclosure animation

Existing `details.disclosure` panels, including the filled style, now animate opening and closing by default in browsers that support all required CSS features and when reduced motion is not requested. Other browsers retain instant native behavior. No markup migration or JavaScript is required; unclassed `details` stays native. Version 0.4.2's title-spacing correction is retained.

The default duration is `--barba-motion-duration-base` (300ms). Set that token to `0s` on an individual disclosure when it should remain instant. If customizing the animation itself, keep the closing guard and content transition durations synchronized. Controls stop accepting input during closing, and closed text becomes available to browser search when the transition finishes. Native Find can then reveal the matching panel. See [disclosure animation and review](#disclosure-animation-and-review) for safeguards, comparison controls, and verification limits.

Merging this version increase prepares the staged npm release; maintainer approval with 2FA remains separate.

## 0.4.1 disclosure update

This patch extends the opt-in disclosure pattern with `.disclosure--filled` and corrects shared indicator alignment. Existing disclosure markup remains valid. Both variants now use a trailing chevron pointing inward when collapsed (left in left-to-right content, right in right-to-left content), and down when expanded. The visible chevron aligns with the title’s first line, including when supporting text wraps. Existing bordered panels therefore receive an intentional icon direction/alignment change; unclassed details keep native styling.

The filled variant adds a surface-colored header and a separated accent body border. Filter composition, including the inset clear action, stays application-owned. The [working filter example](https://lib-staging.barbajoe.tech/disclosures.html#filled-disclosures-heading) and [state gallery](https://lib-staging.barbajoe.tech/disclosures.html) show the approved combinations. No chip, form, dialog, or theme APIs change. Merging this version increase stages the package; npm approval remains a separate maintainer action.

## 0.4.0 compatibility and adoption

This minor release adds the reviewed navigation, button, dialog, inline-form, chip, disclosure, and visually hidden patterns. The catalog contains working examples and implementation guidance for each. The npm package remains CSS-only; applications own state, validation, focus transitions, announcements, and persistence.

- **Header navigation changes by default:** padding now belongs to each link or action, so its whole padded area is clickable. Navigation wraps according to content and remains aligned to the inline end. Both `aria-current="page"` and the existing `.active` convention receive the active underline. Review headers with application-specific spacing overrides.
- **Button specificity changes by default:** low-specificity defaults let a consumer class control appearance and interaction states. Existing application overrides may now win where library styles previously masked them; inspect those overrides during adoption. Explicitly use `type="button"` for non-submit actions. Text, danger, and icon treatments are optional.
- **Forms and dialogs retain their base layouts:** inline-field/input-action classes and dialog sizing/divider options are opt-in. The dialog’s standard width is retained. Existing stacked fields keep their original label treatment. The opt-in inline label uses weight 500.
- **Use the shared X intentionally:** `data-barba-variant="icon"` selects background-only feedback with a 2px inset. Close, clear, and chip removal retain generous targets; the compact size reduces the visible X face rather than its target. Existing text-style icon buttons retain their treatment until their variant changes. Close, clear, remove, and destructive deletion still have distinct semantics and application behavior.
- **Chips, disclosures, and visually hidden text are opt-in:** adopt the documented markup and remove equivalent application styling only after verifying the replacement. Do not remove status semantics or assume CSS supplies interaction logic. Interactive chips reserve targets at least 44×44px around compact faces. Selectable buttons require a child `.chip-face`; informational chips remain noninteractive.

No cascade layers, broad form-layout migration, JavaScript widget framework, popover, or spinner is introduced. Further changes to legacy header/form specificity and disabled-style ownership remain separate compatibility work.

The PR’s Netlify Deploy Preview is the review environment. Merging the approved version increase stages the package through the existing release workflow; installation of `0.4.0` becomes possible only after npm approval with 2FA. The workflow and publishing security settings are unchanged.

## What the library owns

Start with semantic HTML and the single stylesheet. The library supplies global defaults for ordinary elements such as links, form controls, buttons, and dialogs. Use its documented classes for roles that HTML alone cannot identify, such as an application shell or a structured dialog, and for optional visual treatments.

Application CSS owns content- and project-specific choices. Override or extend the defaults with the public `--barba-` tokens and your own selectors. In particular, each application decides how wide data tables adapt to limited space, how images are sized or cropped, and when its content wraps or shortens. The library ships no image styling or general-purpose responsive table transformation.

The [hosted specimen](https://lib-staging.barbajoe.tech/) shows the maintained defaults in context. The specimen is not part of the npm package.

## Application shell

Add `app-shell` to the element that owns the page regions. A direct `main` is required. Direct `header` and `footer` regions are independently optional, so the supported structures are:

```html
<!-- Full shell -->
<div class="app-shell">
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</div>

<!-- Header and main -->
<div class="app-shell">
  <header>...</header>
  <main>...</main>
</div>

<!-- Main and footer -->
<div class="app-shell">
  <main>...</main>
  <footer>...</footer>
</div>

<!-- Main only -->
<div class="app-shell">
  <main>...</main>
</div>
```

See the [full shell](https://lib-staging.barbajoe.tech/), [header-and-main shell](https://lib-staging.barbajoe.tech/layout-header.html), [main-and-footer shell](https://lib-staging.barbajoe.tech/layout-footer.html), and [main-only shell](https://lib-staging.barbajoe.tech/layout-minimal.html) specimens.

A `site-header` supports a brand or title with navigation, a brand or title alone, or navigation alone. All three compositions appear in the [header specimen](https://lib-staging.barbajoe.tech/headers.html#combined-header).

Classes remain appropriate for roles that semantic HTML cannot express by itself, including `site-header`, `text-gradient`, `scaleup-on-hover`, and `dialog-content-container`.

## Header navigation

Use `site-header` on a header, `site-header-links` on its navigation list, and optionally `site-header-brand` on its direct brand/title child:

```html
<header class="site-header">
  <a class="site-header-brand" href="/">Our List</a>
  <nav aria-label="Main">
    <ul class="site-header-links">
      <li><a href="/manage/" aria-current="page">Manage</a></li>
      <li><button type="button">Update now</button></li>
      <li><a href="/settings/">Help &amp; settings</a></li>
    </ul>
  </nav>
</header>
```

Brand and navigation share a row whenever their content fits. Navigation moves to the inline end (right in left-to-right layouts), including when it wraps or is the header's only child. Long navigation labels can wrap within their targets. There is no viewport breakpoint that forces a second row.

Direct links and buttons in the list share the same transparent navigation treatment, with padding on the interactive element and targets at least 44 CSS pixels wide and high. Header navigation overrides ordinary button emphasis; use `type="button"` for an action. Applications supply that action's behavior. Current-page links use `aria-current="page"`; existing `li.active > a` markup also keeps its underline. Hover, active and keyboard focus retain feedback, and the global keyboard focus ring remains visible. Native `disabled` buttons stay disabled. For disabled links, `aria-disabled` still requires application prevention of activation as described below.

The optional `site-header-brand` class preserves one brand appearance on an anchor, strong text or a heading. It does not require an `h1` in the header or change the element's semantics. Choose headings according to the page hierarchy, and give links meaningful destinations. Use public `--barba-` tokens and application styles to customize the header; example JavaScript in the [header specimen](https://lib-staging.barbajoe.tech/headers.html) is not shipped in the package.

**0.4.0 header compatibility:** Existing header markup and `.active` remain supported. Navigation that previously occupied a new row below 40rem can now stay beside the brand; navigation-only headers now align to the inline end. Padding and the underline move from the list item to its direct interactive element, and direct navigation buttons now match links. Consumers with list-item padding/border overrides should remove or move those overrides to the link/button to avoid double spacing. The brand class is opt-in; existing unclassed brand elements keep their typography.

Accessibility: use meaningful navigation landmarks and current-page semantics; distinguish multiple navigation regions by name. See [APG navigation-landmark guidance](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html).

### Category dropdowns

The documentation header demonstrates the opt-in `.site-header-menu` pattern. Put a native `button[popovertarget]` and its named `ul.site-header-menu[popover="auto"]` together in a `.site-header-links` list item. Every menu needs a unique ID matching its button's target. Use `aria-current="page"` only on the destination link; its category receives an underline automatically.

```html
<header class="site-header">
  <a class="site-header-brand" href="./index.html">Barbajoe CSS</a>
  <nav aria-label="Main">
    <ul class="site-header-links">
      <li>
        <button type="button" popovertarget="guide-pages">Guides</button>
        <ul class="site-header-menu" id="guide-pages" popover="auto" aria-label="Guides">
          <li><a href="./getting-started.html">Getting started</a></li>
          <li><a href="./headers.html" aria-current="page">Layout and navigation</a></li>
        </ul>
      </li>
    </ul>
  </nav>
</header>
```

These are ordinary navigation lists and links, not ARIA `menu`/`menuitem` widgets. Do not add `aria-haspopup="menu"`. Native popover targeting supplies the expanded relationship; do not maintain a second, potentially stale `aria-expanded` attribute. Tab and Shift+Tab follow ordinary controls and links; Enter/Space toggles the button. Auto popovers allow one sibling menu at a time, close on outside activation or Escape, and restore keyboard focus to the invoking button on Escape. Opening does not move focus into the panel or trap it. Use a native disabled button for an unavailable category, or omit unavailable destinations.

**Progressive enhancement:** popovers work without site JavaScript in supporting browsers. CSS anchor positioning places the panel below its button, flips it inward near an edge, and falls back to a viewport-aligned panel when space is limited. Panels scroll on short screens. Without anchor positioning, the panel is centered in the viewport. Without native popover support, category buttons are hidden and ordinary lists stay visible. Keep the documented list/trigger structure and avoid overriding the native closed display state. Public color, spacing, radius, and shadow tokens remain the customization points; `--_barba-header-*` position-try names are private.

Support checked on October 28, 2026: [native popover](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover) supplies light dismissal and exclusivity; [CSS position-area](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-area) is Baseline 2026 and needs a fallback for older browsers. The [APG disclosure navigation guidance](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) explains ordinary site-navigation semantics. Recheck keyboard behavior, overflow, themes, and assistive technology in each consumer.

**Application ownership:** the CSS package ships no navigation script. The documentation site's `specimen/navigation.js` additionally closes a menu when focus moves outside its list item; consumers wanting that behavior must implement it without stealing focus. Supply meaningful destinations, unique IDs, current-page state, and any routing behavior. No nested menu or arrow-key widget behavior is implied. This pattern is additive; existing flat header links and action buttons retain their behavior. It is introduced in 0.5.0; the deploy preview is available before npm publication.

## Data tables

Use a semantic `<table>` for tabular data, with a `<caption>` and `<th scope="col">` or `<th scope="row">` where appropriate. The library gives these elements collapsed borders, start-aligned captions and headings, modest cell spacing, and row dividers from the existing palette. No table class is required. See [MDN's table guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table) and the [compact and wide specimens](https://lib-staging.barbajoe.tech/foundations.html#tables-heading).

The library does not set table width, scrolling, stripes, sticky headings, sorting, or narrow-screen column behavior. Each application chooses how its data fits available space. The wide specimen's scroll container demonstrates one application choice; it is not part of the shipped CSS.

## Disclosures

Use `details.disclosure` for the bordered disclosure panel. Its full-width summary has a trailing chevron, a minimum 2.75rem target height (44px at a 16px root size), hover/press feedback, and the library’s keyboard focus outline. Opening adds a divider between summary and body. See the [light and dark catalog examples](https://lib-staging.barbajoe.tech/disclosures.html#disclosures-heading) for settings, supporting summaries, nested help, and long labels.


| Style | When to use it | Why |
| --- | --- | --- |
| Bordered: `.disclosure` | Self-contained settings, help, or supporting information. | The enclosing border groups header and body. |
| Filled: `.disclosure.disclosure--filled` | Filters or compact controls whose state matters while collapsed. | A filled header emphasizes the summary; an accent left border connects expanded content. |

These are recommendations, not restrictions. Both variants use the same markup and native behavior. Both variants use the same inward/downward chevron, aligned with the title’s first line. The filled variant adds a 3px border in `--barba-color-link` and a `--barba-space-2` gap above its body. It has no enclosing border or open-header divider. The indicator is decorative; native summary semantics convey expansion.

**Bordered markup:**
```html
<details class="disclosure" open>
  <summary>
    <span class="disclosure-label">
      <span class="disclosure-title">Shopping filters</span>
      <span class="disclosure-description">All stores · All categories</span>
    </span>
  </summary>
  <div class="disclosure-content">
    <p>Settings, controls, and links go here.</p>
  </div>
</details>
```

**Filled markup:** add the modifier to the same structure. The description is stacked by default; inline summary layout is an application choice.

```html
<details class="disclosure disclosure--filled" open>
  <summary>
    <span class="disclosure-label">
      <span class="disclosure-title">Filters</span>
      <span class="disclosure-description">All items</span>
    </span>
  </summary>
  <div class="disclosure-content">
    <!-- Filter controls belong here. -->
  </div>
</details>
```

The [working filter example](https://lib-staging.barbajoe.tech/disclosures.html#filled-disclosures-heading) shows selectable stores and categories in both themes. Its compact chip faces and generous targets use the existing [chip API](#chips). The [disclosure state gallery](https://lib-staging.barbajoe.tech/disclosures.html) adds six ready-to-inspect combinations: no selections, short selections, and many selections, each collapsed and expanded. It includes matching bordered examples, reset, and a narrow-panel control. The catalog covers basic title-only, supporting-description, long-title, and nested-help markup; use these representative cases instead of copying every combination into an application.

| Composition | Required additions | Behavior to preserve |
| --- | --- | --- |
| Title only, either style | `.disclosure-label.disclosure-title` on one element | Native keyboard/pointer toggle and visible focus. |
| Title with supporting text, either style | Title and description within `.disclosure-label` | Wrap text; keep the chevron beside the first title line. |
| Filled filters without selections | Chip groups and application-maintained summary | “All items”; no clear action in layout or tab order. |
| Filled filters with selections | Named sibling clear button and reserved header space | Join selected labels with dots; wrap the whole summary beneath the title when needed; keep Clear and chevron at the top. |


**Application responsibilities for filters:**

- Update the visible summary in both states: “All items” when neither group is restricted, otherwise selected labels joined with middle dots in stable group order. Let the whole summary move below the title when it no longer fits; avoid redundant category prefixes. Preserve selections when closing.
- “All stores” and “All categories” reset only their own group. Reflect individual selection with `aria-pressed`; an unrestricted group selects its “All” control.
- Put the named clear button outside `summary` in the DOM, even when it appears inside the filled header. The example makes it a sibling of `details`, positioned before the chevron in a reserved slot. It must not cover the title or chevron, and clicking its padded area must clear without toggling. Align it with the first title line, not the entire wrapped header. Move focus to summary before hiding Clear, and preserve expansion.
- Keep DOM and keyboard behavior understandable: in this native composition, Clear follows the body controls when expanded and follows summary directly when collapsed. Do not nest a button in summary or use positive `tabindex` to reorder it. If an application needs a different focus order, design and verify that composition explicitly.
- Own filtering, persistence, and any result announcements. This control-only example does not add a live message duplicating pressed-state feedback. For actual result updates, follow the [persistent status-region guidance](#visually-hidden-text), including timing and verification limits.

The catalog's `specimen-filter-*` classes provide application layout for inline/wrapping text, field groups, and sibling clear placement. They are **not public library hooks**. The shared `disclosure-filters.js` implements synthetic selection/reset behavior for both pages; no JavaScript ships in the package. The shared accessibility guidance below applies to both styles.

- `.disclosure-label` fills the available summary width and wraps long text without crowding the indicator. For a simple label, put both label and title classes on one element.
- `.disclosure-title` uses medium weight 500 and normalizes heading margins, size, and borders. A heading at the correct page level may replace the title span, for example `<h2 class="disclosure-label disclosure-title">Preferences</h2>`. The class changes appearance, not semantics. Some browser/assistive-technology combinations expose summary descendants as part of the toggle rather than separate headings; verify your target combinations, or place a section heading outside the disclosure when independent heading navigation is important. See [MDN’s summary heading guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary#summaries_as_headings).
- `.disclosure-description` provides optional muted supporting text below the title. The application keeps selection/status summaries up to date.
- `.disclosure-content` pads the body and removes its first/last child’s outer block margins. The filled variant preserves block and inline-start padding but has no inline-end padding, so child backgrounds can reach the header’s trailing edge (right in left-to-right content, left in right-to-left content). Its header and the bordered variant keep their padding. Applications own spacing between panels, internal content layouts, and wide tables/media; long text wraps. Add padding within child rows when their text needs breathing room. See the [shaded shopping-list example](https://lib-staging.barbajoe.tech/disclosures.html#edge-content); its row colors and layout are specimen-only styles. Nested disclosures use the same markup, but avoid unnecessary nesting.

Keep the summary’s wording descriptive. Place links and inputs in the body. Any extra header action must be outside summary in the DOM with its own hit area, clear name, and visible focus. Reserve space so it does not cover summary text or the chevron, as in the filter example. Use disclosures when users can choose which optional information or settings to reveal; keep required instructions and critical status visible. Native `details`/`summary` provides pointer and keyboard operation and expanded-state semantics. Do not add `role="button"`, `tabindex`, or duplicate `aria-expanded` state. Add `open` for initial expansion. Omit `name` for independently expandable sections, as in the catalog; the library does not force an exclusive accordion or persist state. Expansion animation is a guarded progressive enhancement; see the [motion guidance](#disclosure-animation-and-review). Applications own persistence and any enclosed controls’ behavior. No JavaScript ships with this treatment.

**Compatibility and customization:** This is opt-in; unclassed disclosures retain native styling. Use existing `--barba-` color, spacing, and radius tokens or scoped application selectors. Existing app-specific summary spacing, heading borders, or icons should be removed when adopting these classes to avoid duplicate decoration. The disclosure styling does not supply a disabled state; choose static content instead when expansion is unavailable.

## Accessible names and descriptions

An accessible name identifies a control; a description supplies instructions or errors, and a live region reports a result. These serve different purposes. The library supplies styling and HTML patterns; applications own the behavior and timing.

Use these defaults consistently:

1. **Prefer native visible labels for ordinary form controls.** Associate a `<label>` with its control using matching `for` and `id` values, or wrap the control in the label. Visible labels remain useful after entry and provide a larger clickable area. Keep ordinary buttons named by their visible text.
2. **Reuse suitable visible text.** When existing visible text already identifies a control and the relationship is clear, `aria-labelledby` can reference its ID. Prefer a native label when one fits; do not use a generic section heading as the name of several controls with different purposes.
3. **Use concise `aria-label` names for icon-only buttons and the limited compact-control exception below.** This is a library authoring convention, not a claim that ARIA is more accessible than valid hidden labels. Compact controls qualify only when persistent surrounding content makes each control's purpose visually clear, including after entry or selection. A title alone is not sufficient when the controls remain ambiguous. Otherwise, retain visible labels.
4. **Keep visible identifying wording in the accessible name, preferably at its beginning.** For example, visible “Create” can have the name “Create category”. When a placeholder is the visible identifying text, preserve that wording too, such as “Category name”. Do not rely on placeholders alone: they disappear during entry. A select's accessible name identifies its purpose; its selected option is a separate value, so do not rewrite the name to repeat each selection.
5. **Choose a deliberate naming source.** `aria-labelledby` takes precedence over `aria-label`, and ARIA naming can override a native label or a button's descendant text. Avoid redundant or competing names. Keep names synchronized with visible wording and translations; do not add ARIA when native text already supplies the intended name.

Use `aria-describedby` to associate useful instructions and errors with a control; it does not replace the name. Keep necessary instructions and errors visible, and use an optional help disclosure for additional detail. Preserve existing error associations and application validation. Avoid repetitive explanations of native dropdown operation.

For images, use appropriate `alt` text; use `alt=""` for decorative images when the surrounding control already has a name. An `alt` attribute on an ordinary text input, select, or button does not label it. Image submit controls (`input type="image"`) use `alt`, and an image's alternative text can contribute to a containing button or link's name. For the library's icon buttons, hide decorative SVGs with `aria-hidden="true" focusable="false"` and name the button itself.

Follow [W3C's form-label guidance](https://www.w3.org/WAI/tutorials/forms/labels/), [APG naming techniques and precedence](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/), and [Label in Name guidance](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html). Existing valid hidden-label implementations do not require automatic migration.

### Compact controls in persistent context

This limited exception keeps a compact editor's appearance while naming its controls explicitly. The disclosure title and visible instruction together identify the actions even after the placeholder or initial “Quick add” option disappears. Retain ordinary visible-label examples as the default; do not remove their labels just to copy this pattern. See the [forms guidance and copyable example](https://lib-staging.barbajoe.tech/forms.html#compact-controls).

```html
<details class="disclosure" open>
  <summary>
    <span class="disclosure-label disclosure-title">Categories</span>
  </summary>
  <div class="disclosure-content">
    <p id="category-help">Quick add an existing category, or enter a category
      name and choose Create.</p>
    <select aria-label="Quick add an existing category"
      aria-describedby="category-help">
      <option value="">Quick add</option>
      <option value="produce">Produce</option>
      <option value="frozen" disabled>Frozen — selected</option>
    </select>
    <div class="input-row">
      <input id="new-category" type="text" aria-label="Category name"
        placeholder="Category name" aria-describedby="category-help">
      <button type="button" aria-label="Create category">Create</button>
    </div>
  </div>
</details>
```

This is a markup example, not a working editor. It uses `.input-row` for the input/action layout; `.inline-field` remains the documented visible-label wrapper. Use unique IDs for each editor instance. For a Stores editor, update the persistent context, names, placeholder, and references together.

Application code owns dropdown selection/reset, disabled choices, Create/Enter behavior, validation, focus, and announcement timing. `type="button"` does not submit or implement Enter-to-create; choose form ownership and handlers to fit the application. The CSS package supplies none of that logic. Keep useful draft/Save instructions available in the application's help, and keep instructions needed to identify or operate these controls visible.

Changing a control's `aria-label` is not a substitute for a live-region announcement. Prefer an existing visible status message when suitable; otherwise use one persistent, initially empty status region, mounted before its text changes. Avoid duplicate announcements. See [visually hidden text](#visually-hidden-text) for the supported status markup and [W3C status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

## Visually hidden text

Use `.visually-hidden` on supplemental, noninteractive text to remove it from visual layout while retaining it for assistive technology. It is opt-in, has no JavaScript, and does not itself supply an accessible name, live-region semantics, or focus behavior. See the [working light/dark examples and implementation guidance](https://lib-staging.barbajoe.tech/accessibility.html#visually-hidden-heading), including per-pattern requirements, primary references, and verification steps.

```html
<!-- The visible label remains at the start of the complete name. -->
<button type="button">Edit<span class="visually-hidden"> Apples</span></button>

<!-- Present before an application adds a result message; do not focus it. -->
<p class="visually-hidden" role="status" aria-atomic="true"></p>

<!-- Supported alternative; prefer aria-label for new icon-only examples. -->
<button type="button" data-barba-variant="icon" data-barba-shape="icon">
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" />
  </svg>
  <span class="visually-hidden">Clear item name</span>
</button>
```

- Keep essential information visible. Apply this utility only to the supplemental text, never a focusable control or its container. Do not combine it with `hidden`, `display:none`, `visibility:hidden`, `aria-hidden="true"`, or `inert` on text intended to remain accessible or its ancestors. Continue using `.skip-link` for links that must become visible on focus; `.visually-hidden` does not reveal itself.
- Keep the visible action wording in its accessible name, preferably at the beginning. Choose one naming source: `aria-label`/`aria-labelledby` can override descendant text. Do not layer them over these hidden labels. Prefer visible associated labels on inputs, with only the [documented compact exception](#compact-controls-in-persistent-context); hide decorative SVGs from assistive technology. Read [W3C label-in-name guidance](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) and [APG naming guidance](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/).
- Prefer making an existing visible result message a status region when it contains the full message. Otherwise mount one initially empty hidden region before updating it. Use `role="status" aria-atomic="true"`; keep ordinary updates polite, concise, and result-focused. Avoid duplicate live regions, repeating the native control’s selected value, or live announcements of entire lists. See [W3C ARIA22](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22), and [status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).
- Applications own update timing and focus. The catalog’s Edit feedback is a demonstration, not a second announcement to copy into a focused editor. Clear uses the documented input-action behavior: update application state, return focus before hiding, and synchronize visibility. Setting `input.value` alone does not fire an input event; use the consuming application’s normal update path. See [MDN input events](https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event).

**Verification:** Inspect accessible names and live-region ownership; test keyboard operation, clear focus/empty-state behavior, narrow layouts, zoom, and actual announcements with supported browser/screen-reader combinations. DOM tests do not establish speech output. Check settled and rapid results, no results, and equal-count changes in consuming applications. Avoid rewriting unchanged messages on rerenders, but assess feedback for distinct operations separately.

**Migration:** Replace equivalent local hiding styles only after adopting the library release. Preserve semantics and application behavior; separately review status-region mounting and duplicate announcements. A CSS replacement does not correct timing. Existing correctly named controls, including hidden labels and `aria-label` icon buttons, need no automatic migration. Changing a control name is not a live announcement.

## Buttons, forms, and dialogs

Native `button` and button-type `input` elements are styled automatically: `submit` is primary, `button` is secondary, and `reset` is tertiary. A button without a type receives primary styling to match its usual form-submit behavior; write `type="button"` for a non-submit action. Override emphasis independently of behavior with `data-barba-variant="primary"`, `"secondary"`, `"tertiary"`, or `"text"`. These attributes affect appearance only.

Use `data-barba-variant="text"` for a quiet action: link-colored text on a transparent face, with the same padded target as an ordinary button. Hover, press and keyboard focus reveal the control background and a visible link-hover border. Disabled text actions retain their transparent face without hover feedback.

Use `data-barba-intent="danger"` for a destructive action. It starts as danger-colored text with a transparent face and border. Hover, press and keyboard focus reveal a surface-colored face and danger-colored border. Disabled danger actions keep that outlined appearance at the existing disabled opacity. Intent overrides the ordinary emphasis appearance, including when a variant is also present, and never changes native button behavior. Use a clear action label; color alone does not explain destruction. Applications own confirmation and deletion.

```html
<button type="button" data-barba-variant="text">Edit</button>
<button type="button" data-barba-intent="danger">Delete</button>
<button type="button" data-barba-intent="danger" disabled>Delete</button>
```

**Customization and compatibility:** Button defaults and their state rules use `:where()` to have zero specificity, including disabled appearance. A simple application class wins for the properties it sets, even when loaded before the library and while the button is hovered, pressed or keyboard-focused. Supply the desired interaction states for a custom appearance; overriding the background and border does not invent new hover feedback. Existing application selectors may now take precedence where the old library selectors won, so review consumer overrides when upgrading. Native primary/secondary/tertiary appearances remain the same, and the independent global focus outline stays visible unless an application explicitly overrides it. Other component rules, such as header navigation, still apply in their own contexts. Input-based button controls follow the same rules; text-field state styles remain unchanged.

```css
.my-action {
  background-color: transparent;
  border-color: transparent;
  color: var(--barba-color-link);
}
.my-action:enabled:is(:hover, :active) {
  background-color: var(--barba-color-control-bg);
  border-color: var(--barba-color-link-hover);
}
```

Button treatments use the existing palette. Primary hover uses link-hover in light mode and inverse-surface (light gray) in dark mode. Secondary hover uses surface; tertiary hover uses control background. Primary/secondary/tertiary text colors do not change on hover. Disabled controls retain their emphasis with reduced opacity and no hover treatment. The global keyboard focus ring applies to controls inside and outside forms.

Text inputs (including omitted `type`), textarea, and select receive the same appearance regardless of form ancestry or the `form` attribute. Full-width sizing and additional top spacing remain specific to controls inside forms. Forms retain their stacked layout. Page-footer margin/alignment apply only to `.app-shell > footer`, not article or dialog footers.

Input and textarea placeholders use the existing muted-text color and italics at full opacity, making examples distinct from entered values without introducing another color. Prefer a visible associated label for each ordinary form control; placeholder text disappears as the user types and is not a substitute. Only use the [compact-control exception](#compact-controls-in-persistent-context) when persistent visible context identifies each control. Compare both schemes in the [form specimen](https://lib-staging.barbajoe.tech/forms.html#forms-heading).

### Inline fields and input actions

Use these opt-in classes for single-line text or search inputs. Existing stacked forms and label weights are unchanged without the classes. See the [working catalog examples](https://lib-staging.barbajoe.tech/forms.html#inline-forms-heading).

- `.inline-field`: wrap a visible, explicitly associated label and its control row. A direct-child label uses the standard 1.3rem size with medium weight 500. Place hints outside the label and associate them with `aria-describedby` when needed.
- `.input-row`: wrap the input (or input-action group) and its Add/submit button. They share a minimum 2.75rem height. The field grows from a 14rem preferred width, and the action wraps to the inline end when space runs out. Keep input before Add in DOM order; don't reverse keyboard order with CSS.
- `.input-action`: group one text/search input and its clear icon button. The group reserves space for the icon even when hidden, so text cannot run beneath it and the field does not resize. It can be used inside a row or alone. This is a single-icon layout, not a container for arbitrary action text or multiple icons.

The pattern works inside a form, outside a form, and with a separate form owner. For the last case, add the same `form="entry-form"` attribute to both the input and submit button; the label still points to the input's ID. The classes don't establish form ownership. Keep this pattern's label visible; a placeholder is not a label. The separate [compact example](#compact-controls-in-persistent-context) uses `.input-row` in persistent context without changing `.inline-field`'s visible-label convention. Other control types retain their normal treatment.

```html
<form id="entry-form">
  <div class="inline-field">
    <label for="item-name">Item name</label>
    <div class="input-row">
      <div class="input-action">
        <input id="item-name" name="item" type="text" required>
        <button type="button" data-barba-variant="icon" data-barba-shape="icon"
          aria-label="Clear item name" title="Clear item name"
          aria-controls="item-name" hidden>
          <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24">
            <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>
      </div>
      <button type="submit">Add</button>
    </div>
  </div>
</form>
```

**Application behavior:** CSS only handles layout and the `hidden` state. Show the X only while `input.value.length > 0`; disable it if the field is disabled or read-only. Initialize that state on render, update it on input/change, after form reset, and whenever application code changes the value or editable state. Native reset completes after the reset event; synchronize after its default action. On clear, empty the value, return focus to the input **before** hiding/disabling the X, update application state and notify any dependent logic. Do not submit the form, reset unrelated fields, or delete persisted data. The specimen provides local example behavior in `specimen.js`; no JavaScript ships in the CSS package. The embedded pattern suppresses WebKit's native search-cancel decoration to avoid duplicate clear controls, so applications must supply the documented working X.

### Shared close/clear/remove icon action

The X shown above is the standard close/clear/remove icon in the examples. Use a native `button` with `data-barba-variant="icon"` and `data-barba-shape="icon"`. The variant supplies a transparent resting face and a circular background on hover/press; the icon color stays unchanged and no visible border appears. A 2 CSS pixel transparent inset keeps the background clear of surrounding input/chip edges. Keyboard focus uses the separate global outline. Disabled icon actions use `--barba-color-text-muted` instead of the enabled action color, retain the existing disabled opacity, and do not react to hover. Use the native `disabled` attribute; color alone does not disable an action.

The shape supplies a 2.75rem square target and a 1.25rem SVG (44px/20px at a 16px root). Outside removable chips, `data-barba-size="compact"` keeps a target of `max(44px, 2.75rem)` while reducing the visible face to 1.5rem and the SVG to 1rem (24px/16px). Inside `.chip-removable`, the documented compact icon button instead occupies `max(28px, 1.75rem)` and extends its clickable area into the chip-list gaps (36×36px at the default 16px root). Its hover background stays inset 2px inside the 24px compact face; the extra hit area is transparent. Close and clear retain their standard face. Sizes scale with root text; the inset remains 2px. `hidden` removes an empty field's clear action from layout and keyboard navigation.

This is opt-in: existing `data-barba-variant="text"` icon buttons retain their text-button appearance. Change the variant to `icon` for the new convention. Ordinary text actions and danger treatments are unchanged. Do not use this quiet X convention for deleting saved data; use a named danger action.

Give each button a context-specific accessible name: **“Clear item name”** for a field, **“Close dialog”** for a modal, or **“Remove Produce”** for a chip selection. Prefer a concise `aria-label` for new icon-only examples; a `.visually-hidden` text label remains a supported alternative and needs no automatic migration. Use one naming source. The SVG has `aria-hidden="true" focusable="false"`; the optional `title` provides an extra pointer hint and does not replace an accessible name. Keep visible button wording within the name when present; see [accessible naming guidance](#accessible-names-and-descriptions). The shared icon communicates a visual convention, not shared behavior: clear empties one field, while dialog close uses the same cancellation/request-close path as Cancel and Escape, including application cancellation guards. Use a separately labeled danger action for deletion. Avoid unlabeled X glyphs, clickable spans, or `type="reset"` as a field-clear shortcut.

### Chips

See the [working light/dark catalog examples](https://lib-staging.barbajoe.tech/chips.html#chips-heading), including few/many chips and the target-boundary inspection toggle. All three types share a short face height of `max(28px, 1.75rem)` (28px at a 16px root) and `.chip-list` supplies an 8px-equivalent gap through `--barba-space-2`. Long labels wrap and grow; never fix their height. Use:

- Informational: a noninteractive `span` or list item with `.chip`; no keyboard stop or actionable area.
- Selectable: a native `button type="button"` with `.chip` and `aria-pressed="true|false"`, containing one `span.chip-face`. Keep its name stable while toggling, and use native `disabled` when unavailable. The button's transparent `::after` extends half the list gap on each side, making default targets at least 36px in both dimensions. A thicker face border indicates selection; the global keyboard outline stays around the visible button.
- Removable: `.chip.chip-removable` containing a label span and a separate named icon button with `data-barba-shape="icon"` and `data-barba-size="compact"`. Only the button removes the selection. Its transparent `::after` extends half the gap above and below, and the full gap toward inline end (right in LTR, left in RTL). It never extends over its own label. At the default root and gap, the target is 36×36px. Do not make the container another button or combine removal and selection on one target.

**Target sizing:** Default chip targets exceed the 24×24 CSS-pixel size requirement of [WCAG 2.2 SC 2.5.8 (AA)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) without relying on an exception. They do not meet [SC 2.5.5 (AAA)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced)'s 44×44px size requirement. This covers target size, not full-page accessibility. Informational chips are not targets. No input-device media query changes the design.

```html
<div class="chip-list" role="group" aria-label="Category filters">
  <button type="button" class="chip" aria-pressed="false">
    <span class="chip-face">Produce</span>
  </button>
</div>
<ul class="chip-list" aria-label="Selected categories">
  <li class="chip chip-removable">
    <span>Produce</span>
    <button type="button" data-barba-variant="icon" data-barba-shape="icon"
      data-barba-size="compact" aria-label="Remove Produce" title="Remove Produce">
      <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24">
        <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
    </button>
  </li>
</ul>
```

**Layout and adoption:** Use `.chip-list` for wrapping groups; both direct selectable buttons and buttons wrapped in list items are supported. Its gap and the target extensions share `--barba-space-2`. At defaults, visible rows have an 8px gap, while 36px-high targets may meet at their edges without overlapping. In lists containing removable chips, selectable targets also use the full trailing gap instead of splitting the horizontal gap, so mixed types cannot claim the same space.

The extensions do not reserve layout space outside the list. Leave at least half the gap above/below and at inline start, and a full gap at inline end, between the list (or standalone interactive chip) and other content or clipping edges: 4px/8px at defaults. Keep overflow visible around the targets; a scroll container needs equivalent internal padding. Do not shrink `gap`, overlap rows with negative margins, or override the buttons' `::after` independently. To customize spacing, set `--barba-space-2` on the list so both layout and targets change together, then recheck target size, reflow, directionality, focus, and nearby controls. Compact icon buttons outside `.chip-removable` retain their 44px target. Consumers relying on the old chip heights or reserved X width should review adoption before updating.

Applications own selection, filtering and removal. Announce changed results when needed. Before removing a focused chip, move focus to the next enabled remove button, the previous one, or a stable nearby control if none remain. Removing a selection is distinct from deleting the underlying item. The catalog's filtering, removal and restore code is example-only; the package ships CSS, not JavaScript.

### CSS organization and customization

`barbajoe.css` imports tokens first, semantic defaults next, and optional component patterns last. There are no cascade layers. Button defaults, variants and states use zero-specificity `:where()` selectors so a consumer class can own the properties it sets even when loaded earlier. Chip appearance selectors carry one class of specificity; use a later consumer class to customize that appearance. Child layout selectors can include element types.

Button appearance belongs in `buttons.css`; icon shape/size rules there supply geometry independently. `components/chips.css` owns chip labels, faces, selected states, target spacing, wrapping and placement. `components/inline-forms.css` owns input reservation/alignment, and `dialog.css` owns dialog layout and dividers. Neither layout module duplicates icon hover styles. Internal `--_barba-*` properties implement sizing and are not a public customization API; prefer the documented attributes and ordinary consumer CSS.

Defaults followed by explicit variants are intentional specialization. Retain compatibility-sensitive legacy form/header rules until a separately reviewed migration; avoid appending stronger overrides to compensate for unclear ownership.

### Dialogs

For a three-region dialog, use this direct-child structure:

```html
<dialog id="edit-dialog" aria-labelledby="edit-title" closedby="any">
  <form method="dialog" class="dialog-content-container">
    <header class="dialog-header"><h2 id="edit-title">Edit</h2></header>
    <div class="dialog-body">
      <label>Title <input name="title" value="Initial title" required /></label>
    </div>
    <footer class="dialog-footer">
      <button type="reset">Reset</button>
      <button type="button" command="request-close" commandfor="edit-dialog">Cancel</button>
      <button type="submit" value="submit">Submit</button>
    </footer>
  </form>
</dialog>
<button type="button" command="show-modal" commandfor="edit-dialog">Open</button>
```

Dialogs grow with content from a 16rem minimum to an 80dvb maximum; available viewport space caps the minimum and maximum to preserve 1rem outer gutters. The structured body normally owns scrolling, leaving header/footer visible and the footer at the bottom for short content. Its scrolling region retains at least 6rem of height. On exceptionally short screens, the outer dialog can scroll too, keeping the readable body and oversized header/footer actions reachable. Unstructured dialogs retain padding and native scrolling; their content does not receive the three-region layout. Existing structured consumers should wrap their body in `.dialog-body`.

Dialogs share a top offset of 10% of the visible viewport, with a minimum 1rem gap. Their opening animation is anchored at the top, so different content heights do not change that position. Place footer actions in HTML order **Reset (if present), Cancel, Submit**: Submit is rightmost and Cancel immediately precedes it in left-to-right layouts. Use markup order rather than CSS reversal so keyboard and reading order match the visual order; actions may wrap on narrow screens.

The dialog's single grid column is constrained to the available width, and headings can wrap long unbroken titles. For a title beside a close action, add `dialog-header-actions` to `.dialog-header`. This optional flex row wraps when needed and draws one inset divider below the heading and all actions; the plain header pattern keeps its existing appearance.

Add `data-barba-dialog-dividers="full"` to a structured dialog for full-width header and footer borders directly adjoining its scrolling body. This replaces the heading underline and any inset action-row divider with one continuous header border. Both borders remain visible with short or long content; existing dialog defaults remain unchanged when the attribute is omitted.

The following sizing options are independent. Omit an attribute for the existing default. None changes the standard width of `min(32em, 100vi - 2rem)`.

| Dialog attribute | Effect |
| --- | --- |
| `data-barba-dialog-spacing="compact"` | Uses `--barba-space-3` padding instead of `--barba-space-4` for the header, body and footer (or an unstructured dialog's own padding). |
| `data-barba-dialog-height="content"` | Removes the outer minimum height and lowers the structured body's minimum from 6rem to 3rem; short content uses only the room it needs. |
| `data-barba-dialog-room="extra"` | Starts at 5% of the viewport rather than 10%, and permits up to 90% rather than 80% of its height, while preserving at least 1rem outer gutters. |

Combine `data-barba-shape="icon"` with `data-barba-variant="icon"` for the shared close action. Its circular hover background is inset by 2px; the 2.75rem target and separate focus outline remain intact. Give the button an accessible name and hide its decorative SVG from assistive technology. See the shared icon guidance above for sizing and compatibility.

```html
<dialog id="compact-dialog" aria-labelledby="compact-title" closedby="any"
  data-barba-dialog-spacing="compact"
  data-barba-dialog-height="content"
  data-barba-dialog-room="extra"
  data-barba-dialog-dividers="full">
  <form method="dialog" class="dialog-content-container">
    <header class="dialog-header dialog-header-actions">
      <h2 id="compact-title">Edit item</h2>
      <button type="button" data-barba-variant="icon" data-barba-shape="icon"
        aria-label="Close dialog" command="request-close" commandfor="compact-dialog">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24">
          <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
    </header>
    <div class="dialog-body">
      <label>Item name <input name="item" required /></label>
    </div>
    <footer class="dialog-footer">
      <button type="button" command="request-close" commandfor="compact-dialog">Cancel</button>
      <button type="submit">Save</button>
    </footer>
  </form>
</dialog>
```

`method="dialog"` submits and closes after native validation without a network request. Cancel is a non-submit button; `command="request-close"` follows the same cancellable dismissal path as native outside-click dismissal or Escape. Reset restores initial values without closing. Closing does not reset fields. Unless there is a strong reason otherwise, use `closedby="any"` to treat clicks outside the dialog as cancellation: no submission, validation, or reset. Applications with cancellation cleanup should share that behavior through the dialog's `cancel` event, not solely a Cancel-button click handler. Preventing that event can keep the dialog open when dismissal needs confirmation.

Invoker commands and native light dismissal require browser support; CSS cannot supply those behaviors. Consumers targeting older browsers must provide appropriate open/close/dismissal behavior. The specimen includes feature-detected fallbacks (outside clicks invoke its Cancel button), not library JavaScript. See the [short and long dialog examples](https://lib-staging.barbajoe.tech/dialogs.html#dialog-heading) and [native light-dismiss documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#closedby).

An `aria-disabled="true"` link receives disabled appearance and ignores pointer interaction, but ARIA does not prevent keyboard activation. Consumers must remove its navigation target or prevent activation; the specimen prevents its click event for both pointer and keyboard activation.

## Working editor

The [maintained editor](https://lib-staging.barbajoe.tech/editor.html) composes Name, Notes, informational/selectable/removable chips, close, and Delete/Cancel/Save. Toggle read-only and long content to exercise disabled controls, wrapping and scrolling. It uses the existing stacked labels; no new compact-label API is implied. `specimen/editor.css` contains only application-like layout, and `editor.js` owns synthetic draft/save/cancel/delete state and focus restoration. Neither ships in npm. Applications must add their own persistence, permissions, pending/error handling, and deletion safeguards.

## Tokens and accessibility contract

All public tokens use the `--barba-` prefix. The semantic color roles are:

- `--barba-color-text`
- `--barba-color-text-muted`
- `--barba-color-bg`
- `--barba-color-surface`
- `--barba-color-surface-inverse`
- `--barba-color-control-bg`
- `--barba-color-border`
- `--barba-color-link`
- `--barba-color-link-hover`
- `--barba-color-accent`
- `--barba-color-focus-ring`
- `--barba-color-danger`

The old unprefixed aliases were intentionally removed before version 1.0.

The following default pairings are guaranteed. Text roles meet at least 7:1 against both supported backgrounds. Border meets at least 3:1; focus ring uses the link-hover color and therefore also exceeds 3:1.

| Scheme | Role | On page background | On surface |
| --- | --- | ---: | ---: |
| Light | Text | 17.52:1 | 19.77:1 |
| Light | Muted text | 8.33:1 | 9.40:1 |
| Light | Link | 8.33:1 | 9.40:1 |
| Light | Link hover / focus | 13.61:1 | 15.36:1 |
| Light | Danger | 7.22:1 | 8.15:1 |
| Light | Border | 3.14:1 | 3.54:1 |
| Dark | Text | 13.06:1 | 13.67:1 |
| Dark | Muted text | 8.75:1 | 9.16:1 |
| Dark | Link | 7.62:1 | 7.98:1 |
| Dark | Link hover / focus | 7.89:1 | 8.26:1 |
| Dark | Danger | 7.16:1 | 7.49:1 |
| Dark | Border | 3.01:1 | 3.15:1 |

These guarantees apply only to the listed default pairings. Accent, inverse-surface, arbitrary token combinations, and consumer overrides do not carry a general contrast guarantee. The forced light and dark matrices in the [component catalog](https://lib-staging.barbajoe.tech/foundations.html#color-heading) display the contract.

The published Lightning CSS bundle selects its light/dark palette from the system `prefers-color-scheme` setting. Setting `color-scheme` on an element alone does not switch its compiled palette. Applications that force a theme should set matching `color-scheme`, override semantic `--barba-color-*` tokens, and review the primary-button hover rule, which also uses `light-dark()` directly. This pre-existing limitation differs from the source-based catalog, which can display forced light and dark panels together. The [packaged-CSS example](https://lib-staging.barbajoe.tech/package-theme.html) imports the generated release CSS and shows the distinction. Change system preference to verify it; do not copy compiler-private variables.

## Browser support

The library targets the current stable releases of Chrome, Firefox, and Safari on desktop, plus Safari on iOS and Chrome on Android, at the time a package version is released. Edge is outside this support target. Older browser versions, beta releases, and embedded or in-app webviews are also outside this support target. A release-time target does not imply that every browser/device combination was manually checked.

The build preserves native `:dir()` selectors so explicit, inherited, and automatic HTML direction work in the package as they do in source CSS. Current supported browsers implement this selector; language is not a substitute for direction. See [MDN direction semantics](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:dir) and [Lightning CSS feature flags](https://lightningcss.dev/transpilation.html#feature-flags). Other compilation targets and the system-preference theme contract are unchanged.

The Lightning CSS `>= 0.25%` build target controls CSS compilation; it is not a browser-support threshold or a polyfill for browser-native behavior. When a targeted browser lacks a CSS feature, provide a usable fallback or document the limitation before release. Dialog invoker commands and light dismissal are HTML features; applications using them own any needed behavioral fallback. The specimen's JavaScript fallback is not part of the CSS package.

## Local development

### Check modern CSS first

Before adding JavaScript for interface positioning, height measurement, or scroll effects, check whether native HTML and modern CSS solve the actual requirement. Prefer the simplest maintainable solution that meets the application's browser and accessibility needs; use JavaScript when behavior requires it.

- Verify current compatibility in MDN, browser documentation, and the browsers the application supports. An Interop proposal, selection, or successful build is not evidence of universal support. Record the date and relevant limitations when adopting a feature.
- Start with usable semantic HTML. Add optional effects behind feature queries, and gate the complete effect, including transition timing, so unsupported browsers retain immediate interaction. Essential controls, content, and keyboard access must work without the enhancement.
- Scope experimental properties to the relevant component; inherited properties such as `interpolate-size` should not be enabled globally by default. Respect `prefers-reduced-motion`, and check both motion-enabled and reduced-motion behavior explicitly.
- Keep application state, focus management, and announcements with the application. Maintain a sensible DOM order; do not rely on an experimental reading-order feature to repair an otherwise inaccessible layout.
- Consider anchor positioning when a floating control is needed, scroll-state queries when overflow or sticky-state cues help, and `reading-flow` when responsive visual order creates a real navigation problem. Recheck support at implementation time; this is a watchlist, not a requirement to adopt them.

Context: [Josh W. Comeau's Interop 2027 proposals](https://www.joshwcomeau.com/css/interop-2027/), [MDN interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size), and [the Interop selection process](https://github.com/web-platform-tests/interop/blob/main/2027/selection-process.md).

### Disclosure animation and review

On the [disclosure gallery](https://lib-staging.barbajoe.tech/disclosures.html#motion-preview), **Animate opening and closing** starts enabled. Clear the checkbox to compare the instant baseline. For unmerged changes, use the local specimen or deploy preview. The comparison override lives in `specimen.css`; the animation is part of the source and packaged library CSS and does not depend on the gallery.

The component scopes `interpolate-size` to `.disclosure`, animates `::details-content` between zero and its natural height, and transitions discrete `content-visibility` over the same 300ms base motion token. A CSS keyframe guard makes closing content `interactivity: inert` for that interval only. It has no forwards fill: afterward, native details hides controls and the closed text becomes searchable again. Reopening, reduced motion, or a zero-duration token cancels or completes the guard. The entire enhancement requires support for all four features and `prefers-reduced-motion: no-preference`; no JavaScript measures heights or controls expansion. See [MDN interactivity](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interactivity) for the additional experimental dependency. A browser that supports only part of the feature set retains the instant baseline.

Compare opening and closing, rapid reversal, nested disclosures, long selections, both themes and styles, narrow layouts, and keyboard focus. Test the instant baseline, reduced motion, and a browser without support. Automated motion checks exercise the library source and generated package with specimen styles removed; the ordinary reduced-motion suite alone does not establish animation behavior.

**Search verification:** With animation enabled, collapse all panels and use the browser's Find command for `inward/downward`, which occurs only inside the bordered panels. Find must locate the text and reveal the matching disclosure after closing finishes. Chromium regressions check searchability through `window.find`, immediate closing-focus protection, settled closed focus, rapid reopening, and guard cancellation. That API does not itself verify the browser's Find toolbar or automatic expansion; check those separately. Record browser versions and any untested device or assistive-technology behavior. Real-device and screen-reader acceptance remains separate from browser assertions.

### Commands

From this package directory, install the repository dependencies and start the specimen:

```bash
pnpm dev
```

Parcel opens the documentation home automatically and applies HTML, CSS, and dialog-fixture changes with hot module replacement. Development startup also builds the package once for `package-theme.html`; after further library edits, run `pnpm build` to refresh that compiled example. `build:specimen` always regenerates the package before bundling all documentation and demonstration pages. Use the navigation to review the topic pages, header compositions, and all four application shell structures in the same session.

Build the production package with Lightning CSS:

```bash
pnpm build
```

Build the specimen independently of the development server:

```bash
pnpm build:specimen
```

Run warning-fatal checks for the maintained CSS and specimen files:

```bash
pnpm lint
```

`dist/`, `.output/`, and `.parcel-cache/` are generated locally and are not tracked by Git.

### Automated browser review

Install locked dependencies and test browsers from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox webkit
pnpm test:browser:light
pnpm test:browser:heavy
pnpm test:browser:report
```

On Linux, add `--with-deps` when installing browsers. Repeat installation after a Playwright update. `pnpm test:browser` is an alias for heavy. For a focused run, use `pnpm exec playwright test header-menus --project=webkit`; add `--headed` to watch it.

The commands build the library and documentation once, serve the specimen on `127.0.0.1:4173`, and stop the server afterward. Leave that port free; an existing server is rejected. CI builds first and sets `BARBA_TEST_USE_EXISTING_BUILD=1` to reuse its own output. Do not set that variable locally unless you have just rebuilt the current sources.

| CSS version change | Required CI tier |
| --- | --- |
| Unchanged | Lint, library build, and documentation build only |
| Patch increase | Lint/build, release/CI helper tests, and light browser checks |
| Minor or major increase | Lint/build, release/CI helper tests, and all retained heavy browser checks |

The **CI** workflow compares PR base/head versions across the complete PR, not just its last commit. On `main` pushes it compares the event's before/after commits. Invalid or decreasing stable versions fail; update a stale branch against its target. Add `ci:light` or `ci:heavy` labels to request an upward override (heavy wins if both exist). Manual runs compare the selected ref with current `main` and offer a minimum-tier choice, defaulting to heavy. Overrides cannot reduce version-selected coverage. Changing or removing a label recalculates the required tier.

The existing required check, **Lint and build CSS library**, reports the selected tier in its summary and includes that tier's browser checks. A failure in any selected step fails the check. A no-bump PR intentionally receives no browser or helper tests unless explicitly elevated; use heavy for test-suite, compiler, or broad workflow changes. Successful validation of a version-increasing push to `main` gates release staging on that same commit. PRs and manual runs never stage a release.

Light checks the built CSS in Chromium, Firefox, and WebKit: essential button states and customization, header/menu navigation, inline fields and clear actions, chip targets, disclosure operation, dialog reachability, hidden-content helpers, responsive overflow, and representative contrast in both themes. Heavy includes light once, plus documented variants, RTL/enlarged text/forced colors, motion and fallback regressions, targeted source/package parity, all documentation links and legacy bookmarks, and representative demo integration. It does not exhaustively test specimen application state or native form behavior.

There is no blanket browser × width × theme matrix. Tests choose the dimensions relevant to their assertions. `@light` identifies the core subset; `@once` identifies browser-independent documentation checks or explicitly Chromium-specific probes. Unmarked retained tests run in all three engines. Suite-list validation rejects empty suites, duplicates, a missing engine, or light cases absent from heavy. Treat meaningful coverage and measured work as the goal, not a fixed test-count quota.

Target less than one minute for lint/build and light, and less than five minutes for heavy, including setup, builds, tests, and report handling. CI installs Chromium’s headless shell (the actual test browser) without its unused headed binary and uses up to four workers, bounded by available CPUs. Main-branch runs queue rather than replace pending releases; superseded PR validation jobs may be cancelled. The CI validation job has a **15-minute hard ceiling**, allowing growth without making that the expected duration. Record hosted timings separately from local timings and queue delays; these targets are not guarantees about runner provisioning.

Failure screenshots and traces, an HTML report, and environment metadata are saved under ignored `playwright-report/` and `test-results/` directories. CI uploads `browser-review-light` or `browser-review-heavy` reports for 14 days. Successful screenshots are opt-in through `BARBA_CAPTURE=1` for selected visual-review cases; these are attachments for human inspection, not automated pixel comparisons. Temporary local investigation data belongs in an ignored directory and must not be committed or included in the package.

These are Playwright's bundled browsers: WebKit is not installed Safari, narrow desktop viewports are not physical mobile devices, enlarged root text is not actual browser zoom, and accessible-name assertions do not establish screen-reader speech. Most tests request reduced motion; dedicated regressions enable animation. Manual review remains relevant for affected visual behavior, real zoom, assistive technology, and device-specific concerns. On macOS, keyboard tests use Option-Tab where WebKit requires it to include buttons; no system preferences are changed.

### Manual browser review

For CSS-changing pull requests, review the affected examples in the source specimen and the built specimen or deploy preview. Serve `.output/specimen` as the web root because its generated asset URLs are root-relative. Use current desktop Chrome, Firefox, and Safari where available. Record the date, commit or package version, specimen URL/build type, browser and version, OS/device, viewport and zoom, relevant color/motion settings, results, and anything not checked. Build and release-helper test results are separate from browser evidence.

For the affected examples, check a narrow viewport (including 320px where layout matters), keyboard focus and navigation, 200% browser zoom, and light and dark schemes. Reduced-motion review is recommended when motion-related CSS changes; if skipped, record it as *not checked*, not *passed*. A desktop window resized to phone width checks layout but not a mobile browser. **Recommended, not required:** occasionally review on an actual device in current iOS Safari and Android Chrome. Include this reminder in PR review, but do not block a PR or release solely because these device checks were skipped; record them as *not checked*, never *passed*.

For visual CSS changes, keep a small before/after screenshot set of the affected specimen at the same desktop (1280×720) and narrow (390×844) viewport sizes; include an open-dialog state when dialog layout changes. Upload these selected screenshots directly as GitHub PR attachments and verify the resulting links. Do not commit them or per-change review reports to the repository, including under `docs/reviews/`. Keep the explanation, reviewer findings, results, and testing limits in the PR description or conversation; retain temporary working files in ignored `.project/` directories. If attachment upload is unavailable, keep the files locally and report the limitation instead of committing them. The selected attachments should remain with the PR independently of branch deletion or the 14-day CI artifact retention. Put lasting API, compatibility, and design guidance in this README, code comments, or maintained specimens. These storage rules do not change the review and testing requirements above. No automated visual-regression service is required.

When buttons, forms, or dialogs change, use these focused checks:

- Compare primary, secondary, and tertiary buttons in both forced schemes, including hover, keyboard focus, disabled, and optional emphasis overrides. Primary dark hover is light gray; all hover text stays unchanged.
- Compare text fields inside, outside, and associated with a form. Edit the associated field and confirm the form's Reset restores it.
- Open the short dialog: the footer sits at the bottom without forcing maximum height. Open the long dialog: the body scrolls while header/footer stay visible. Switching between them keeps the same top offset; footer actions read Reset, Cancel, Submit.
- Edit dialog fields and Reset; clear the required title and Submit; Cancel or click outside while invalid; Submit while valid. Reset stays open, invalid Submit stays open, Cancel/outside dismissal and valid Submit close, and focus returns to the opener. Reopening retains values until Reset. Clicking inside or dragging from inside to outside must not dismiss the dialog.
- Tab and Shift+Tab through a dialog, reach the final long-body field, and dismiss with Escape. Check 320px-wide and exceptionally short viewports; all actions must remain reachable without page horizontal overflow.
- If table styling changes, inspect the compact and wide tables in both schemes. The wide specimen should scroll horizontally with keyboard focus without making the page overflow.
- A successful build or one browser's measurements are not a cross-browser accessibility guarantee. Record any browser or device you did not check.

## Hosted specimen

The documentation home is a short topic directory. Getting started covers installation and the API quick reference; Foundations covers typography, links, tables, themes, and motion. Buttons, forms, chips, disclosures, dialogs, and accessibility patterns each have a focused page. Layout and navigation retains `headers.html`, and the working editor remains a composed example. The three minimal layout pages and compiled-package theme example remain standalone demonstrations.

Use Guides, Components, and Examples in the header to reach every page, including without JavaScript in browsers supporting native popovers. Older browsers show the links directly. Minimal shell demonstrations retain their intentional layouts and return links. Old catalog fragments redirect to their topic page when JavaScript is available; the homepage's Previous catalog section links provide ordinary fallback links. Preserve existing example IDs when editing pages, update cross-topic links directly, and add any new HTML page to both Parcel entry lists and the browser page/link checks. Development, testing, and release guidance stays in this README.

The specimen is hosted at https://lib-staging.barbajoe.tech/ on the existing library-staging Netlify site. Production deploys from `main`, and pull requests receive Netlify Deploy Previews for review before merging. Netlify publishes the static output of `pnpm build:specimen`.

For live editing, run `pnpm css-lib dev` from the repository root. Parcel's watch mode and hot module replacement remain the local development workflow.

## Releasing the CSS package

The package is currently at version `0.5.0`. Change the version only when there is an approved reason to release the CSS library. The staged-release workflow is specific to this package and accepts stable `MAJOR.MINOR.PATCH` versions only.

The npm trusted publisher for `@barbajoe/css-lib` identifies GitHub user `Barbacoa08`, repository `barbajoe`, and workflow `stage-css-release.yml`. The top-level CI workflow remains in that file because npm validates the calling workflow filename; the staging jobs depend on successful validation. It must allow **stage publishing only**, not direct publishing. Keep the npm maintainer account's 2FA enabled and the package's Publishing access set to **Require two-factor authentication and disallow tokens**. The workflow uses OIDC; it needs neither a bypass-2FA npm access token nor an `NPM_AUTH_TOKEN` GitHub secret. Enable GitHub email notifications for issue assignments if you want the staged-release reminder in your inbox.

To release, raise this package's version in a pull request and merge it into `main`. The workflow compares that version with the preceding `main` version and npm's published `latest`; equal, lower, and prerelease versions do not stage. After the version-selected CI tier succeeds on the same commit, the dependent staging jobs install locked dependencies, rebuild the validated package in its fresh checkout, check that it contains only its expected CSS file and metadata, and stage it on npm. A separate job assigns Joe a GitHub issue only after staging succeeds. The staged version is not installable until a maintainer approves it with npm 2FA.

Review the successful workflow run and sign in to npm. Open [Staged Packages](https://www.npmjs.com/settings/barbajoe/staged-packages), inspect the staged version of `@barbajoe/css-lib`, and approve or reject it with npm 2FA. Close the reminder issue afterward. GitHub email and the issue are reminders; neither can approve the npm release. If staging fails, no approval issue is created. If the reminder job fails after staging succeeded, check npm's staging queue before retrying anything; do not rerun the entire release workflow blindly because npm will reject a duplicate staged version. Create the reminder issue manually if necessary.
