import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const tiers = ["none", "light", "heavy"];
function parseVersion(value) {
	const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value ?? "");
	if (!match) throw new Error("CI requires stable MAJOR.MINOR.PATCH versions");
	return match.slice(1).map(BigInt);
}
export function selectCssCiTier({ previous, current, minimumTier = "none" }) {
	const before = parseVersion(previous);
	const after = parseVersion(current);
	if (!tiers.includes(minimumTier)) throw new Error("Unknown minimum CI tier");
	const changed = before.findIndex((part, i) => part !== after[i]);
	if (changed !== -1 && after[changed] < before[changed])
		throw new Error(
			"CSS version must not decrease; update the branch against its target",
		);
	const change = changed === -1 ? "none" : ["major", "minor", "patch"][changed];
	const automatic = change === "none" ? 0 : change === "patch" ? 1 : 2;
	return {
		previous,
		current,
		change,
		tier: tiers[Math.max(automatic, tiers.indexOf(minimumTier))],
	};
}
if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	const [previous, current, minimumTier = "none"] = process.argv.slice(2);
	const decision = selectCssCiTier({ previous, current, minimumTier });
	if (process.env.GITHUB_OUTPUT)
		appendFileSync(
			process.env.GITHUB_OUTPUT,
			`tier=${decision.tier}\nchange=${decision.change}\n`,
		);
	console.log(JSON.stringify(decision));
}
