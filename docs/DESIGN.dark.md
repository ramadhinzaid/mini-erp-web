---
name: ErgoSoft Dark
colors:
  surface: '#081425'
  surface-dim: '#081425'
  surface-bright: '#2f3a4c'
  surface-container-lowest: '#040e1f'
  surface-container-low: '#111c2d'
  surface-container: '#152031'
  surface-container-high: '#1f2a3c'
  surface-container-highest: '#2a3548'
  on-surface: '#d8e3fb'
  on-surface-variant: '#c1c7d3'
  inverse-surface: '#d8e3fb'
  inverse-on-surface: '#263143'
  outline: '#8b919d'
  outline-variant: '#414751'
  surface-tint: '#a4c9ff'
  primary: '#a4c9ff'
  on-primary: '#00315d'
  primary-container: '#60a5fa'
  on-primary-container: '#003a6b'
  inverse-primary: '#0060ac'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#bdc2ff'
  on-tertiary: '#131e8c'
  tertiary-container: '#909aff'
  on-tertiary-container: '#1f2994'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#e0e0ff'
  tertiary-fixed-dim: '#bdc2ff'
  on-tertiary-fixed: '#000767'
  on-tertiary-fixed-variant: '#2f3aa3'
  background: '#081425'
  on-background: '#d8e3fb'
  surface-variant: '#2a3548'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1280px
---

## Brand & Style
The design system transitions into a sophisticated, low-fatigue environment while maintaining its signature "comfy" and "solid" personality. The aesthetic leans into a **Corporate Modern** style with **Tonal Layering**, prioritizing ergonomic visual comfort for long-duration usage. 

The target audience consists of professionals and power users who require high focus without ocular strain. The UI evokes a sense of reliability and stability through substantial, well-defined surfaces and a grounded color palette. By utilizing deep charcoals rather than pure blacks, the interface maintains a soft, approachable feel that prevents the "stark" vibration often found in high-contrast dark modes.

## Colors
The dark mode palette is anchored by "Midnight Navy" (`#0F172A`) for the base background to provide a deep, calming foundation. Surfaces use "Slate Gray" (`#1E293B`) to create a solid, physical presence for cards and containers.

Primary accents are shifted to a more luminous "Sky Blue" (`#60A5FA`) to ensure WCAG AA compliance against dark backgrounds. Secondary elements utilize muted cool grays to maintain the "comfy" aesthetic, while tertiary colors are reserved for subtle highlights and state indications. All colors are desaturated by 10-15% compared to light mode equivalents to prevent glowing artifacts and visual vibration.

## Typography
The system utilizes **Inter** exclusively to ensure a systematic, utilitarian, and highly legible experience. In dark mode, font weights are slightly adjusted; bold weights are used sparingly to prevent "ink spread" on backlit displays. 

Tracking (letter spacing) is slightly increased for body text at smaller sizes to improve character recognition against dark backgrounds. Headline scales are tight and impactful, providing a solid architectural anchor to the page layout.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop and a **Fluid Grid** on mobile. A 12-column system is used for desktop with a maximum container width of 1280px to maintain comfortable line lengths for reading.

Spacing follows a strict 4pt / 8pt rhythmic scale. Generous internal padding (MD or LG) is applied to "solid" containers to reinforce the comfortable, breathable feel of the interface. On mobile, margins shrink to 16px to maximize screen real estate, while gutters remain constant at 20px to ensure clear separation of content blocks.

## Elevation & Depth
Elevation in this dark system is communicated through **Tonal Layers** rather than heavy shadows. Higher elevation is represented by lighter surface colors (moving from Deep Navy to Slate Gray). 

When shadows are necessary for floating elements (like dropdowns or modals), they are implemented as **Ambient Shadows** using a dark blue tint (`#020617`) with a 40% opacity and a large 24px blur. This creates a soft "lift" without looking muddy. Subtle 1px borders using a slightly lighter gray (`#334155`) are used on cards to maintain definition where tonal contrast is low.

## Shapes
Following the requirement for a "solid" yet "comfy" feel, the system uses a consistent **8px (0.5rem)** corner radius for standard UI elements like buttons and input fields. Larger containers like cards utilize the `rounded-lg` (1rem) token to emphasize their role as primary content holders. This moderate roundness avoids the clinical feel of sharp corners while remaining professional and structured.

## Components

- **Buttons**: Primary buttons use a solid Sky Blue background with dark text for maximum legibility. Secondary buttons use a ghost style with a 1px Slate border and light text.
- **Input Fields**: Backgrounds are set to a slightly darker shade than the surface (`#0F172A`) to create an "inset" feel. Borders use the Slate Gray (`#334155`) and glow with a soft primary halo when focused.
- **Cards**: Defined by a solid Slate Gray surface (`#1E293B`) and an 8px radius. In dark mode, cards should not have prominent shadows unless they are meant to be interacted with (hover states).
- **Lists**: Items are separated by subtle dividers (`#1E293B`) or use alternating tonal backgrounds for data-heavy views.
- **Chips**: Use a low-opacity primary tint (15% opacity) with high-contrast text labels to provide color without overwhelming the dark aesthetic.
- **Checkboxes & Radios**: Use the solid Primary Blue for "on" states, ensuring a high-contrast tick mark or dot in the background color.