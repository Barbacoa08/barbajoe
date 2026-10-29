import assert from "node:assert/strict";
import { test } from "node:test";
import { selectCssCiTier } from "./css-ci-tier.mjs";

test("selects the tier from numeric version changes", () => {
	for (const [previous, current, change, tier] of [
		["0.5.0", "0.5.0", "none", "none"],
		["0.5.0", "0.5.1", "patch", "light"],
		["0.5.0", "0.6.0", "minor", "heavy"],
		["0.5.0", "1.0.0", "major", "heavy"],
		["0.9.9", "0.10.0", "minor", "heavy"],
		["1.9.9", "2.0.0", "major", "heavy"],
	])
		assert.deepEqual(selectCssCiTier({ previous, current }), {
			previous,
			current,
			change,
			tier,
		});
});
test("overrides only raise coverage", () => {
	for (const [current, minimumTier, tier] of [
		["0.5.0", "light", "light"],
		["0.5.0", "heavy", "heavy"],
		["0.5.1", "heavy", "heavy"],
		["0.6.0", "light", "heavy"],
		["0.5.1", "none", "light"],
	])
		assert.equal(
			selectCssCiTier({ previous: "0.5.0", current, minimumTier }).tier,
			tier,
		);
});
test("rejects invalid, missing, and decreasing versions and unknown tiers", () => {
	for (const bad of [
		undefined,
		"",
		"0.5",
		"01.5.0",
		"0.5.0-beta.1",
		"0.5.0+build",
	]) {
		assert.throws(() => selectCssCiTier({ previous: bad, current: "0.5.0" }));
		assert.throws(() => selectCssCiTier({ previous: "0.5.0", current: bad }));
	}
	assert.throws(() => selectCssCiTier({ previous: "0.6.0", current: "0.5.9" }));
	assert.throws(() =>
		selectCssCiTier({
			previous: "0.5.0",
			current: "0.5.0",
			minimumTier: "fast",
		}),
	);
});
