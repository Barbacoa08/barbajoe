import { initializeFilterExamples } from "./disclosure-filters.js";

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

for (const button of document.querySelectorAll("[data-specimen-action]")) {
	button.addEventListener("click", () => {
		const status = button
			.closest(".specimen-theme")
			.querySelector("[data-action-status]");
		status.textContent = `${button.textContent} activated. No data changed.`;
	});
}

// Example application behavior, not part of the CSS package.
for (const button of document.querySelectorAll("[data-specimen-clear]")) {
	const input = document.getElementById(button.getAttribute("aria-controls"));
	const sync = () => {
		button.hidden = input.value.length === 0;
		button.disabled =
			input.disabled || input.readOnly || input.value.length === 0;
	};
	input.addEventListener("input", sync);
	input.addEventListener("change", sync);
	input.form?.addEventListener("reset", () => setTimeout(sync, 0));
	button.addEventListener("click", () => {
		if (input.disabled || input.readOnly) return;
		input.value = "";
		input.focus();
		input.dispatchEvent(new Event("input", { bubbles: true }));
	});
	sync();
}
for (const form of document.querySelectorAll("form[data-specimen-inline]")) {
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const input = [...form.elements].find(
			(el) => el instanceof HTMLInputElement,
		);
		const status = form.dataset.specimenStatus
			? document.getElementById(form.dataset.specimenStatus)
			: form.querySelector('[role="status"]');
		status.textContent = `Added “${input.value}” to this local example. Nothing was saved.`;
		input.value = "";
		input.focus();
		input.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

// Local chip examples: consumers own filtering/removal and persistence.
for (const panel of document.querySelectorAll("[data-chip-demo]")) {
	const list = panel.querySelector("[data-chip-selections]");
	const initial = list.innerHTML;
	const restore = panel.querySelector("[data-chip-restore]");
	for (const button of panel.querySelectorAll("[data-chip-filter]")) {
		button.addEventListener("click", () => {
			button.setAttribute(
				"aria-pressed",
				String(button.getAttribute("aria-pressed") !== "true"),
			);
			const selected = [
				...panel.querySelectorAll('[data-chip-filter][aria-pressed="true"]'),
			].map((el) => el.dataset.chipFilter);
			const items = [
				{ name: "Apples", category: "Produce" },
				{ name: "Rice", category: "Pantry" },
				{ name: "Oats", category: "Weekend" },
			];
			panel.querySelector("[data-chip-results]").textContent = `Showing: ${items
				.filter((item) => !selected.length || selected.includes(item.category))
				.map((item) => item.name)
				.join(", ")}.`;
		});
	}
	list.addEventListener("click", (event) => {
		const button = event.target.closest("[data-chip-remove]");
		if (!button || button.disabled) return;
		const enabled = [...list.querySelectorAll("button:enabled")];
		const index = enabled.indexOf(button);
		const next = enabled[index + 1] || enabled[index - 1] || restore;
		const label = button.previousElementSibling.textContent;
		next.focus();
		button.closest("li").remove();
		panel.querySelector("[data-chip-status]").textContent =
			`Removed ${label} from this example. Nothing was deleted from storage.`;
	});
	restore.addEventListener("click", () => {
		list.innerHTML = initial;
		panel.querySelector("[data-chip-status]").textContent =
			"All sample selections restored.";
	});
}

// Local demonstrations of hidden status text and contextual action names.
for (const panel of document.querySelectorAll('[data-hidden-demo="status"]')) {
	const select = panel.querySelector("select");
	select.addEventListener("change", () => {
		const items = [...panel.querySelectorAll("[data-category]")];
		for (const item of items)
			item.hidden =
				select.value !== "all" && item.dataset.category !== select.value;
		const count = items.filter((item) => !item.hidden).length;
		panel.querySelector("[data-count]").textContent =
			`${count} of ${items.length} items shown.`;
		// The native select already exposes its chosen category. Announce only
		// the result, and avoid rewriting an unchanged live-region message.
		const message = `${count} of ${items.length} items shown.`;
		const status = panel.querySelector("[data-hidden-status]");
		if (status.textContent !== message) status.textContent = message;
		panel.querySelector("[data-inspector]").textContent = message;
	});
}
// Catalog-only feedback: a real editor should manage its own action and focus.
for (const button of document.querySelectorAll(
	'[data-hidden-demo="context"] [data-item]',
))
	button.addEventListener("click", () => {
		button
			.closest("article")
			.querySelector(
				"[data-action-result]",
			).textContent = `${button.dataset.item} selected for editing. Local example only.`;
	});

initializeFilterExamples();
