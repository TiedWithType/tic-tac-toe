# Versioning Policy

This project uses Semantic Versioning for game releases and a small codename
registry for human-friendly release names.

## Version Format

Use the format:

```text
MAJOR.MINOR.PATCH RELEASE "CODENAME"
```

Example:

```text
1.1.0 beta "Apple Pie"
```

Rules:

- `MAJOR` changes for breaking gameplay, storage, deployment, or config changes.
- `MINOR` changes for new player-facing features, new modes, UI additions, or AI behavior changes.
- `PATCH` changes for bug fixes, copy tweaks, visual polish, and small compatibility fixes.
- `RELEASE` must be one of: `alpha`, `beta`, `rc`, `stable`.
- `.env` and `.vercel/versions.json` must be updated together for every release.

## Codename Rules

Codename theme: alphabetical desserts.

Rules:

- Codenames advance alphabetically by release line: A, B, C, and so on.
- Use short Title Case names, ideally one or two words.
- Do not reuse a codename once it has shipped.
- Patch-only releases usually keep the same codename as their parent release.
- If a patch is notable enough to need a new codename, it must use the next available letter.
- The historical `1.0.0 alpha` codename is allowed to remain `First Move`; dessert codenames start with the next release.

Suggested sequence:

```text
A: Apple Pie
B: Brownie
C: Cheesecake
D: Donut
E: Eclair
F: Fudge
G: Gelato
H: Honeycomb
I: Ice Cream
J: Jelly Roll
```

## Release Checklist

Before tagging or deploying a release:

- Update `.env` version fields.
- Update `.vercel/versions.json`.
- Confirm the footer shows the expected app name, version, release, codename, and author.
- Run the production build.
- Use the same version in commit message, tag, and deployment notes.
