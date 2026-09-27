# Badges and coverage

The active CSS library has no meaningful numeric code-coverage measure. Its
specimen demonstrates visual behavior, while CI checks and builds the package.
Do not add a coverage-percentage badge for CSS merely to reuse an old secret.
If a concise health signal is useful, GitHub's [native workflow status
badge](https://docs.github.com/en/actions/how-tos/monitor-workflows/add-a-status-badge)
reports CI status without another credential or service; it is not a coverage
badge.

## What the former Svelte badge did

The retired Svelte workflow ran test coverage on `main`, extracted its
percentage with `MishaKav/jest-coverage-comment`, and used
`schneegans/dynamic-badges-action` plus the repository secret `GIST_SECRET` to
write a Shields-compatible JSON file to a [public
Gist](https://gist.github.com/Barbacoa08/0549c337c501b3d5d709f55341796e15).
The Svelte README displayed that JSON through a
[Shields endpoint badge](https://shields.io/badges/endpoint-badge). This gave
readers an at-a-glance coverage value without committing generated badge files.

That Gist last changed in December 2023 and its `100%` value is historical,
not a current project metric. The Svelte workflow and badge were removed when
the library was retired. The `GIST_SECRET` repository secret has since been
deleted; no current workflow uses it. Deleting the repository secret does not
establish whether its underlying GitHub token is still valid. Verify the old
token's status separately if it can be identified.

## When a library returns

First add useful behavior and accessibility tests and a reproducible coverage
report. Decide whether a persistent percentage actually helps maintainers; CI
status and a [job summary](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#adding-a-job-summary)
or pull-request coverage comment may be enough. For a simple pass/fail badge,
prefer GitHub's native workflow badge.

If a numeric coverage badge and history are valuable, evaluate a dedicated
coverage service such as [Codecov](https://docs.codecov.com/docs/status-badges)
against the extra external service and upload permissions. The old
Gist-and-Shields pattern remains viable for a small public project when a
separate service is undesirable, but it requires a GitHub token that can write
the Gist. If choosing it, create a new repository secret backed by a
time-limited token granting only the needed [Gists write
permission](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens#user-permissions-for-gists),
pin the action to a reviewed commit, and update the
badge only from a trusted `main` workflow after coverage succeeds. Do not make
the write token available to untrusted pull-request code. Confirm that the
badge links to the relevant test results and does not silently show stale data.
