# Fibr Grey Theme Documentation 🎨

## Overview
Fibr extension uses a sophisticated **grey & white design** with white accents, creating a refined and professional user experience. This theme maintains the core monochrome philosophy while transitioning main backgrounds to grey tones, keeping output cards white for optimal content focus.

## Core Color Palette

### Root CSS Variables
```css
:root {
    /* Backgrounds - Grey theme with white output cards for focus */
    --primary-bg: #f8f8f8;      /* Light grey - main background */
    --secondary-bg: #e8e8e8;    /* Medium grey - secondary backgrounds */
    --tertiary-bg: #d8d8d8;     /* Darker grey - tertiary elements */
    --message-bg: #f0f0f0;      /* Off-white grey - message backgrounds */

    /* Text Hierarchy */
    --text-primary: #000000;    /* Pure black - headings, primary text */
    --text-secondary: #666666;  /* Medium grey - secondary text, descriptions */
    --text-tertiary: #999999;   /* Light grey - hints, placeholders */

    /* Accent Colors */
    --accent-color: #404040;    /* Dark grey - primary accent, buttons */
    --accent-medium: #666666;   /* Medium grey - secondary accents */
    --accent-light: #999999;    /* Light grey - subtle accents */

    /* Borders */
    --border-color: #e0e0e0;    /* Light grey - default borders */
    --border-dark: #cccccc;     /* Medium grey - emphasized borders */

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.08);     /* Subtle lift */
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.12);   /* Medium elevation */
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.15);  /* High elevation */
}
```

## Component Styling

### Buttons

#### Primary Buttons
```css
.button-primary {
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-medium) 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-weight: 600;
    transition: all 0.2s ease;
}

.button-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}
```

#### Secondary Buttons
```css
.button-secondary {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 12px 24px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.button-secondary:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
}
```

### Modal Components (Onboarding Screens)

#### Demo Modal
```css
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: modalFadeIn 0.2s ease;
}

.modal-content {
    background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 100%);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
}

.modal-header {
    padding: 20px 24px;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.02) 100%);
    border-bottom: 1px solid var(--border-color);
}

.modal-body {
    padding: 24px;
    color: var(--text-primary);
}

.modal-footer {
    padding: 20px 24px;
    background: linear-gradient(135deg, var(--secondary-bg) 0%, var(--tertiary-bg) 100%);
    border-top: 1px solid var(--border-color);
}
```

#### Onboarding Info Section
```css
.onboarding-info {
    background: linear-gradient(135deg, var(--secondary-bg) 0%, var(--tertiary-bg) 100%);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
}

.onboarding-info h3 {
    color: var(--text-primary);
    font-weight: 600;
}

.onboarding-info li {
    color: var(--text-secondary);
    line-height: 1.5;
}

.onboarding-info strong {
    color: var(--text-primary);
    font-weight: 600;
}
```

### Cards and Content Areas

#### Twitter Cards
```css
.twitter-card {
    background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.25) 0%,
        rgba(255, 255, 255, 0.1) 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-lg);
}
```

#### Message Bubbles
```css
.user-message .content {
    background: var(--user-message-bg); /* Light grey gradient */
    color: var(--text-primary);
}

.assistant-message .content {
    background: var(--assistant-message-bg); /* Off-white gradient */
    color: var(--text-primary);
}
```

### Input Fields
```css
input, textarea {
    background: var(--secondary-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-primary);
}

input:focus, textarea:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}
```

## Design Philosophy

### Monochrome Benefits
- **Accessibility**: 21:1 contrast ratio exceeds WCAG AAA requirements
- **Performance**: Faster rendering without color calculations
- **Focus**: Directs attention to content rather than decorative colors
- **Timeless**: Won't feel dated as color trends change
- **Professional**: Conveys sophistication and seriousness

### Visual Hierarchy
1. **Pure Black (#000000)**: Primary text, headings, important actions
2. **Medium Grey (#666666)**: Secondary text, descriptions, icons
3. **Light Grey (#999999)**: Hints, placeholders, subtle accents
4. **Very Light Grey (#e0e0e0)**: Borders, separators
5. **White (#ffffff)**: Output cards, content focus areas
6. **Grey Scale (#f8f8f8 → #d8d8d8)**: Main backgrounds, creating depth

### Interactive States
- **Hover**: Subtle lift (translateY) with shadow increase
- **Active**: Slight scale down for tactile feedback
- **Focus**: Visible outline for keyboard navigation
- **Disabled**: Reduced opacity with cursor change

## Recent Additions

### Grey Theme Transition ✅
- **Background Variables**: Updated --primary-bg, --secondary-bg, --tertiary-bg, --message-bg to grey tones
- **Output Card Preservation**: Twitter cards and gallery cards maintain white backgrounds for content focus
- **Glassmorphism Effects**: Maintained white glassmorphism overlays for optimal contrast against grey backgrounds
- **Visual Hierarchy**: Enhanced depth through grey scale backgrounds while preserving white content areas

### Onboarding Screen Styling ✅
- **Demo Modal**: Complete modal styling with fade-in animations
- **Settings View**: Onboarding info section with proper theming
- **Button Consistency**: All buttons now use the monochrome palette
- **Modal Animations**: Smooth entrance effects for better UX

## Implementation Status

✅ **Completed Components:**
- Core color variables and palette (grey theme)
- Button styling (primary/secondary)
- Modal components (demo modal, tone selector)
- Card layouts (Twitter cards with white backgrounds, gallery)
- Input fields and forms
- Text hierarchy and typography
- Shadow and elevation system
- Onboarding screens (demo modal, settings)
- Grey theme transition with preserved white output cards

## Usage Guidelines

### For New Components
1. Always use CSS variables instead of hardcoded colors
2. Maintain the established shadow hierarchy
3. Use gradients for depth rather than flat colors
4. Ensure 21:1 contrast ratio for text accessibility
5. Test hover/focus states for all interactive elements

### Color Application Priority
1. **Text**: Use the established hierarchy (primary → secondary → tertiary)
2. **Backgrounds**: Layer from primary-bg → secondary-bg → tertiary-bg
3. **Borders**: Use border-color for subtle, border-dark for emphasis
4. **Accents**: Use accent-color sparingly for important actions

## Files Modified

- `popup.css` - Main extension styling
- `src/shared/styles/components.css` - Shared component styles
- `dist/web/styles.css` - Built web app styles
- `BLACK_WHITE_THEME_GUIDE.md` - Comprehensive conversion documentation

---

**Fibr Grey Theme v1.2** | Updated with Grey Theme Transition
