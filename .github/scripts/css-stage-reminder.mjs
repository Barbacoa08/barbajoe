import { fileURLToPath } from "node:url";

export async function createCssStageReminder({
	token,
	repo,
	previous,
	current,
	runUrl,
	assignee,
	fetchImpl = fetch,
}) {
	if (!token || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
		throw new Error("A GitHub token and valid repository are required");
	}
	if (!/^\d+\.\d+\.\d+$/.test(previous) || !/^\d+\.\d+\.\d+$/.test(current)) {
		throw new Error("The reminder requires stable package versions");
	}
	const title = `Approve @barbajoe/css-lib ${current} on npm`;
	const endpoint = `https://api.github.com/repos/${repo}/issues`;
	const headers = {
		Accept: "application/vnd.github+json",
		Authorization: `Bearer ${token}`,
		"X-GitHub-Api-Version": "2022-11-28",
	};

	for (let page = 1; ; page += 1) {
		const response = await fetchImpl(
			`${endpoint}?state=all&per_page=100&page=${page}`,
			{ headers },
		);
		if (!response.ok) {
			throw new Error(
				`Could not inspect existing reminder issues: ${response.status}`,
			);
		}
		const issues = await response.json();
		if (!Array.isArray(issues)) {
			throw new Error("GitHub returned an unexpected issues response");
		}
		const existing = issues.find(
			(issue) => !issue.pull_request && issue.title === title,
		);
		if (existing) return existing.html_url;
		if (issues.length < 100) break;
	}

	const body = [
		`The CSS package was staged on npm after a version increase: **${previous} → ${current}**. It is not public yet.`,
		"",
		`[Review the successful staging workflow](${runUrl}).`,
		"",
		"Sign in to [npm](https://www.npmjs.com/), open **Staged Packages**, inspect `@barbajoe/css-lib`, and approve or reject this version with your npm 2FA. Approval does not happen through this issue or its email notification.",
		"",
		"Close this issue after approval or rejection.",
	].join("\n");
	const response = await fetchImpl(endpoint, {
		method: "POST",
		headers: { ...headers, "Content-Type": "application/json" },
		body: JSON.stringify({ title, body, assignees: [assignee] }),
	});
	if (!response.ok) {
		throw new Error(
			`Could not create the staged-release reminder: ${response.status}`,
		);
	}
	return (await response.json()).html_url;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	const repo = process.env.GITHUB_REPOSITORY;
	const url = await createCssStageReminder({
		token: process.env.GITHUB_TOKEN,
		repo,
		previous: process.env.PREVIOUS_VERSION,
		current: process.env.CURRENT_VERSION,
		runUrl: `https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`,
		assignee: "Barbacoa08",
	});
	console.log(`Staged-release reminder: ${url}`);
}
