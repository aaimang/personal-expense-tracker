# SpendWise Mini

A lightweight personal expense tracker built with React and Vite. Track your daily spending by category, with data persisted locally in the browser — no backend required.

---

## Features

- Add expenses with a name, price, and category
- Live total spent counter
- Mark expenses as completed (strikethrough)
- Delete individual expenses
- Data persists across page refreshes via `localStorage`
- Fully responsive, mobile-friendly dark UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 8](https://vite.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite` plugin) |
| Icons | [Lucide React](https://lucide.dev/) |
| Language | JavaScript (JSX) |
| Persistence | Browser `localStorage` (no backend) |

---

## Libraries

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.5 | Core UI library |
| `react-dom` | ^19.2.5 | React DOM renderer |
| `tailwindcss` | ^4.3.0 | Utility-first CSS framework |
| `@tailwindcss/vite` | ^4.3.0 | Tailwind CSS Vite integration |
| `lucide-react` | ^1.14.0 | Icon components |
| `vite` | ^8.0.10 | Dev server and bundler |
| `@vitejs/plugin-react` | ^6.0.1 | React fast refresh + JSX transform |
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
   git clone https://github.com/your-username/vibe-coding.git
   cd vibe-coding
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Start the development server:
   ```
   npm run dev
   ```
6. Open your browser and go to `http://localhost:5173`

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
   git clone https://github.com/your-username/vibe-coding.git
   cd vibe-coding
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Start the development server:
   ```
   npm run dev
   ```
6. Open your browser and go to `http://localhost:5173`

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
   git clone https://github.com/your-username/vibe-coding.git
   cd vibe-coding
   ```
6. Install dependencies:
   ```
   npm install
   ```
7. Start the development server:
   ```
   npm run dev
   ```
8. Open the Chrome browser and go to `http://localhost:5173`

> **Note:** On Chromebook, VS Code can be installed inside Linux via the `.deb` package from [code.visualstudio.com](https://code.visualstudio.com/). After installing, launch it from the Linux apps section.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server with HMR |
| `npm run build` | Build for production (output in `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on the project |

---

## Project Structure

```
vibe-coding/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # React entry point
│   └── index.css      # Global styles and Tailwind theme
├── index.html
├── vite.config.js
├── package.json
└── eslint.config.js
```

---

## License

MIT
