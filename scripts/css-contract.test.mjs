import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const cssDirectory = new URL("../src/packages/css-lib/lib/", import.meta.url);

function readCss(file) {
	return readFileSync(new URL(file, cssDirectory), "utf8");
}

function motionPreferenceBlock(css) {
	const query = /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{/;
	const match = query.exec(css);

	assert.ok(match, "expected a prefers-reduced-motion: no-preference block");

	const openingBrace = match.index + match[0].length - 1;
	let depth = 0;

	for (let index = openingBrace; index < css.length; index += 1) {
		if (css[index] === "{") depth += 1;
		if (css[index] === "}") depth -= 1;

		if (depth === 0) {
			return {
				inside: css.slice(openingBrace + 1, index),
				outside: `${css.slice(0, match.index)}${css.slice(index + 1)}`,
			};
		}
	}

	assert.fail("motion preference block is not closed");
}

test("the library does not use a blanket reduced-motion override", () => {
	const source = [
		readCss("base-elements.css"),
		readCss("dialog.css"),
		readCss("text-gradient.css"),
		readCss("transform-scale-up.css"),
	].join("\n");

	assert.doesNotMatch(source, /!important/);
	assert.doesNotMatch(source, /prefers-reduced-motion:\s*reduce/);
});

test("library motion is opt-in when motion is acceptable", () => {
	const dialog = motionPreferenceBlock(readCss("dialog.css"));
	assert.match(dialog.inside, /dialog\[open\][^{]*\{[^}]*animation:/s);
	assert.match(
		dialog.inside,
		/dialog\[open\]::backdrop[^{]*\{[^}]*animation:/s,
	);
	assert.doesNotMatch(dialog.outside, /animation\s*:/);

	const textGradient = motionPreferenceBlock(readCss("text-gradient.css"));
	assert.match(textGradient.inside, /\.text-gradient[^{]*\{[^}]*animation:/s);
	assert.doesNotMatch(textGradient.outside, /animation\s*:/);

	const scale = motionPreferenceBlock(readCss("transform-scale-up.css"));
	assert.match(scale.inside, /\.scaleup-on-hover[^{]*\{[^}]*transition:/s);
	assert.match(scale.inside, /transform:\s*scale\(/);
	assert.doesNotMatch(scale.outside, /transition:\s*transform/);
	assert.doesNotMatch(scale.outside, /transform:\s*scale\(/);
});
