# Noema Protocol - Branding Assets

## Organization Profile Images

### Banner (1280x640px)
- **File**: `banner.png`
- **Usage**: GitHub organization profile header
- **Design**: Dark gradient background with Noema Protocol logo and tagline
- **Colors**: Primary: #9945FF (Purple), Secondary: #14F195 (Green)

### Logo (512x512px)
- **File**: `logo.png`
- **Usage**: Organization avatar
- **Design**: Noema "N" symbol with circuit/neural network pattern
- **Background**: Transparent PNG

### Social Preview (1200x630px)
- **File**: `social-preview.png`
- **Usage**: GitHub social media cards, OpenGraph images
- **Design**: Logo + "Trust Infrastructure for AI Agents on Solana"

## Brand Colors

```css
/* Primary Colors */
--noema-purple: #9945FF;
--noema-green: #14F195;
--noema-dark: #0D0D0D;
--noema-light: #F8F9FA;

/* Accent Colors */
--noema-blue: #00D4FF;
--noema-orange: #FF6B35;
```

## Typography

- **Heading Font**: Inter Bold
- **Body Font**: Inter Regular
- **Code Font**: JetBrains Mono

## Creating the Images

To create professional branding assets, you can use:

1. **Figma** - Design tool (figma.com)
2. **Canva** - Quick templates (canva.com)
3. **Adobe Illustrator** - Professional design
4. **DALL-E / Midjourney** - AI-generated designs

### Design Guidelines

**Banner Design:**
- Dark gradient background (purple to dark blue)
- Noema Protocol logo (left side)
- Tagline: "Trust Infrastructure for AI Agents on Solana"
- Neural network/circuit pattern overlay (subtle)
- Solana logo badge (bottom right corner)

**Logo Design:**
- Letter "N" in geometric/tech style
- Circuit pattern integrated into letter form
- Gradient: purple to green
- Clean, modern, recognizable at small sizes

**Social Preview:**
- Centered logo
- Large tagline text
- Key features: "On-chain Validation • Reputation System • Verifiable AI"
- Stats: "X Agents Registered • Y Validations • Z TVL"

## Upload Instructions

Once images are created:

```bash
# Place images in this directory:
.github/profile/assets/
  ├── banner.png
  ├── logo.png
  └── social-preview.png

# Commit and push
git add .github/profile/assets/
git commit -m "Add Noema Protocol branding assets"
git push origin main
```

Then update organization settings at:
https://github.com/organizations/NoemaProtocol/settings/profile

- **Profile picture**: Upload `logo.png`
- **Banner**: Upload `banner.png` (under "Profile" section)

For repository social preview:
- Go to repository settings → Social preview
- Upload `social-preview.png`
