# ActiveVista Frontend Client

The frontend client for ActiveVista is built with React 19, Vite 7, and Tailwind CSS v4, engineered for low-latency state synchronization and high-performance UI rendering.

---

## Technical Stack

* **Core Framework**: React 19 (`react`, `react-dom`)
* **Build Engine**: Vite 7 (`@vitejs/plugin-react`)
* **Styling Layer**: Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`)
* **Motion & Animation**: Framer Motion 12, Three.js, and HTML5 Canvas Simplex Noise Vector Engine
* **Component Architecture**: Radix UI Primitives (`@radix-ui/react-*`)
* **Form & Validation**: React Hook Form with Zod schema resolvers
* **State & Networking**: Axios with centralized HTTP interceptors, Zustand, and TanStack Query

---

## Getting Started

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## Architecture Standards

* **Glassmorphism Design System**: Custom void dark-mode tokens defined in `src/index.css`.
* **Component Isolation**: Reusable layout components partitioned under `src/components/`, page views under `src/pages/`, and networking abstractions under `src/api/`.
* **Accessibility**: Full compliance with WCAG standards enabled via Radix UI primitives.
