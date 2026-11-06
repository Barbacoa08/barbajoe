import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const readme = readFileSync(
	new URL("../../src/packages/css-lib/README.md", import.meta.url),
	"utf8",
);
const adapter = readme.match(
	/```js\n(function motionSettings[\s\S]*?)\n```/,
)[1];

test("documented JS adapter handles units, overrides, and reduction @once", async ({
	page,
}) => {
	await page.goto("/package-theme.html");
	const result = await page.evaluate((source) => {
		// Execute the published documentation example, not a test-only copy.
		const settings = new Function(`${source}; return motionSettings;`)();
		const node = document.querySelector("[data-motion-demo]");
		const defaults = settings(node, false);
		const reduced = settings(node, true);
		node.style.setProperty("--barba-motion-duration-base", ".6s");
		node.style.setProperty("--barba-motion-duration-fast", "75ms");
		node.style.setProperty(
			"--barba-motion-easing-decelerate",
			"cubic-bezier(.25, .1, .25, 1)",
		);
		const custom = settings(node, false);
		const invalid = [];
		for (const [token, value] of [
			["duration-base", "calc(1s + 1s)"],
			["duration-fast", "-1s"],
			["easing-decelerate", "ease-out"],
			["easing-decelerate", "cubic-bezier(, 1, .5, 1)"],
			["easing-decelerate", "cubic-bezier(2, 1, .5, 1)"],
		]) {
			const name = `--barba-motion-${token}`;
			const previous = node.style.getPropertyValue(name);
			node.style.setProperty(name, value);
			try {
				settings(node, false);
				invalid.push(false);
			} catch {
				invalid.push(true);
			}
			node.style.setProperty(name, previous);
		}
		node.style.setProperty("--barba-motion-duration-base", "0s");
		node.style.setProperty("--barba-motion-duration-fast", "0ms");
		const zero = settings(node, false);
		return {
			defaults: [
				defaults.move.duration,
				defaults.enter.duration,
				defaults.move.easing(0.5),
				defaults.enter.easing(0.5),
			],
			reduced: [reduced.move.duration, reduced.enter.duration],
			custom: [
				custom.move.duration,
				custom.enter.duration,
				custom.move.easing(0.5),
			],
			endpoints: [custom.move.easing(0), custom.move.easing(1)],
			zero: [zero.move.duration, zero.enter.duration],
			invalid,
		};
	}, adapter);
	expect(result.defaults.slice(0, 2)).toEqual([300, 150]);
	expect(result.defaults[2]).toBeCloseTo(0.875, 5);
	expect(result.defaults[3]).toBe(0.5);
	expect(result.reduced).toEqual([0, 0]);
	expect(result.custom.slice(0, 2)).toEqual([600, 75]);
	expect(result.custom[2]).toBeCloseTo(0.802403, 5);
	expect(result.endpoints).toEqual([0, 1]);
	expect(result.zero).toEqual([0, 0]);
	expect(result.invalid).toEqual([true, true, true, true, true]);
});
