# Pulse — Instant Aesthetic Surveys

Pulse is a minimal, aesthetic single-page survey application inspired by Google Forms, designed specifically for preference-based surveys where **there are no right or wrong answers**.

Everything runs 100% in the browser — **no database, no backend, no sign-ups, and no accounts required**.

---

## ✨ Features

- **Zero-Backend Architecture**: The entire survey data is compressed using `pako` (zlib/deflate) and encoded directly into the URL hash (`/s#<hash>`). Links work on any device with zero server storage.
- **Admin Dashboard**: Accessible only via private admin link (`/admin#<secret-key>`). Allows pasting response codes from respondents, view aggregate bar/donut charts per question, search & filter responses, and export all submissions to CSV.
- **Respondent Flow**:
  - Requires Full Name, Age (5-100), and 10-digit Phone Number before starting.
  - Step-by-step questions with an animated progress bar and smooth transition animations.
  - Radio-style single selection or checkbox-style multi-selection cards with soft tap/hover micro-interactions.
  - Generates a compressed response code upon completion with one-click **Copy** and **Send via WhatsApp** buttons.
  - Prevents accidental re-submission on the same browser using `localStorage`.
- **Survey Builder**:
  - Reorder, duplicate, add, edit, and delete questions (2–6 options each).
  - Toggle between single choice and multiple choices.
  - Real-time live preview of the survey as you build it.
  - Generates shareable respondent link, private admin bookmark link, and QR code.
- **Aesthetic Design**:
  - Soft cream background (`#FAFAF8`), dark charcoal typography, and muted indigo accents.
  - Smooth micro-interactions powered by Framer Motion.
  - Responsive, mobile-first design.
  - Dark mode support with persistent theme toggle.
  - In-app toast notifications.

---

## 📁 Project Structure

```
pulse/
├── public/
│   └── favicon.svg           # Custom SVG favicon
├── src/
│   ├── assets/               # Static assets
│   ├── components/
│   │   ├── EmptyState.jsx    # Reusable empty state view
│   │   ├── Layout.jsx        # Sticky navigation header & theme toggle
│   │   ├── OptionCard.jsx    # Selectable card for single/multi answers
│   │   └── ProgressBar.jsx   # Animated survey progress indicator
│   ├── hooks/
│   │   ├── useTheme.jsx      # Dark/light theme provider
│   │   └── useToast.jsx      # Toast notification system
│   ├── pages/
│   │   ├── AdminResults.jsx  # Admin results dashboard (charts, table, CSV)
│   │   ├── Create.jsx        # Survey builder with live preview
│   │   ├── Home.jsx          # Landing page (Create or Join)
│   │   ├── MySurveys.jsx     # Locally saved surveys on this browser
│   │   ├── Published.jsx     # Shareable links & QR code display
│   │   ├── Survey.jsx        # Step-by-step respondent questionnaire
│   │   └── ThankYou.jsx      # Confirmation screen & WhatsApp sharing
│   ├── utils/
│   │   ├── encoding.js       # pako deflate/inflate & URL-safe base64 helpers
│   │   └── storage.js        # localStorage manager for surveys & responses
│   ├── App.jsx               # Route definitions
│   ├── index.css             # Tailwind layers and component styling
│   └── main.jsx              # Application entry point
├── index.html                # HTML template with Google Fonts (Inter & DM Sans)
├── package.json              # Dependencies and build scripts
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Custom design tokens, colors & animations
├── vercel.json               # SPA rewrite rules for Vercel
└── vite.config.js            # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or newer)
- npm or yarn

### Installation & Development

```bash
# Navigate to the pulse project directory
cd pulse

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🚢 Deploying to Vercel

Pulse is already configured for zero-configuration deployment to Vercel with SPA routing (`vercel.json`).

### Method 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy directly from the pulse directory
vercel
```

Follow the interactive prompts:
- **Set up and deploy?**: `Y`
- **Which scope?**: Choose your personal account or team
- **Link to existing project?**: `N`
- **What's your project's name?**: `pulse`
- **In which directory is your code located?**: `./`
- **Want to modify build settings?**: `N` (Vite presets will be automatically detected)

To deploy to production:
```bash
vercel --prod
```

### Method 2: Deploy via GitHub / GitLab / Bitbucket

1. Push the project repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Pulse survey app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** -> **"Project"**.
4. Import your GitHub repository.
5. In **Framework Preset**, ensure **Vite** is selected (root directory: `./` or `pulse`).
6. Click **Deploy**. Vercel will build and assign you an SSL-secured `.vercel.app` URL.
