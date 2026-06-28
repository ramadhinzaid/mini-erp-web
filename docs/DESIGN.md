---
name: ErgoSoft Systems
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 24px
  gutter: 20px
---

## Brand & Style
The brand personality centers on reliability, cognitive ease, and professional comfort. Designed specifically for long-session ERP workflows, the visual narrative avoids high-energy "tech" tropes in favor of an "Analog Workspace" feel—clean, stable, and predictable.

The design style is **Corporate Modern with a Soft Focus**. It prioritizes utilitarian clarity through a "Low-Stress" interface. By utilizing a muted, warm-neutral foundation, the UI minimizes ocular strain (blue light fatigue) while maintaining enough structure to handle complex data density. Every element is intentional, designed to recede into the background until needed, ensuring the user's data remains the primary focus.

## Colors
The palette is anchored by "Paper White" (#FCFCFB), a slightly warm off-white that reduces glare compared to pure white. 

- **Primary Action:** A stable, calming blue used for main call-to-actions and active states.
- **Neutrals:** Warm greys are used for borders and secondary text to maintain a soft contrast ratio that meets AA accessibility standards without being jarring.
- **Semantics:** Success and Error colors are deep and desaturated. They provide clear status communication without the "neon" vibrance that causes visual alarm during prolonged use.
- **Surface Layering:** Uses subtle shifts in grey (Slate 50 to Slate 100) to define sections rather than heavy lines.

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-heavy environments. The hierarchy is strictly enforced to guide the user through complex forms.

- **Generous Leading:** Line heights are set at 1.5x for body text to prevent "line skipping" during data entry.
- **Weight Strategy:** Semi-bold (600) is reserved for headers to provide structural anchors, while Regular (400) handles all primary data display to keep the screen feeling "light."
- **Small Text:** Label-md uses a slight tracking increase to ensure readability at 12px for form captions and table headers.

## Layout & Spacing
The system follows a **Fixed-Fluid Hybrid** model. While the sidebar and navigation are fixed, the data workspace expands to fill the screen, utilizing a 12-column grid.

- **The 4px Rule:** All spacing (padding, margins, gaps) must be a multiple of 4px.
- **Ergonomic Padding:** Data tables use a minimum of 12px vertical padding (md) to ensure rows are easily scannable without feeling cramped.
- **Negative Space:** Large-scale sections are separated by 32px (xl) to create clear mental breaks between different functional areas of the ERP.

## Elevation & Depth
To minimize visual noise, the system avoids heavy shadows. Depth is achieved primarily through **Tonal Layering** and **Subtle Outlines**.

- **Level 0 (Base):** Background (#FCFCFB).
- **Level 1 (Cards/Work Areas):** White (#FFFFFF) with a 1px border (#E2E8F0). No shadow.
- **Level 2 (Popovers/Modals):** White with a very soft, desaturated shadow (0px 4px 12px rgba(0,0,0,0.05)).
- **Focus States:** A 2px solid primary-blue ring with a 2px offset. This is the only high-contrast depth element, used to highlight the active task.

## Shapes
The shape language is consistently **Soft**. A base radius of 8px (rounded-md) is applied to almost all interactive components.

- **Inputs & Buttons:** 8px radius to feel approachable and ergonomic.
- **Cards & Sections:** 12px-16px radius to frame large content blocks comfortably.
- **Interactive States:** Hovering over a list item or menu link should reveal a 6px rounded background highlight rather than a sharp change.

## Components
- **Buttons:** Solid fills for primary actions; "Ghost" styles (border only) for secondary. Text is always centered with 12px (sm/md) horizontal padding.
- **Input Fields:** 1px neutral border that transitions to primary blue on focus. Background is slightly greyed (#F1F5F9) when disabled to show clear inactivity.
- **Data Tables:** Zebra-striping is avoided; instead, use 1px bottom borders for rows. The header row should have a subtle grey background (#F8FAFC) to anchor the column names.
- **Chips/Badges:** Small, 12px font size, with highly desaturated background tints of their semantic color (e.g., light green background with dark green text).
- **Cards:** No heavy lifting—just a white surface, an 8px radius, and a subtle border. These are the containers for all functional modules.
- **Navigation:** A vertical sidebar using "Soft" highlights for active states. Icons should be "Line" style with a 2px stroke to match the typography's weight.