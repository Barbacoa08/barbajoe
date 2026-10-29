import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { resolveCiEvent, selectEventTier } from "./css-ci-event.mjs";

const base = "a".repeat(40),
	head = "b".repeat(40);
const pr = {
	pull_request: { base: { sha: base }, head: { sha: head }, labels: [] },
};
test("PR uses event base and head, with heavy winning conflicting labels", () => {
	assert.deepEqual(resolveCiEvent({ eventName: "pull_request", event: pr }), {
		before: base,
		after: head,
		minimumTier: "none",
		canStage: false,
	});
	assert.equal(
		resolveCiEvent({
			eventName: "pull_request",
			event: {
				pull_request: {
					...pr.pull_request,
					labels: [{ name: "ci:light" }, { name: "ci:heavy" }],
				},
			},
		}).minimumTier,
		"heavy",
	);
});
test("only main pushes may stage; manual runs have a stable baseline and upward choice", () => {
	for (const ref of ["refs/heads/main", "refs/heads/feature"])
		assert.equal(
			resolveCiEvent({
				eventName: "push",
				event: { before: base, after: head },
				ref,
			}).canStage,
			ref === "refs/heads/main",
		);
	assert.deepEqual(
		resolveCiEvent({
			eventName: "workflow_dispatch",
			event: { inputs: { minimum_tier: "light" } },
			sha: head,
			mainSha: base,
		}),
		{ before: base, after: head, minimumTier: "light", canStage: false },
	);
	for (const event of [
		{ before: "0".repeat(40), after: head },
		{ before: "main; touch bad", after: head },
	])
		assert.throws(() =>
			resolveCiEvent({ eventName: "push", event, ref: "refs/heads/main" }),
		);
	assert.throws(() => resolveCiEvent({ eventName: "pull_request", event: {} }));
});
test("real Git history retains an earlier bump and fails missing or advancing baselines", () => {
	mkdirSync(".projects", { recursive: true });
	const cwd = resolve(mkdtempSync(".projects/ci-history-"));
	const git = (...args) =>
		execFileSync("git", args, {
			cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
	try {
		git("init", "-q");
		git("config", "user.email", "ci@example.invalid");
		git("config", "user.name", "CI fixture");
		mkdirSync(`${cwd}/src/packages/css-lib`, { recursive: true });
		const commit = (version) => {
			writeFileSync(
				`${cwd}/src/packages/css-lib/package.json`,
				JSON.stringify({ version }),
			);
			git("add", ".");
			git("commit", "-qm", version);
			return git("rev-parse", "HEAD");
		};
		const before = commit("0.5.0"),
			bumped = commit("0.6.0");
		writeFileSync(`${cwd}/note.txt`, "unrelated");
		git("add", ".");
		git("commit", "-qm", "follow-up");
		const after = git("rev-parse", "HEAD");
		const context = { before, after, minimumTier: "light", canStage: false };
		assert.equal(selectEventTier(context, cwd).tier, "heavy");
		assert.equal(
			selectEventTier({ ...context, canStage: true }, cwd).release,
			true,
		);
		assert.equal(
			selectEventTier({ ...context, before: bumped }, cwd).release,
			false,
		);
		assert.throws(() =>
			selectEventTier({ ...context, before: "f".repeat(40) }, cwd),
		);
		const advanced = commit("0.7.0");
		assert.throws(() => selectEventTier({ ...context, before: advanced }, cwd));
	} finally {
		rmSync(cwd, { recursive: true, force: true });
	}
});
