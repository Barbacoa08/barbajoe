import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { selectCssCiTier } from "./css-ci-tier.mjs";

function commit(value) {
	if (
		typeof value !== "string" ||
		!/^[a-f0-9]{40}$/.test(value) ||
		/^0+$/.test(value)
	)
		throw new Error("CI requires an available, explicit commit SHA");
	return value;
}
export function resolveCiEvent({ eventName, event, sha, ref, mainSha }) {
	let before,
		after,
		minimumTier = "none",
		canStage = false;
	if (eventName === "pull_request") {
		before = event.pull_request?.base?.sha;
		after = event.pull_request?.head?.sha;
		const labels = (event.pull_request?.labels ?? []).map(
			(label) => label.name,
		);
		minimumTier = labels.includes("ci:heavy")
			? "heavy"
			: labels.includes("ci:light")
				? "light"
				: "none";
	} else if (eventName === "push") {
		before = event.before;
		after = event.after;
		canStage = ref === "refs/heads/main";
	} else if (eventName === "workflow_dispatch") {
		before = mainSha;
		after = sha;
		minimumTier = event.inputs?.minimum_tier ?? "heavy";
	} else throw new Error(`Unsupported CI event: ${eventName}`);
	return {
		before: commit(before),
		after: commit(after),
		minimumTier,
		canStage,
	};
}
export function selectEventTier(context, cwd = process.cwd()) {
	const version = (sha) =>
		JSON.parse(
			execFileSync(
				"git",
				["show", `${commit(sha)}:src/packages/css-lib/package.json`],
				{ cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
			),
		).version;
	const decision = selectCssCiTier({
		previous: version(context.before),
		current: version(context.after),
		minimumTier: context.minimumTier,
	});
	return {
		...decision,
		before: context.before,
		after: context.after,
		release: context.canStage && decision.change !== "none",
	};
}
if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	const eventName = process.env.GITHUB_EVENT_NAME;
	const context = resolveCiEvent({
		eventName,
		event: JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")),
		sha: process.env.GITHUB_SHA,
		ref: process.env.GITHUB_REF,
		mainSha:
			eventName === "workflow_dispatch"
				? execFileSync("git", ["rev-parse", "refs/remotes/origin/main"], {
						encoding: "utf8",
					}).trim()
				: undefined,
	});
	// Checkout fetches history, but fork PR heads may not be in a local branch.
	for (const sha of [context.before, context.after]) {
		try {
			execFileSync("git", ["cat-file", "-e", `${sha}^{commit}`], {
				stdio: "ignore",
			});
		} catch {
			execFileSync("git", ["fetch", "--no-tags", "origin", sha], {
				stdio: "inherit",
			});
		}
	}
	const decision = selectEventTier(context);
	if (process.env.GITHUB_OUTPUT)
		appendFileSync(
			process.env.GITHUB_OUTPUT,
			Object.entries(decision)
				.map(([key, value]) => `${key}=${value}\n`)
				.join(""),
		);
	if (process.env.GITHUB_STEP_SUMMARY)
		appendFileSync(
			process.env.GITHUB_STEP_SUMMARY,
			`### CI selection\nCSS ${decision.previous} → ${decision.current}: **${decision.tier === "none" ? "lint and build only" : decision.tier}** (${decision.change}; minimum ${context.minimumTier}).\n`,
		);
	console.log(JSON.stringify(decision));
}
