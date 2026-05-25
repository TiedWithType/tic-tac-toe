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
- `src/app.config.ts` and `.vercel/versions.json` must be updated together for every release.
- When footer or menu version text is rendered statically in HTML, update `src/index.html` in the same release commit.

## Source Naming Rules

Class-based TypeScript modules must use lowercase dot-separated filenames matching the class role:

- `GameView` -> `game.view.ts`
- `GameController` -> `game.controller.ts`
- `AudioService` -> `audio.service.ts`
- `SettingsService` -> `settings.service.ts`

Keep service classes in `src/services`, UI classes in `src/ui`, game logic in `src/game`, and orchestration/controller code in `src/core` unless a feature clearly needs a new boundary.

## Major Release Rules

A `MAJOR` release must include at least one meaningful breaking or structural change, such as:

- storage schema changes,
- gameplay flow changes,
- app shell or deployment changes,
- config structure changes,
- module boundary changes.

For every major release:

- document breaking changes in `.vercel/versions.json`,
- add migration notes if localStorage or config changes,
- update static version labels in `src/index.html`,
- run the production build before commit,
- keep the next codename alphabetical.

## Storage Migration Rules

If localStorage structure changes:

- add a schema version,
- migrate previous settings when reasonable,
- clear incompatible data only intentionally,
- describe migration behavior in release notes.

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

- Update `src/app.config.ts` version fields.
- Update `.vercel/versions.json`.
- Update static version text in `src/index.html` when present.
- Confirm the footer shows the expected app name, version, release, codename, and author.
- Run the production build.
- Use the same version in commit message, tag, and deployment notes.
