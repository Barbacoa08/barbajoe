import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const expectedFiles = ["README.md", "dist/barbajoe.css", "package.json"];

export function checkCssPackage(summary, expectedVersion) {
	if (summary?.name !== "@barbajoe/css-lib") {
		throw new Error("Unexpected package name in dry-run tarball");
	}
	if (summary.version !== expectedVersion) {
		throw new Error("Dry-run tarball version does not match the release gate");
	}
	const files = summary.files?.map((file) => file.path).sort();
	if (JSON.stringify(files) !== JSON.stringify(expectedFiles)) {
		throw new Error(
			`Unexpected dry-run tarball files: ${JSON.stringify(files)}`,
		);
	}
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	const summary = JSON.parse(readFileSync(0, "utf8"));
	checkCssPackage(summary, process.argv[2]);
	console.log(`Checked @barbajoe/css-lib@${summary.version} package contents`);
}
