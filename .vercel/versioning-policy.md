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
- `RELEASE` must be one of: `alpha`, `beta`, `preview`, `rc`, `stable`.
- Releases with `MAJOR` lower than `5` may use `alpha`, `beta`, `rc` or `stable`.
- Releases starting with `5.0.0` must use `preview` instead of `beta` unless this policy is intentionally revised.
- Every release must have exactly one entry in `.vercel/versions.json`.
- `.vercel/versions.json`, README release documentation and static version labels in UI component templates must be updated together for every release.
- The `version` object in `src/components/app-footer/app-footer.component.ts` must match the latest `current` release in `.vercel/versions.json`.
- The `commit_message` stored in `.vercel/versions.json` is authoritative and must be used exactly for the release commit.

## Release Registry Rules

Every release entry in `.vercel/versions.json` must include:

- `version` with `major`, `minor`, `patch` and `release`.
- `codename`.
- `codename_letter`.
- `status`.
- `scope`.
- `summary`.
- `commit_message`.
- `notes`.

Additional fields are required when relevant:

- `breaking_changes` for every `MAJOR` release.
- `migration_notes` when localStorage, install metadata, config, routing or persisted user-facing behavior changes.

Release registry rules:

- There must be exactly one `current` release.
- All older shipped releases must use `previous`.
- Planned releases must stay outside `releases`, under `planned_releases` or `planned_codenames`.
- `commit_message` must use the format `type: concise release summary (vMAJOR.MINOR.PATCH Codename)`.
- Use `feat` for `MAJOR` and `MINOR` releases, `fix` for `PATCH` releases, and `chore` only for metadata-only or initial registry releases.
- `commit_message` must substantially overlap with the release `summary`, `breaking_changes`, `migration_notes` and/or the most important `notes`; do not use generic messages like `release vX.Y.Z Codename`.
- The release commit, tag and deployment notes must use the same version and codename as the registry entry.

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
- add a `commit_message` in `.vercel/versions.json`,
- add migration notes if localStorage or config changes,
- update static version labels in UI component templates,
- run the production build before commit,
- keep the next codename alphabetical.

## Storage Migration Rules

If localStorage structure changes:

- add a schema version,
- migrate previous settings when reasonable,
- clear incompatible data only intentionally,
- describe migration behavior in release notes.

## Codename Rules

Current codename theme: alphabetical desserts.

Rules:

- Codenames advance alphabetically by release line: A, B, C, and so on.
- Use short Title Case names, ideally one or two words.
- Do not reuse a codename once it has shipped.
- Patch-only releases usually keep the same codename as their parent release.
- If a patch is notable enough to need a new codename, it must use the next available letter.
- The historical `1.0.0 alpha` codename is allowed to remain `First Move`; dessert codenames start with the next release.

Current cycle suggested sequence:

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
K: Key Lime Pie
```

## Version Cycle Rollover

The current version cycle runs from `1.0.0` through `9.9.9`.

When `9.9.9` has shipped:

- the next shipped version starts a new version cycle from `1.0.0`,
- the new cycle must be distinguishable in `.vercel/versions.json` with a cycle field such as `"version_cycle": 2`,
- release labels may still show `v.1.0.0`, but registry entries, deployment notes and README release notes must mention the cycle when needed to avoid ambiguity,
- the codename theme must change to a new single domain and restart alphabetically,
- patch releases in the new cycle usually keep the parent codename, following the same patch rule as the current cycle.

Next cycle codename theme: alphabetical space missions and probes.

Suggested next-cycle sequence:

```text
A: Apollo
B: BepiColombo
C: Cassini
D: DART
E: Euclid
F: Fermi
G: Galileo
H: Hubble
I: InSight
J: Juno
K: Kepler
L: Lucy
```

## Release Checklist

Before tagging or deploying a release:

- Update `.vercel/versions.json`.
- Confirm each release entry has a `commit_message`.
- Use the current release entry's `commit_message` exactly as the git commit message.
- Confirm `src/components/app-footer/app-footer.component.ts` has a `version` object matching the current `.vercel/versions.json` release.
- Update static version text in UI component templates when present.
- Update README release/versioning notes when the release changes architecture, user-visible behavior, tooling, install behavior or the documented release process.
- Confirm the footer shows the expected app name, version, release, codename, and author.
- Run the production build.
- Use the same version in commit message, tag, and deployment notes.
