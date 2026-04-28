---
name: design-foundation
description: Authoring, validating, and applying a project's visual design system through a DESIGN.md file (YAML design tokens + markdown rationale, per the google-labs-code/design.md alpha spec). Use whenever the user asks to create, scaffold, audit, refactor, lint, diff, export, or follow a design system / design guide / design foundation / design tokens for UI work — including phrases like "set up a design system", "make a design.md", "audit our tokens", "WCAG check the components", "export to Tailwind / DTCG".
---

# Design Foundation (DESIGN.md)

This skill teaches the agent to treat a single file — `DESIGN.md` at the repo root — as the **normative source of truth** for a project's visual identity. It is the format defined by [`google-labs-code/design.md`](https://github.com/google-labs-code/design.md) (alpha): YAML front-matter design tokens + markdown rationale, consumable by humans and by other coding agents.

When this skill is active, every UI-affecting change (components, styles, layouts, theming) must first consult `DESIGN.md`. Do not invent ad-hoc colors, fonts, radii, or spacings; reference tokens.

## When to use

Trigger on any of:

- "Create / set up / scaffold a design system, design guide, design foundation, design tokens."
- "Make / write / generate a `DESIGN.md`."
- "Audit / lint / validate / check WCAG / find broken refs in our design system."
- "Diff / compare two design systems / detect token regressions."
- "Export tokens to Tailwind theme / DTCG / `tokens.json`."
- Any UI build/refactor request in a repo that already has a `DESIGN.md` — read it first, then apply.

If the user asks for UI work and no `DESIGN.md` exists, propose creating one before coding components.

## Core mental model

A `DESIGN.md` has two layers:

| Layer | Role | Authority |
|---|---|---|
| YAML front matter (between `---` fences) | Machine-readable design tokens | **Normative**: exact values agents must use |
| Markdown body (`##` sections) | Human-readable rationale | Context for *why* and *how* tokens apply |

Tokens are referenced across the file with `{path.to.token}` syntax, e.g. `{colors.primary}`, `{rounded.md}`, `{typography.label-md}`.

## Token schema (cheat sheet)

```yaml
version: alpha            # optional
name: <string>            # required-ish; the design system name
description: <string>     # optional
colors:
  <token-name>: "#RRGGBB" # sRGB hex, quoted
typography:
  <token-name>:
    fontFamily: <string>
    fontSize: <Dimension>           # 48px | 1rem | 0.75em
    fontWeight: <number>            # 400, 600, 700
    lineHeight: <Dimension|number>  # 1.5 (multiplier) or 24px
    letterSpacing: <Dimension>      # -0.02em
    fontFeature: <string>           # font-feature-settings value
    fontVariation: <string>         # font-variation-settings value
rounded:
  <scale>: <Dimension>    # sm: 4px, md: 8px, lg: 12px, full: 9999px
spacing:
  <scale>: <Dimension|number>
components:
  <component-name>:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 12px
    size | height | width: <Dimension>
```

### Allowed component property names

`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`.
Anything else parses but emits a warning — only add custom properties when the agent and consumers agree on them.

### Variants

State variants are **separate component entries** with a related key, not nested objects:

```yaml
button-primary:
  backgroundColor: "{colors.primary}"
button-primary-hover:
  backgroundColor: "{colors.primary-container}"
button-primary-pressed:
  backgroundColor: "{colors.primary-fixed-dim}"
```

## Section order (required when present)

`##` headings must appear in this canonical order — sections may be omitted, but never reordered:

1. **Overview** *(alias: "Brand & Style")*
2. **Colors**
3. **Typography**
4. **Layout** *(alias: "Layout & Spacing")*
5. **Elevation & Depth** *(alias: "Elevation")*
6. **Shapes**
7. **Components**
8. **Do's and Don'ts**

An optional `#` H1 may title the document but is not parsed as a section. Duplicate `##` headings are an **error** and reject the file.

## Recommended (non-normative) token names

Use these names by default to maximize cross-tool/agent interoperability:

- **Colors:** `primary`, `secondary`, `tertiary`, `neutral`, `surface`, `on-surface`, `error`
- **Typography:** `headline-display`, `headline-lg`, `headline-md`, `body-lg`, `body-md`, `body-sm`, `label-lg`, `label-md`, `label-sm`
- **Rounded:** `none`, `sm`, `md`, `lg`, `xl`, `full`

## Workflows

### A. Authoring a new DESIGN.md

1. Confirm the file does not already exist; if it does, switch to **workflow C** (audit/refactor) instead of overwriting.
2. Ask the user (or infer from the brief) for: brand personality, target audience, key palette idea, font feel (modern/serif/geometric), corner softness, density.
3. Copy `templates/DESIGN.template.md` from this skill to the repo root as `DESIGN.md`.
4. Fill the YAML front matter first, then write each `##` section in canonical order. Keep prose short (3–6 bullets per section) — verbosity dilutes signal for agents.
5. Define at minimum: `colors.primary`, one typography token, one component (typically `button-primary`).
6. Run the linter (workflow D). Resolve every `error`; address `warning`s unless the user accepts them.

### B. Applying a DESIGN.md when building UI

