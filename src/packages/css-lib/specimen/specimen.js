const dialog = document.querySelector("#specimen-dialog");
const openButton = document.querySelector("#open-dialog");
const closeButton = document.querySelector("#close-dialog");

if (
	dialog instanceof HTMLDialogElement &&
	openButton instanceof HTMLButtonElement &&
	closeButton instanceof HTMLButtonElement
) {
	openButton.addEventListener("click", () => dialog.showModal());
	closeButton.addEventListener("click", () => dialog.close());
}

for (const disabledLink of document.querySelectorAll(
	'a[aria-disabled="true"]',
)) {
	disabledLink.addEventListener("click", (event) => event.preventDefault());
}
