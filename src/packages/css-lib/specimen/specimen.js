// Native commands need no JavaScript in supporting browsers. This fallback
// belongs only to the specimen; the published package remains CSS-only.
if (!("commandForElement" in HTMLButtonElement.prototype)) {
	for (const button of document.querySelectorAll("button[commandfor]")) {
		button.addEventListener("click", () => {
			const dialog = document.getElementById(button.getAttribute("commandfor"));
			if (!(dialog instanceof HTMLDialogElement)) return;
			if (button.getAttribute("command") === "show-modal") dialog.showModal();
			if (button.getAttribute("command") === "close") dialog.close();
			if (button.getAttribute("command") === "request-close") {
				if (typeof dialog.requestClose === "function") dialog.requestClose();
				else if (
					dialog.dispatchEvent(new Event("cancel", { cancelable: true }))
				)
					dialog.close();
			}
		});
	}
}

// Prefer native light dismissal. Older browsers share the Cancel action;
// starting a drag inside the dialog must not dismiss it when released outside.
if (!("closedBy" in HTMLDialogElement.prototype)) {
	for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
		let startedOutside = false;
		const isOutside = (event) => {
			const bounds = dialog.getBoundingClientRect();
			return (
				event.clientX < bounds.left ||
				event.clientX > bounds.right ||
				event.clientY < bounds.top ||
				event.clientY > bounds.bottom
			);
		};
		dialog.addEventListener("pointerdown", (event) => {
			startedOutside = event.target === dialog && isOutside(event);
		});
		dialog.addEventListener("pointercancel", () => {
			startedOutside = false;
		});
		dialog.addEventListener("click", (event) => {
			const dismiss =
				startedOutside && event.target === dialog && isOutside(event);
			startedOutside = false;
			if (dismiss)
				dialog.querySelector('button[command="request-close"]').click();
		});
	}
}

for (const form of document.querySelectorAll("form[data-specimen-no-submit]")) {
	form.addEventListener("submit", (event) => event.preventDefault());
}

for (const disabledLink of document.querySelectorAll(
	'a[aria-disabled="true"]',
)) {
	disabledLink.addEventListener("click", (event) => event.preventDefault());
}
