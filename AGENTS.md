# CSS library working instructions

Read the root README and the CSS package README for the active package, supported markup, browser checks, and release workflow. Follow `.project/README.md` for local planning records; do not force-add those records to Git.

## Scope and responsibilities

- Keep personal model selections, versions, and reasoning settings outside this repository. Describe assignments through their scope, required expertise, and acceptance criteria.
- Keep bounded component corrections, specimen improvements, and rendered comparisons focused on the approved behavior and public markup contract. Preserve semantics, interaction states, and documented customization points.
- Evaluate shared selectors, specificity, tokens, directionality, compiled CSS, and consumer compatibility beyond the changed example. A small CSS diff can affect the entire package. Keep broad design-system and build-pipeline decisions with the task's integrator.
- The library owns presentation and documented HTML patterns; consuming applications own state, persistence, synchronization, permissions, and business logic. Keep specimen-only JavaScript distinct from the shipped CSS package. Check current consumer decisions before applying historical adoption advice.

## Review and verification

- Preserve the approved review scope and count. Keep separately requested correctness and maintainability/extensibility reviews independent; do not automatically add a visual reviewer or per-task reviews. Supply independent reviewers with requirements, the diff, relevant surrounding code, and evidence limits, without the implementer's conclusions.
- Check both the source specimen and built-package behavior when relevant. Verify narrow layouts, wrapping, themes, directionality, zoom, targets, focus, accessible names, keyboard behavior, and disabled states affected by the change. Screenshots demonstrate appearance; they do not establish interaction correctness or actual screen-reader speech.
- Follow the README's build, browser, and release checks appropriate to the changed surface. Use meaningful regressions for behavior changes; documentation-only edits need content, link, and diff checks rather than wording-mirroring tests. Report actual evidence and distinguish automated browsers from installed-browser, assistive-technology, and physical-device acceptance.
- Keep application adoption separate from library publication. Preserve the existing PR review and staged package-release boundaries; completing a review does not authorize merging, npm publication, or consumer deployment.