1. **Read `DESIGN.md` before writing any UI code.** Treat its tokens as the only allowed source of color, type, spacing, radius, and component shape.
2. Translate token references to your stack:
   - **Tailwind**: extend `theme.colors`, `theme.fontFamily`, `theme.borderRadius`, `theme.spacing`, then use class names (`bg-primary`, `rounded-md`).
   - **CSS variables**: emit `:root { --color-primary: …; }` and reference with `var(--color-primary)`.
   - **CSS-in-JS / styled-components**: import a generated theme object.
3. Honor the prose: e.g. if Do's and Don'ts says "primary color only for the single most important action per screen," do not stamp it on every button.
4. If you genuinely need a value not in the system, **propose adding a token** rather than inlining a literal. Keep the file the source of truth.

### C. Auditing / refactoring an existing DESIGN.md

1. Read the file in full.
2. Run `npx @google/design.md lint DESIGN.md` (workflow D). Fix structural issues first.
3. Check semantic issues the linter doesn't catch:
   - Tokens with overlapping roles (two near-identical greys; `primary` and `accent` doing the same job).
   - Components hardcoding literal colors instead of `{colors.*}` references.
   - Missing dark-mode / inverse pairs (`on-primary`, `inverse-surface`) when the system implies dual-mode use.
   - Prose contradicting tokens (e.g. body says "8px grid" but `spacing` lists `7px`).
4. Propose a diff. Use `npx @google/design.md diff DESIGN.md DESIGN-v2.md` to get a structured regression report before merging.

### D. Linting & validation (CLI)

```bash
npx @google/design.md lint DESIGN.md             # default JSON output
npx @google/design.md lint --format json DESIGN.md
cat DESIGN.md | npx @google/design.md lint -     # stdin
```

Exit code: `1` on errors, `0` otherwise.

The seven active rules:

| Rule | Severity | Checks |
|---|---|---|
| `broken-ref` | **error** | `{path.to.token}` references resolve to a defined token |
| `missing-primary` | warning | A `primary` color exists when any colors are defined |
| `contrast-ratio` | warning | Component `backgroundColor`/`textColor` pairs meet WCAG AA (4.5:1) |
| `orphaned-tokens` | warning | Every defined color is referenced by at least one component |
| `missing-typography` | warning | At least one typography token exists when colors are defined |
| `section-order` | warning | `##` sections appear in the canonical order |
| `token-summary` | info | Token counts per section (informational) |
| `missing-sections` | info | Spacing/rounded absent when other tokens exist |

Programmatic equivalent:

```ts
import { lint } from '@google/design.md/linter';
const report = lint(markdownString);
report.findings;     // Finding[]
report.summary;      // { errors, warnings, info }
report.designSystem; // parsed DesignSystemState
```

### E. Diffing two versions

```bash
npx @google/design.md diff DESIGN.md DESIGN-v2.md
```

Reports added/removed/modified tokens per group and a `regression: boolean` flag. Exit code `1` on regression. Use this in PR review whenever `DESIGN.md` changes.

### F. Exporting tokens

```bash
npx @google/design.md export --format tailwind DESIGN.md > tailwind.theme.json
npx @google/design.md export --format dtcg     DESIGN.md > tokens.json
```

`dtcg` follows the [W3C Design Tokens Format](https://tr.designtokens.org/format/), interoperable with Figma variables and Style Dictionary.

### G. Spec on demand

```bash
npx @google/design.md spec                       # full spec as markdown
npx @google/design.md spec --rules               # spec + active linting rules
npx @google/design.md spec --rules-only --format json
```

Useful for piping the spec into another agent's prompt.

## Consumer behavior for unknown content

| Scenario | Behavior |
|---|---|
| Unknown `##` heading (e.g. `## Iconography`) | Preserve, no error |
| Unknown color token name | Accept if value is valid hex |
| Unknown typography token name | Accept as valid Typography object |
| Unknown spacing value (non-Dimension) | Accept; store as string |
| Unknown component property (e.g. `borderColor`) | Accept with warning |
| **Duplicate `##` heading** | **Error**; file is rejected |

## Hard rules the agent must follow

1. **Never hardcode** a color, font, radius, or spacing in component code if a corresponding token exists. Reference tokens.
2. **Never reorder** the canonical `##` sections.
3. **Never duplicate** a `##` heading — it rejects the whole file.
4. **Quote hex colors** in YAML (`"#1A1C1E"` not `#1A1C1E`) so the `#` doesn't become a comment.
5. **Use `{path.to.token}` references** in `components.*`; literal values are allowed but discouraged outside of one-off effects (gradients, alphas).
6. **Run the linter** after every edit to `DESIGN.md`; do not declare the change "done" until errors are zero.
7. **WCAG AA**: assume normal text needs 4.5:1, large text 3:1. The linter checks `backgroundColor`/`textColor` pairs only — verify other combinations manually.
8. The format is **alpha**. If a value seems missing from the schema, prefer extending via prose + a custom property over inventing new top-level YAML keys.

## Files in this skill

- `templates/DESIGN.template.md` — Empty, canonically-ordered scaffold to copy into a project.
- `references/spec.md` — Verbatim copy of the upstream `docs/spec.md` (alpha) for deep lookups.
- `references/example.md` — A complete worked example (`Atmospheric Glass` glassmorphism system) showing realistic token + prose interplay.

Read references on demand; they are not auto-loaded.
