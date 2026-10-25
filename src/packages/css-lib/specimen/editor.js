// Example-only state and behavior. No application data or persistence.
const dialog = document.querySelector("#sample-editor");
const form = document.querySelector("#editor-form");
const openButton = document.querySelector("#edit-sample");
const restoreButton = document.querySelector("#restore-sample");
const name = document.querySelector("#editor-name");
const notes = document.querySelector("#editor-notes");
const status = document.querySelector("#editor-status");
const filterList = document.querySelector("#editor-filters");
const selections = document.querySelector("#editor-selections");
const categories = [
	"Produce",
	"Pantry",
	"Weekend shopping for the shared household",
];
const initial = () => ({
	name: "Weekend groceries",
	notes: "Check the synthetic sample before saving.",
	categories: [categories[0], categories[2], "Locked example"],
});
let saved = initial();
let draft;
let readonly = false;
let result = "";
const x =
	'<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" /></svg>';
function renderSaved() {
	document.querySelector("#saved-item").textContent = saved
		? `${saved.name}\n${saved.notes}\nCategories: ${saved.categories.join(", ") || "None"}`
		: "The synthetic sample has been deleted.";
	openButton.disabled = !saved;
}
function renderSelections() {
	selections.replaceChildren();
	for (const category of draft.categories) {
		const li = document.createElement("li");
		li.className = "chip chip-removable";
		const label = document.createElement("span");
		label.textContent = category;
		const button = document.createElement("button");
		button.type = "button";
		button.dataset.barbaVariant = "icon";
		button.dataset.barbaShape = "icon";
		button.dataset.barbaSize = "compact";
		button.setAttribute("aria-label", `Remove ${category}`);
		button.innerHTML = x;
		button.disabled = readonly || category === "Locked example";
		button.addEventListener("click", () => {
			if (button.disabled) return;
			const enabled = [...selections.querySelectorAll("button:enabled")];
			const index = enabled.indexOf(button);
			// Transfer focus before removing its owning chip; preserve other nodes.
			(
				enabled[index + 1] ||
				enabled[index - 1] ||
				filterList.querySelector("button")
			).focus();
			draft.categories = draft.categories.filter((value) => value !== category);
			li.remove();
			syncFilters();
		});
		li.append(label, button);
		selections.append(li);
	}
}
function syncFilters() {
	for (const button of filterList.querySelectorAll("button[data-category]"))
		button.setAttribute(
			"aria-pressed",
			String(draft.categories.includes(button.dataset.category)),
		);
}
function renderFilters() {
	filterList.replaceChildren();
	for (const category of [...categories, "Unavailable"]) {
		const li = document.createElement("li");
		const button = document.createElement("button");
		button.type = "button";
		button.className = "chip";
		button.dataset.category = category;
		button.disabled = readonly || category === "Unavailable";
		const face = document.createElement("span");
		face.className = "chip-face";
		face.textContent = category;
		button.append(face);
		button.addEventListener("click", () => {
			if (button.disabled) return;
			draft.categories = draft.categories.includes(category)
				? draft.categories.filter((value) => value !== category)
				: [...draft.categories, category];
			syncFilters();
			renderSelections();
		});
		li.append(button);
		filterList.append(li);
	}
	syncFilters();
}
openButton.addEventListener("click", () => {
	if (!saved) return;
	draft = structuredClone(saved);
	result = "";
	status.textContent = "";
	readonly = document.querySelector("#editor-readonly").checked;
	name.value = draft.name;
	notes.value = draft.notes;
	name.readOnly = readonly;
	notes.readOnly = readonly;
	document.querySelector("#editor-save").disabled = readonly;
	document.querySelector("#editor-delete").disabled = readonly;
	document.querySelector("#editor-mode").textContent = readonly
		? "Read-only example: changes are unavailable; you can still inspect, cancel or close."
		: "Changes remain a draft until you save.";
	const long = document.querySelector("#editor-long-content");
	long.hidden = !document.querySelector("#editor-long").checked;
	long.replaceChildren();
	for (let i = 1; i <= 12; i++) {
		const p = document.createElement("p");
		p.textContent = `Sample detail ${i}: this longer description exercises body scrolling while the header and actions remain available. It contains no real household data.`;
		long.append(p);
	}
	renderFilters();
	renderSelections();
	dialog.showModal();
	name.focus();
});
form.addEventListener("submit", (event) => {
	event.preventDefault();
	if (readonly) return;
	saved = { ...draft, name: name.value, notes: notes.value };
	renderSaved();
	result = "Sample saved.";
	dialog.close();
});
document.querySelector("#editor-delete").addEventListener("click", () => {
	if (readonly) return;
	saved = null;
	renderSaved();
	result = "Sample deleted. Restore sample to try again.";
	dialog.close();
});
dialog.addEventListener("close", () => {
	(saved ? openButton : restoreButton).focus();
	status.textContent = result || "Draft discarded.";
	draft = null;
});
restoreButton.addEventListener("click", () => {
	saved = initial();
	renderSaved();
	status.textContent = "Sample restored.";
});
renderSaved();
