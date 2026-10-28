// Documentation-site behavior only; the library ships CSS, not JavaScript.
// Native auto popovers handle activation, exclusivity, outside clicks, and Escape.
if ("hidePopover" in HTMLElement.prototype) {
	for (const nav of document.querySelectorAll("[data-documentation-nav]")) {
		nav.addEventListener("focusout", (event) => {
			if (!(event.relatedTarget instanceof Node)) return;
			for (const menu of nav.querySelectorAll(
				".site-header-menu:popover-open",
			)) {
				if (!menu.parentElement.contains(event.relatedTarget))
					menu.hidePopover();
			}
		});
	}
}
