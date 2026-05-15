# SpendWise Mini

A lightweight personal expense tracker PWA built with React and Vite. Track your daily spending by category, visualise with charts, export to PDF, and install it on your phone's home screen — no backend required.

---

## Features

- Add expenses with a name, price, and category
- Live total spent counter (all-time)
- Category pie chart with per-period filtering
- Month and Year timeframe toggle with `‹ ›` arrow navigation to any past period
- Monthly income input per period — balance calculated automatically (green/red)
- Year view shows total annual income summed from all monthly entries (read-only)
- Category management — add, edit, delete, reorder (drag), custom emoji icon and color picker
- Mark expenses as completed (strikethrough)
- Delete individual expenses
- PDF export per period (income, expenses, balance, category breakdown, expense list)
- Glassmorphism dark UI — frosted glass cards, purple glow accents
- Fully responsive — tested on iPhone 12 Pro and desktop
- **PWA** — installable on iPhone/Android home screen, works offline
- Data persists across page refreshes via `localStorage`

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 8](https://vite.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite` plugin) |
| Charts | [Recharts 3](https://recharts.org/) |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| Icons | [Lucide React](https://lucide.dev/) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + Workbox |
| Language | JavaScript (JSX) |
| Persistence | Browser `localStorage` (no backend) |
| Testing | [Playwright](https://playwright.dev/) |

---

## Libraries

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.5 | Core UI library |
| `react-dom` | ^19.2.5 | React DOM renderer |
| `tailwindcss` | ^4.3.0 | Utility-first CSS framework |
| `@tailwindcss/vite` | ^4.3.0 | Tailwind CSS Vite integration |
| `recharts` | ^3.8.1 | Pie chart visualisation |
| `jspdf` | ^4.2.1 | Client-side PDF generation |
| `jspdf-autotable` | ^5.0.7 | Table support for jsPDF |
| `lucide-react` | ^1.14.0 | Icon components |
| `vite` | ^8.0.10 | Dev server and bundler |
| `@vitejs/plugin-react` | ^6.0.1 | React fast refresh + JSX transform |
| `vite-plugin-pwa` | ^1.3.0 | PWA manifest + Workbox service worker |
| `@playwright/test` | ^1.60.0 | End-to-end automated testing |
| `eslint` | ^10.2.1 | Code linting |

---

## Prerequisites

Make sure you have the following installed before proceeding:

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org/)
- **npm** v9 or later (bundled with Node.js)
- **Git** — [git-scm.com](https://git-scm.com/)
- **VS Code** — [code.visualstudio.com](https://code.visualstudio.com/)

Recommended VS Code extensions:
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

## Setup & Running Locally

### Windows

1. Install Node.js from [nodejs.org](https://nodejs.org/) (LTS version recommended). During install, make sure **"Add to PATH"** is checked.
2. Open **Command Prompt** or **PowerShell** and verify:
   ```
   node -v
   npm -v
   ```
3. Clone the repository:
   ```
   git clone https://github.com/aaimang/personal-expense-tracker.git
   cd personal-expense-tracker
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Start the development server:
   ```
   npm run dev
   ```
6. Open your browser and go to `http://localhost:5173/personal-expense-tracker/`

---

### macOS

1. Install Node.js via [Homebrew](https://brew.sh/) (recommended) or from [nodejs.org](https://nodejs.org/):
   ```
   brew install node
   ```
2. Verify the installation:
   ```
   node -v
   npm -v
   ```
3. Clone the repository:
   ```
   git clone https://github.com/aaimang/personal-expense-tracker.git
   cd personal-expense-tracker
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Start the development server:
   ```
   npm run dev
   ```
6. Open your browser and go to `http://localhost:5173/personal-expense-tracker/`

---

### Chromebook (Linux environment)

Chromebooks require the Linux development environment (Crostini) to be enabled.

1. Enable Linux: go to **Settings > Advanced > Developers > Linux development environment** and turn it on.
2. Open the **Terminal** app and update packages:
   ```
   sudo apt update && sudo apt upgrade -y
   ```
3. Install Node.js via `nvm` (Node Version Manager):
   ```
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc
   nvm install --lts
   ```
4. Verify the installation:
   ```
   node -v
   npm -v
   ```
5. Clone the repository:
   ```
   git clone https://github.com/aaimang/personal-expense-tracker.git
   cd personal-expense-tracker
   ```
6. Install dependencies:
   ```
   npm install
   ```
7. Start the development server:
   ```
   npm run dev
   ```
8. Open the Chrome browser and go to `http://localhost:5173/personal-expense-tracker/`

> **Note:** On Chromebook, VS Code can be installed inside Linux via the `.deb` package from [code.visualstudio.com](https://code.visualstudio.com/). After installing, launch it from the Linux apps section.

---

## Installing as a PWA (Home Screen)

SpendWise Mini is a fully installable Progressive Web App. Once deployed, it can be added to your phone's home screen and launched like a native app — no App Store required.

### iPhone / iPad (Safari only)

1. Open **Safari** and navigate to the deployed URL
2. Tap the **Share** button (box with arrow pointing up, bottom of screen)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. The app icon appears on your home screen — tap it to launch full screen

> Chrome on iOS does **not** support PWA installation. You must use Safari.

### Android (Chrome)

1. Open **Chrome** and navigate to the deployed URL
2. Tap the **three-dot menu** (top right)
3. Tap **"Add to Home screen"** or **"Install app"**
4. Tap **"Add"**

### What you get after installing

- Launches full screen with no browser address bar
- Works **offline** — all assets are cached by the service worker on first visit
- Auto-updates silently in the background when a new version is deployed
- App icon uses the SpendWise brand purple bolt design

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server with HMR |
| `npm run build` | Build for production (output in `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on the project |
| `npx playwright test` | Run the automated test suite (18 tests) |

---

## Project Structure

```
personal-expense-tracker/
├── public/
│   ├── favicon.svg
│   ├── pwa-icon.svg
│   ├── pwa-192.png          # PWA icon (Android/Chrome)
│   ├── pwa-512.png          # PWA icon (splash screen / maskable)
│   └── apple-touch-icon.png # PWA icon (iPhone home screen)
├── src/
│   ├── App.jsx              # Main app component (all features)
│   ├── main.jsx             # React entry point + service worker registration
│   └── index.css            # Global styles and Tailwind theme (glassmorphism)
├── tests/
│   └── spendwise.spec.js    # Playwright end-to-end tests (18 tests)
├── index.html               # HTML entry + PWA meta tags
├── vite.config.js           # Vite + PWA plugin config
├── playwright.config.js     # Playwright test config
├── package.json
└── eslint.config.js
```

---

## Testing

The project includes a [Playwright](https://playwright.dev/) automated test suite covering:

| Group | Tests |
|---|---|
| Income Per Period | Each month/year stores its own income value |
| Balance Math | Positive, negative, empty income, zero expenses |
| Arrow Navigation Isolation | Expenses scoped to their creation period |
| PDF Export | Generates correctly with and without expenses |
| Edge Cases | Form validation, delete, all-time total |

Run with:
```
npx playwright test
```

> The dev server must be running on port 5175 before running tests (`npm run dev`).

---

## License

MIT
