import assert from "node:assert/strict";
import { test } from "node:test";
import { createCssStageReminder } from "./css-stage-reminder.mjs";

const input = {
	token: "test-token",
	repo: "Barbacoa08/barbajoe",
	previous: "0.2.1",
	current: "0.3.0",
	runUrl: "https://github.com/Barbacoa08/barbajoe/actions/runs/123",
	assignee: "Barbacoa08",
};

test("creates an assigned reminder containing the staged version and run link", async () => {
	const requests = [];
	const fetchImpl = async (url, options) => {
		requests.push({ url, options });
		return {
			ok: true,
			status: options.method === "POST" ? 201 : 200,
			json: async () =>
				options.method === "POST"
					? { html_url: "https://github.com/Barbacoa08/barbajoe/issues/42" }
					: [],
		};
	};
	const url = await createCssStageReminder({ ...input, fetchImpl });
	assert.equal(url, "https://github.com/Barbacoa08/barbajoe/issues/42");
	assert.equal(requests.length, 2);
	const payload = JSON.parse(requests[1].options.body);
	assert.equal(payload.title, "Approve @barbajoe/css-lib 0.3.0 on npm");
	assert.deepEqual(payload.assignees, ["Barbacoa08"]);
	assert.match(payload.body, /0\.2\.1 → 0\.3\.0/);
	assert.match(payload.body, /actions\/runs\/123/);
});

test("does not create a second issue for a version already reminded", async () => {
	const requests = [];
	const fetchImpl = async (url, options) => {
		requests.push({ url, options });
		return {
			ok: true,
			status: 200,
			json: async () => [
				{
					title: "Approve @barbajoe/css-lib 0.3.0 on npm",
					html_url: "https://github.com/Barbacoa08/barbajoe/issues/7",
				},
			],
		};
	};
	assert.equal(
		await createCssStageReminder({ ...input, fetchImpl }),
		"https://github.com/Barbacoa08/barbajoe/issues/7",
	);
	assert.equal(requests.length, 1);
});

test("fails instead of claiming a reminder exists when GitHub rejects it", async () => {
	const fetchImpl = async (_url, options) => ({
		ok: options.method !== "POST",
		status: 403,
		json: async () => [],
	});
	await assert.rejects(createCssStageReminder({ ...input, fetchImpl }), /403/);
});
