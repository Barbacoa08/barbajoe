import assert from "node:assert/strict";
import { test } from "node:test";
import { checkBrowserInventory } from "./check-browser-inventory.mjs";

const report = (
	names = ["core"],
	engines = ["chromium", "firefox", "webkit"],
) => ({
	suites: [
		{
			title: "core.spec.mjs",
			specs: names.map((title) => ({
				title,
				file: "core.spec.mjs",
				tests: engines.map((projectName) => ({ projectName })),
			})),
		},
	],
});
test("accepts a nonempty three-engine light subset", () =>
	assert.deepEqual(checkBrowserInventory(report(), report(["core", "edge"])), {
		light: 3,
		heavy: 6,
	}));
test("rejects empty, missing-engine, duplicate, and non-subset suites", () => {
	for (const [light, heavy] of [
		[report([]), report()],
		[report(["core"], ["chromium"]), report()],
		[report(["core", "core"]), report()],
		[report(), report(["other"])],
		[{}, report()],
	])
		assert.throws(() => checkBrowserInventory(light, heavy));
});
