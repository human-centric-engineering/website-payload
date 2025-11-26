# Design Language reference for the HCE Studio website

Modern tech-focused aesthetic that balances slick professionalism with human-centric warmth. Dark theme is default.

## Colours

**Primary Palette:**
- Orange: `hsl(22 100% 46%)` / `rgb(235, 86, 0)` - Primary accent, CTAs, gradients
- Black: Deep dark `hsl(0 0% 5%)` for backgrounds (not pure black)
- White: `hsl(0 0% 100%)` for text on dark
- Dark grey: `hsl(0 0% 16%)` / `rgb(40, 40, 40)` for cards
- Light grey: `hsl(0 0% 85%)` / `rgb(218, 217, 217)` for muted text

**Semantic Usage:**
- Backgrounds: Deep dark (`bg-background`), cards at `bg-card` (8-16% lightness)
- Borders: Subtle with transparency (`border-border/30` to `border-border/50`)
- Text: White/foreground for primary, `text-foreground/80` for body, `text-muted-foreground` for less emphasis

## Typography

- **Font:** Geist Sans (primary), Geist Mono (code)
- **Headings:** Bold weights, generous line-height
  - H1: `text-5xl md:text-7xl font-bold` on heroes
  - H2: `text-4xl md:text-5xl font-bold` for sections
  - H3: `text-xl md:text-2xl font-bold` for cards
- **Body:** `text-sm md:text-base` or `text-base md:text-lg` with `leading-relaxed`
- **Gradient text:** Use `.text-gradient` utility class for accent headings

## Spacing & Layout

- **Containers:** Standard `container` class with responsive padding
- **Section spacing:** `my-16` to `my-20` between major blocks
- **Card padding:** `p-6 md:p-8` for comfortable breathing room
- **Border radius:** `rounded-lg` (buttons), `rounded-xl` (cards), `rounded-2xl` (large sections)

## Components

### Buttons
- **Default:** Orange gradient background, `h-11 px-6`, `rounded-lg`, subtle shadow on hover
- **Outline:** Transparent with orange border, fills on hover
- **Sizes:** `sm`, `default`, `lg` (use `lg` for primary CTAs)
- **Interaction:** `active:scale-[0.98]` for tactile feedback, `transition-all duration-200`

### Cards
- **Background:** `bg-card/30` default, `hover:bg-card/60` on hover
- **Borders:** `border-border/30` default, `hover:border-primary/50` on hover
- **Shadow:** `hover:shadow-xl hover:shadow-primary/10` for glow effect
- **Equal heights:** Use `h-full flex flex-col` on cards in grids

### Header
- Sticky with backdrop blur: `sticky top-0 bg-background/80 backdrop-blur-lg`
- Height: `h-20`, subtle bottom border `border-b border-border/40`

### Footer
- Background: `bg-card/30 backdrop-blur`, multi-column layout
- Divider before copyright: `border-t border-border/40`

### Heroes
- Dark overlays for readability: `bg-gradient-to-b from-black/60 via-black/40 to-black/60`
- Decorative blur accents: `bg-primary/20 blur-[120px]` for atmospheric glow
- Large padding: `py-32 md:py-40`

## Animations

**Scroll Animations:**
- Use `<ScrollReveal>` component for entrance effects
- Stagger delays: `delay={index * 100}` for sequential reveals
- Default: fade-in with slide-up (`translate-y-8` to `translate-y-0`)

**Built-in Utilities:**
- `.animate-fade-in` - Simple opacity fade
- `.animate-fade-in-up` - Fade with upward slide
- `.animate-scale-in` - Scale from 90% to 100%
- `.glow-orange` / `.glow-orange-sm` - Orange shadow glow effects

**Hover States:**
- Use `transition-all duration-300` for smooth changes
- Combine background, border, and shadow changes for depth
- Scale effects: `hover:scale-105` for logos/small elements

## Effects

- **Gradients:** `.bg-gradient-orange` for buttons, `.text-gradient` for headings
- **Glassmorphism:** Backdrop blur with semi-transparent backgrounds
- **Decorative blurs:** Large blurred circles (`w-64 h-64 blur-3xl`) for ambient lighting
- **Shadows:** Primary-tinted shadows (`shadow-primary/10`) for orange glow

## Principles

1. **Depth over flat:** Layer backgrounds, use transparency, add subtle shadows
2. **Warmth in tech:** Orange accents humanize dark, technical aesthetic
3. **Breathing room:** Generous padding and spacing prevent claustrophobia
4. **Progressive disclosure:** Animations reveal content as user scrolls
5. **Accessible contrast:** Maintain WCAG standards with foreground/background ratios
