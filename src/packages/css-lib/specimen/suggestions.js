// Demonstration only. Applications supply their own matching, state, and guards.
for (const demo of document.querySelectorAll("[data-suggestion-demo]")) {
	const input = demo.querySelector('[role="combobox"]');
	const panel = demo.querySelector(".suggestion-panel");
	const options = [...panel.querySelectorAll(".suggestion-option")];
	const empty = panel.querySelector(".suggestion-empty");
	const status = demo.querySelector('[role="status"]');
	let active = options.find(
		(option) => option.getAttribute("aria-selected") === "true",
	);
	let composing = false;
	const available = () =>
		options.filter((option) => !option.hidden && !option.disabled);
	const guarded = () => input.disabled || input.readOnly || composing;
	function activate(option) {
		active = option;
		for (const row of options)
			row.setAttribute("aria-selected", String(row === active));
		if (active) input.setAttribute("aria-activedescendant", active.id);
		else input.removeAttribute("aria-activedescendant");
	}
	function setOpen(open) {
		panel.hidden = !open;
		input.setAttribute("aria-expanded", String(open));
		if (!open) activate(null);
	}
	function filter() {
		if (guarded()) return setOpen(false);
		const query = input.value.toLocaleLowerCase();
		for (const row of options) {
			row.hidden = !row.dataset.value.toLocaleLowerCase().includes(query);
		}
		empty.hidden = options.some((row) => !row.hidden);
		activate(null);
		setOpen(true);
		status.textContent = empty.hidden
			? `${available().length} destinations available.`
			: empty.textContent;
	}
	function choose(option) {
		if (guarded() || panel.hidden || !available().includes(option)) return;
		input.value = option.dataset.value;
		setOpen(false);
		status.textContent = `Selected ${input.value}.`;
		input.focus();
	}
	input.addEventListener("focus", filter);
	input.addEventListener("input", filter);
	input.addEventListener("blur", () => setOpen(false));
	input.addEventListener("compositionstart", () => {
		composing = true;
		setOpen(false);
	});
	input.addEventListener("compositionend", () => {
		composing = false;
		filter();
	});
	input.addEventListener("keydown", (event) => {
		if (
			guarded() ||
			event.isComposing ||
			event.keyCode === 229 ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey
		)
			return;
		if (["ArrowDown", "ArrowUp"].includes(event.key)) {
			event.preventDefault();
			if (panel.hidden) filter();
			const rows = available();
			if (!rows.length) return;
			const index = rows.indexOf(active);
			const next =
				index < 0
					? event.key === "ArrowDown"
						? 0
						: rows.length - 1
					: (index + (event.key === "ArrowDown" ? 1 : -1) + rows.length) %
						rows.length;
			activate(rows[next]);
		} else if (event.key === "Enter" && !panel.hidden && active) {
			event.preventDefault();
			choose(active);
		} else if (event.key === "Escape" && !panel.hidden) {
			event.preventDefault();
			setOpen(false);
		} else if (event.key === "Tab") setOpen(false);
	});
	for (const option of options) {
		option.addEventListener("mousedown", (event) => event.preventDefault());
		option.addEventListener("click", () => choose(option));
	}
}
