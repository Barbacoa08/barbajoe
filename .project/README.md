# Local project records

This directory is reserved for temporary, local planning and decision records. Only this README is tracked by Git. Every project directory beneath `.project/` is intentionally ignored and will not be available in other clones or Git history.

Create one descriptively named, sequentially numbered directory per project:

```text
.project/
  001-example-project/
    DECISIONS.md
    PLAN.md
```

Use `DECISIONS.md` for dated decisions, their context, and consequences. Use `PLAN.md` for the working scope, sequence, progress, and verification criteria.
Do not force-add local project records to Git.

Temporary review notes and screenshots may also live here. Publish the useful explanation and selected screenshot attachments on the relevant PR before cleaning up local files. Do not force-add evidence or create a tracked review archive; see the [repository review-evidence instructions](../AGENTS.md#review-evidence).
