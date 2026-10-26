// Shared, example-only composition. The published package contains no JavaScript.
const groups = [
	{
		key: "stores",
		label: "Store",
		all: "All stores",
		values: ["aldis", "costco", "freddies", "target", "tjs"],
	},
	{
		key: "categories",
		label: "Category",
		all: "All categories",
		values: [
			"black",
			"blue",
			"fresh",
			"frozen",
			"fruit",
			"green",
			"red",
			"yellow",
		],
	},
];

export function initializeFilterExamples(root = document) {
	const resets = [];
	for (const panel of root.querySelectorAll("[data-filled-filter-demo]")) {
		// All interpolated values below are fixed synthetic examples, not user data.
		const shell = document.createElement("div");
		shell.className = "specimen-filter-shell";
		shell.innerHTML = `<details class="disclosure disclosure--filled">
<summary><span class="disclosure-label specimen-filter-summary"><span class="disclosure-title">Filters</span><span class="disclosure-description specimen-filter-selection">All items</span></span></summary>
<div class="disclosure-content">${groups.map((group) => `<fieldset class="specimen-filter-group"><legend>${group.label}</legend><div class="chip-list">${["", ...group.values].map((value) => `<button type="button" class="chip" data-filter-group="${group.key}" data-value="${value}" aria-pressed="false"><span class="chip-face">${value || group.all}</span></button>`).join("")}</div></fieldset>`).join("")}</div>
</details>
<button type="button" class="specimen-filter-clear" data-barba-variant="icon" data-barba-shape="icon" aria-label="Clear all filters" hidden><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg></button>`;
		panel.append(shell);
		const summary = shell.querySelector("summary");
		const details = shell.querySelector("details");
		const selection = shell.querySelector(".specimen-filter-selection");
		const clear = shell.querySelector(".specimen-filter-clear");
		const chips = [...shell.querySelectorAll("[data-filter-group]")];
		const state = { stores: new Set(), categories: new Set() };
		const render = () => {
			const chosen = chips.filter(
				(chip) =>
					chip.dataset.value &&
					state[chip.dataset.filterGroup].has(chip.dataset.value),
			);
			selection.textContent = chosen.length
				? chosen.map((chip) => chip.dataset.value).join(" · ")
				: "All items";
			clear.hidden = chosen.length === 0;
			for (const chip of chips) {
				const group = state[chip.dataset.filterGroup];
				chip.setAttribute(
					"aria-pressed",
					String(
						chip.dataset.value
							? group.has(chip.dataset.value)
							: group.size === 0,
					),
				);
			}
		};
		for (const chip of chips) {
			chip.addEventListener("click", () => {
				const group = state[chip.dataset.filterGroup];
				const value = chip.dataset.value;
				if (!value) group.clear();
				else if (group.has(value)) group.delete(value);
				else group.add(value);
				render();
			});
		}
		clear.addEventListener("click", () => {
			for (const group of Object.values(state)) group.clear();
			// Transfer focus before hiding its former owner; expansion is unchanged.
			summary.focus();
			render();
		});
		const reset = () => {
			for (const group of groups) {
				state[group.key].clear();
				const values =
					panel.dataset.filterState === "many"
						? group.values
						: panel.dataset.filterState === "selected" && group.key === "stores"
							? ["aldis"]
							: [];
				for (const value of values) state[group.key].add(value);
			}
			details.open = panel.dataset.filterOpen !== "false";
			render();
		};
		reset();
		resets.push(reset);
	}
	return () => {
		for (const reset of resets) reset();
	};
}
