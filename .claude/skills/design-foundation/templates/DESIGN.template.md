---
version: alpha
name: <Your Design System Name>
description: <One-sentence summary of the brand feel and product context.>

colors:
  primary: "#000000"
  on-primary: "#FFFFFF"
  secondary: "#000000"
  on-secondary: "#FFFFFF"
  tertiary: "#000000"
  on-tertiary: "#FFFFFF"
  neutral: "#F5F5F5"
  surface: "#FFFFFF"
  on-surface: "#111111"
  error: "#B3261E"

typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.05em

rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 0 16px
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 0 16px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 40px
  card-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
---

# <Your Design System Name>

## Overview

Describe the brand personality, target audience, and the emotional response the UI should evoke. Is it playful or institutional? Dense or spacious? Soft or sharp? This sets the lens for every decision below.

## Colors

The palette is rooted in <describe the dominant feel: high-contrast neutrals, warm earth, cool techno, etc.> with <one | two | three> accent color(s) reserved for interaction.

- **Primary (#000000):** <When and where it appears.>
- **Secondary (#000000):** <Supporting role.>
- **Tertiary (#000000):** <Accent / call-to-action.>
- **Neutral (#F5F5F5):** <Background or canvas.>
- **Surface (#FFFFFF):** <Containment for grouped content.>

## Typography

<Name the font(s) and the role each plays. State pairing rationale: e.g. one humanist sans for prose, one geometric sans for data.>

- **Headlines:** <Weight, size hierarchy, intent.>
- **Body:** <Reading size, line-height target.>
- **Labels:** <Casing, tracking, where used.>

## Layout

The layout follows a <Fluid Grid | Fixed-Max-Width Grid | Safe-Area Driven> model with an <8px | 4px> base spacing unit.

- **Rhythm:** <How spacing tokens are sequenced.>
- **Grouping:** <How related items are grouped — cards, sections, lists.>
- **Breakpoints:** <Mobile / tablet / desktop intent.>

## Elevation & Depth

Depth is conveyed through <shadows | tonal layers | borders | backdrop-filter blur>.

- **Level 1 (base):** <Description.>
- **Level 2 (raised):** <Description.>
- **Level 3 (overlay / modal):** <Description.>

## Shapes

The shape language is <sharp / soft / mixed>.

- **Cards / containers:** `{rounded.lg}` (12px) for a friendly but composed feel.
- **Buttons / inputs:** `{rounded.md}` (8px) for compact controls.
- **Pills / avatars:** `{rounded.full}` for fully circular forms.

## Components

### Buttons

Primary buttons are the only solid-color call to action. Secondary buttons are outlined or surface-filled. Hover states shift to the next token in the related variant chain.

### Inputs

Text inputs share radius and height with buttons. Helper text uses `label-sm`; error text uses `colors.error`.

### Cards

Cards use `card-default` as the base. Use generous padding (`spacing.lg`) and a single radius (`rounded.lg`) across all card types for consistency.

## Do's and Don'ts

- **Do** use the primary color for the single most important action per screen.
- **Do** maintain WCAG AA contrast (4.5:1 normal, 3:1 large) on every text-on-color pair.
- **Don't** mix sharp and rounded corners in the same view.
- **Don't** introduce ad-hoc colors in component code — add a token instead.
- **Don't** stack more than two font weights on a single screen.
