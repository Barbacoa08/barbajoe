import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

function parseVersion(value, label) {
	const match = stableVersion.exec(value);
	if (!match) {
		throw new Error(`${label} must be a stable MAJOR.MINOR.PATCH version`);
	}
	return match.slice(1).map(BigInt);
}

function isHigher(candidate, baseline) {
	for (let index = 0; index < 3; index += 1) {
		if (candidate[index] !== baseline[index]) {
			return candidate[index] > baseline[index];
		}
	}
	return false;
}

export function decideCssRelease(previous, current, published) {
	const previousParts = parseVersion(previous, "Previous main version");
	const currentParts = parseVersion(current, "Current version");
	const publishedParts = parseVersion(published, "npm latest version");
	return {
		stage:
			isHigher(currentParts, previousParts) &&
			isHigher(currentParts, publishedParts),
		previous,
		current,
		published,
	};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	const [previous, current, published] = process.argv.slice(2);
	const decision = decideCssRelease(previous, current, published);
	if (process.env.GITHUB_OUTPUT) {
		appendFileSync(
			process.env.GITHUB_OUTPUT,
			`stage=${decision.stage}\nprevious=${previous}\ncurrent=${current}\n`,
		);
	}
	console.log(JSON.stringify(decision));
}
