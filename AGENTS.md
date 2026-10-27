# Repository instructions

Use the root README and the CSS package README for the existing development, browser-review, and release requirements.

## Review evidence

- Keep change explanations, tradeoffs, reviewer findings, verification results, and testing limits in the relevant PR description or conversation. Preserve historical dates and actual reviewer attributions when moving an existing report.
- Upload selected before/after screenshots directly as GitHub PR attachments, and verify their links. Do not commit review screenshots or per-change review reports to the repository, recreate `docs/reviews/`, or introduce an equivalent archive elsewhere in the source tree.
- If attachment upload is unavailable, retain the files locally and report the limitation; do not use a source commit as an upload workaround.
- Keep temporary notes and captures in an ignored, numbered `.project/` directory. Bulk automated reports remain CI artifacts with the configured retention period; selected PR attachments must not depend on those expiring artifacts or branch-hosted files.
- Put lasting API, compatibility, accessibility, and design guidance in the relevant maintained README, code comments, or specimen. Keep historical execution logs with the PR.

These storage rules do not reduce the required review scope, tests, browser checks, or release approvals.
