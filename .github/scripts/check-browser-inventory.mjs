import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

function inventory(report) {
	const cases = new Set(),
		engines = new Set();
	function walk(suites, parents = []) {
		if (!Array.isArray(suites)) throw new Error("Invalid browser inventory");
		for (const suite of suites) {
			const path = [...parents, suite.title];
			for (const spec of suite.specs ?? []) {
				for (const entry of spec.tests ?? []) {
					const key = JSON.stringify([
						entry.projectName,
						spec.file,
						...path,
						spec.title,
					]);
					if (cases.has(key)) throw new Error(`Duplicate browser case: ${key}`);
					cases.add(key);
					engines.add(entry.projectName);
				}
			}
			walk(suite.suites ?? [], path);
		}
	}
	walk(report.suites);
	if (
		!cases.size ||
		["chromium", "firefox", "webkit"].some((engine) => !engines.has(engine))
	)
		throw new Error("Suite must contain tests in all three engines");
	return cases;
}
export function checkBrowserInventory(lightReport, heavyReport) {
	const light = inventory(lightReport),
		heavy = inventory(heavyReport);
	for (const key of light)
		if (!heavy.has(key))
			throw new Error(`Light case absent from heavy: ${key}`);
	return { light: light.size, heavy: heavy.size };
}
if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	const [light, heavy] = process.argv
		.slice(2)
		.map((path) => JSON.parse(readFileSync(path, "utf8")));
	console.log(JSON.stringify(checkBrowserInventory(light, heavy)));
}
