import { initializeFilterExamples } from "./disclosure-filters.js";

const resetFilters = initializeFilterExamples();
const bordered = [...document.querySelectorAll("[data-bordered-example]")].map(
	(details) => ({ details, open: details.open }),
);
document.querySelector("#reset-examples").addEventListener("click", () => {
	resetFilters();
	for (const item of bordered) item.details.open = item.open;
});
for (const [id, open] of [
	["expand-all", true],
	["collapse-all", false],
]) {
	document.querySelector(`#${id}`).addEventListener("click", () => {
		for (const details of document.querySelectorAll("details.disclosure"))
			details.open = open;
	});
}
document.querySelector("#narrow-panels").addEventListener("change", (event) => {
	for (const pair of document.querySelectorAll(".specimen-disclosure-pair"))
		pair.toggleAttribute("data-narrow", event.currentTarget.checked);
});
