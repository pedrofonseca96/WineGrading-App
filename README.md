# 🍷 Wine Grading App

A real-time, bilingual (PT/EN) web application for hosting blind wine tasting events. This app allows a host to manage a tasting session while guests grade wines on their devices, culminating in a revealed presentation of the results.

## ✨ Features

- **Blind Tasting Flow:** Guests grade wines one by one without knowing their identity (e.g., "Wine #1").
- **Real-Time Synchronization:** The host controls the pace. Server-Sent Events (SSE) ensure that when the host moves to the next wine, all guest devices update immediately.
- **Grading System:**
  - **Color:** 1-3 points
  - **Smell:** 1-7 points
  - **Taste:** 1-10 points
  - **Total:** Calculated automatically (Max 20)
- **Bilingual Support:** Full support for Portuguese (default) and English, with auto-detection and a manual toggle.
- **Presentation Mode:** A "Reveal" mode for the big screen:
  - **Dramatic Reveal:** Wines are revealed one by one with animations.
  - **"Brought By" Feature:** Reveals who brought the wine (hidden until the dramatic moment).
  - **Live Scorecard:** A detailed leaderboard shown at the very end to prevent spoilers.
- **Results & Statistics:**
  - **Expandable Cards:** View detailed breakdowns of scores for each wine.
  - **History:** View past events and results.
- **Admin Controls:**
  - Create/Finish Events
  - Manage Wine Order & Images
  - Automatic Image Fetching (via Serper API)
  - Control Presentation Flow

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Compatible with Neon, Supabase, etc.)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication:** Custom session-based auth (JOSE/JWT)
- **Real-Time:** Server-Sent Events (SSE)
- **Testing:** [Playwright](https://playwright.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/wine-grading-app.git
    cd wine-grading-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
    SESSION_SECRET="your-super-secret-long-random-string"
    # Optional: For fetching wine images
    SERPER_API_KEY="your-serper-api-key"
    ```

4.  **Setup Database:**
    ```bash
    npx prisma db push
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

Run the end-to-end test suite to verify critical flows:

```bash
npx playwright test
```

## 📦 Deployment

This app is optimized for deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Set the `DATABASE_URL` and `SESSION_SECRET` environment variables.
4.  Deploy!

*Note: The `postinstall` script will automatically generate the Prisma client during deployment.*

## 📝 License

This project is for personal use.
