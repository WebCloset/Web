# WEB CLOSET - Color Palette

This document outlines the complete color palette used in the WEB CLOSET application.

## Primary Colors

- **Primary Green**: `#7fb069` - Main brand color, used for buttons, links, and accents
- **Primary Dark**: `#6fa059` - Darker shade for hover states
- **Primary Light**: `#8fc079` - Lighter shade (available for future use)

## Neutral Colors

### Backgrounds
- **White**: `#ffffff` - Main background color
- **Gray Dark**: `#2a2a2a` - Footer background
- **Gray Medium**: `#3a3a3a` - Product button backgrounds
- **Gray**: `#4a4a4a` - Hover states for gray elements
- **Gray Lightest**: `#f5f5f5` - Light backgrounds for product cards

### Borders & Dividers
- **Border**: `#e0e0e0` - Standard border color
- **Border Light**: `#d0d0d0` - Lighter border for partner logos

### Text Colors
- **Text Primary**: `#1a1a1a` - Main text color (almost black)
- **Text Secondary**: `#666` - Secondary text and icons
- **Text Light**: `#999` - Placeholder text
- **Text White**: `#ffffff` - White text on dark backgrounds
- **Text Footer**: `#e0e0e0` - Footer text color

## Product Background Colors

- **Product Purple**: `#9b7fb8` - Background for leather bag product
- **Product Green**: `#7fb069` - Background for sneaker product (matches primary)
- **Product Gray**: `#f5f5f5` - Background for other products

## Usage

All colors are defined as CSS variables in `src/styles/colors.css` and can be accessed using:

```css
color: var(--color-primary);
background-color: var(--color-white);
```

For TypeScript usage, import from `src/styles/theme.ts`:

```typescript
import { colors } from './styles/theme'
const primaryColor = colors.primary
```

## Color Reference

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Primary | `#7fb069` | Buttons, links, active states |
| Primary Dark | `#6fa059` | Button hover states |
| White | `#ffffff` | Backgrounds, text on dark |
| Black | `#1a1a1a` | Main text, dark buttons |
| Gray Dark | `#2a2a2a` | Footer background |
| Gray Medium | `#3a3a3a` | Product buttons |
| Gray | `#4a4a4a` | Hover states |
| Gray Light | `#d0d0d0` | Inactive carousel dots |
| Gray Lighter | `#e0e0e0` | Borders, footer text |
| Gray Lightest | `#f5f5f5` | Light backgrounds |
| Product Purple | `#9b7fb8` | Product card background |
| Product Green | `#7fb069` | Product card background |



