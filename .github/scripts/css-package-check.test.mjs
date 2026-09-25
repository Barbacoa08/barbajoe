import assert from "node:assert/strict";
import { test } from "node:test";
import { checkCssPackage } from "./css-package-check.mjs";

const packageSummary = {
	name: "@barbajoe/css-lib",
	version: "0.3.0",
	files: [
		{ path: "dist/barbajoe.css" },
		{ path: "package.json" },
		{ path: "README.md" },
	],
};

test("accepts only the expected CSS release files", () => {
	assert.doesNotThrow(() => checkCssPackage(packageSummary, "0.3.0"));
});

test("rejects wrong package or version", () => {
	assert.throws(() =>
		checkCssPackage(
			{ ...packageSummary, name: "@barbajoe/react-lib" },
			"0.3.0",
		),
	);
	assert.throws(() => checkCssPackage(packageSummary, "0.4.0"));
});

test("rejects missing CSS or extra files", () => {
	assert.throws(() =>
		checkCssPackage(
			{
				...packageSummary,
				files: [{ path: "package.json" }, { path: "README.md" }],
			},
			"0.3.0",
		),
	);
	assert.throws(() =>
		checkCssPackage(
			{
				...packageSummary,
				files: [...packageSummary.files, { path: "specimen/index.html" }],
			},
			"0.3.0",
		),
	);
});
