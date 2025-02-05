# Shadcn UI Setup with Vite+React+TS

## 1. Create Vite Project
- [ ] Initialize project in root directory:
  ```bash
  npm create vite@latest . -- --template react-ts
  ```
- [ ] Move generated files to `./frontend` directory

## 2. Install Dependencies
- [ ] Core:
  ```bash
  npm install @shadcn/ui
  ```
- [ ] Dev dependencies:
  ```bash
  npm install -D tailwindcss postcss autoprefixer @types/node
  ```

## 3. Configure Tailwind
- [ ] Initialize configs:
  ```bash
  npx tailwindcss init -p
  ```
- [ ] Update `tailwind.config.js`:
  ```javascript
  /** @type {import('tailwindcss').Config} */
  module.exports = {
    content: [
      "./frontend/index.html",
      "./frontend/src/**/*.{ts,tsx}",
      "./node_modules/@shadcn/ui/dist/**/*.js"
    ],
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: { "2xl": "1400px" }
      }
    },
    plugins: []
  }
  ```
- [ ] Add to `frontend/src/index.css`:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

## 4. TypeScript Configuration
- [ ] Update `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./frontend/src/*"]
      }
    }
  }
  ```
- [ ] Update `vite.config.ts`:
  ```typescript
  import path from "path"
  import react from "@vitejs/plugin-react"
  import { defineConfig } from "vite"

  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./frontend/src"),
      }
    }
  })
  ```

## 5. Initialize Shadcn
- [ ] Run setup:
  ```bash
  npx shadcn@latest init
  ```
  Choose options:
  ```
  ✔ Which style would you like to use? › New York
  ✔ Which color would you like to use as base color? › Zinc
  ✔ Do you want to use CSS variables for colors? … yes
  ```

## 6. Add Components from v0.dev
- [ ] Import prototype components:
  ```bash
  npx shadcn@latest add "https://v0.dev/chat/b/b_9KpvHSsHleF"
  ```

## 7. Verify Setup
- [ ] Start dev server:
  ```bash
  npm run dev
  ```
- [ ] Check components render correctly
- [ ] Verify Tailwind styles apply