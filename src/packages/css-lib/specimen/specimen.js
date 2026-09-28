// Native commands need no JavaScript in supporting browsers. This fallback
// belongs only to the specimen; the published package remains CSS-only.
if (!("commandForElement" in HTMLButtonElement.prototype)) {
	for (const button of document.querySelectorAll("button[commandfor]")) {
		button.addEventListener("click", () => {
			const dialog = document.getElementById(button.getAttribute("commandfor"));
			if (!(dialog instanceof HTMLDialogElement)) return;
			if (button.getAttribute("command") === "show-modal") dialog.showModal();
			if (button.getAttribute("command") === "close") dialog.close();
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
