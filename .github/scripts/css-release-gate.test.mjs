import assert from "node:assert/strict";
import { test } from "node:test";
import { decideCssRelease } from "./css-release-gate.mjs";

test("stages a stable version higher than both main and npm latest", () => {
	assert.deepEqual(decideCssRelease("0.2.1", "0.3.0", "0.2.1"), {
		stage: true,
		previous: "0.2.1",
		current: "0.3.0",
		published: "0.2.1",
	});
});

test("does not stage an unchanged version", () => {
	assert.equal(decideCssRelease("0.2.1", "0.2.1", "0.2.1").stage, false);
});

test("does not stage a version decreased from main", () => {
	assert.equal(decideCssRelease("0.3.0", "0.2.2", "0.2.1").stage, false);
});

test("does not stage a version that is not higher than npm latest", () => {
	assert.equal(decideCssRelease("0.2.1", "0.3.0", "0.3.0").stage, false);
	assert.equal(decideCssRelease("0.2.1", "0.3.0", "0.4.0").stage, false);
});

test("compares numeric components rather than version strings", () => {
	assert.equal(decideCssRelease("0.9.0", "0.10.0", "0.9.0").stage, true);
});

test("rejects malformed or prerelease versions", () => {
	for (const bad of ["0.3", "0.3.0-beta.1", "01.2.3", "0.3.0+build", ""]) {
		assert.throws(() => decideCssRelease("0.2.1", bad, "0.2.1"));
	}
});

test("rejects invalid previous or published versions rather than assuming a first release", () => {
	assert.throws(() => decideCssRelease("unknown", "0.3.0", "0.2.1"));
	assert.throws(() => decideCssRelease("0.2.1", "0.3.0", ""));
});
