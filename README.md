# 🚀 ConnectPro — Premium Professional Matchmaking & Marketplace Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-connect--pro--app.vercel.app-0052FF?style=for-the-badge&logo=vercel)](https://connect-pro-app.vercel.app)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

**ConnectPro** is a state-of-the-art, AI-enhanced professional matchmaking and service marketplace designed to connect elite professionals with clients looking for premium consulting, development, design, and specialized services.

✨ **[Experience the Live Web App Here](https://connect-pro-app.vercel.app)** ✨

---

## 🌟 Key Features

### 🔍 Discovery & Marketplace
- **Advanced Filtering & Search:** Filter top professionals by category, rating, price range, availability, and location.
- **Interactive Geo-Map (Leaflet):** Discover nearby professionals visually with custom interactive map markers.
- **Comprehensive Profiles:** Explore detailed portfolios, verified reviews, hourly rates, and specialized skills.

### 🤖 AI SmartHire Assistant
- **Intelligent Matchmaking:** Answer a few questions about your project scope, budget, and timeline, and let the AI recommendation engine instantly pair you with the best-fit professionals.

### 📅 Seamless Booking & Scheduling
- **Direct Appointments:** Book consultations, set calendar availability, and choose meeting formats (Video Call, In-Person, Audio Consultation).
- **Payment & Pricing Breakdown:** Transparent fee calculations, escrow-like service postings, and secure invoice handling.

### 💬 Real-Time Communications & Dashboard
- **Instant Messaging (Socket.io):** Real-time chat integration between clients and professionals.
- **Client & Professional Dashboard:** Manage active service postings, track appointment statuses, and view match history.
- **Customizable Settings:** Fully modular profile management, privacy controls, account security, and notification preferences.

### 🛡️ Enterprise Admin Command Center
- **Analytics & Metrics Overview:** Live revenue tracking, user acquisition statistics, and interactive charts (Recharts).
- **User & Verification Management:** Review KYC/professional verification requests, manage disputes, and oversee marketplace security.

---

## 💻 Tech Stack & Architecture

- **Frontend Core:** React 19, TypeScript, Vite
- **Styling & UI System:** Tailwind CSS, Radix UI, Framer Motion (for smooth micro-animations), Lucide Icons
- **State & Form Management:** React Hook Form, Zod validation schemas
- **Backend & Authentication:** Supabase (PostgreSQL, Auth, RLS Security Policies)
- **Real-Time Data & Mapping:** Socket.io Client, Leaflet & React-Leaflet
- **Data Visualization:** Recharts

---

## 🚀 Quick Start & Local Setup

To run this project locally on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/Kunalray0707/ConnectPro.git
cd ConnectPro
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials (see `.env.example`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server
```bash
npm run dev
```
Your local server will start at `http://localhost:5173`.

---

## 🌐 Deployment

The platform is configured for instant, zero-config deployment on Vercel:
- Production URL: **[https://connect-pro-app.vercel.app](https://connect-pro-app.vercel.app)**
- Build Command: Explicit Node execution on Vite entrypoint (`node node_modules/vite/bin/vite.js build`) to ensure robust cross-platform compatibility.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Kunalray0707/ConnectPro/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
