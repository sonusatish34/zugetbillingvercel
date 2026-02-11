# Custom Tailwind Utility Classes

This file contains reusable custom utility classes that can be used throughout the application for consistent styling and easy maintenance.

## Benefits

1. **Consistency**: Same styles applied everywhere
2. **Maintainability**: Change once, update everywhere
3. **Dark Mode**: Built-in dark mode support
4. **Reusability**: Use across all components
5. **Future-Proof**: Easy to update and extend

## Available Custom Classes

### Card Styles
- `.card-base` - Base card styling with dark mode
- `.card-hover` - Hover effects for cards

### Button Variants
- `.btn-primary` - Primary button (purple)
- `.btn-secondary` - Secondary button
- `.btn-outline` - Outline button
- `.btn-ghost` - Ghost button

### Text Colors
- `.text-primary` - Primary text (dark in light, white in dark)
- `.text-secondary` - Secondary text
- `.text-muted` - Muted text
- `.text-accent` - Accent color (purple)

### Background Colors
- `.bg-primary` - Primary background
- `.bg-secondary` - Secondary background
- `.bg-accent` - Accent background (purple)
- `.bg-hover` - Hover background

### Sidebar Styles
- `.sidebar-item` - Base sidebar menu item
- `.sidebar-item-active` - Active sidebar item
- `.sidebar-item-inactive` - Inactive sidebar item
- `.sidebar-submenu-item` - Submenu item base
- `.sidebar-submenu-item-active` - Active submenu item
- `.sidebar-submenu-item-inactive` - Inactive submenu item

### Table Styles
- `.table-header` - Table header cell
- `.table-cell` - Table data cell
- `.table-row` - Table row with hover

### Badge/Status Styles
- `.badge-success` - Success badge (green)
- `.badge-warning` - Warning badge (yellow)
- `.badge-error` - Error badge (red)
- `.badge-info` - Info badge (blue)

### Utilities
- `.section-gap` - Standard section spacing
- `.section-gap-lg` - Large section spacing
- `.icon-container` - Icon button container
- `.icon-purple` - Purple icon color
- `.input-base` - Base input styling
- `.flex-center` - Flex center utility
- `.flex-between` - Flex space-between utility
- `.transition-base` - Base transition
- `.transition-smooth` - Smooth transition

## Usage Examples

```tsx
// Card
<div className="card-base p-6">Content</div>

// Button
<button className="btn-primary px-4 py-2">Click me</button>

// Text
<p className="text-primary">Main text</p>
<p className="text-secondary">Secondary text</p>

// Sidebar
<Link className="sidebar-item sidebar-item-active">Dashboard</Link>

// Table
<th className="table-header">Header</th>
<td className="table-cell">Data</td>
```

## How to Add New Custom Classes

Edit `src/styles/custom-utilities.css` and add your class in the `@layer utilities` block:

```css
@layer utilities {
  .your-custom-class {
    @apply base-styles dark:dark-styles;
  }
}
```

