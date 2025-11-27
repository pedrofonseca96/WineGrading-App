# 🍷 Wine Grading App

A real-time, bilingual (PT/EN) web application for hosting blind wine tasting events. This app allows a host to manage a tasting session while guests grade wines on their devices, culminating in a revealed presentation of the results.

## ✨ Features

- **Blind Tasting Flow:** Guests grade wines one by one without knowing their identity (e.g., "Wine #1").
- **Real-Time Synchronization:** The host controls the pace. When the host moves to the next wine, all guest devices update automatically.
- **Grading System:**
  - **Color:** 1-3 points
  - **Smell:** 1-7 points
  - **Taste:** 1-10 points
  - **Total:** Calculated automatically (Max 20)
- **Bilingual Support:** Full support for Portuguese (default) and English, with auto-detection and a manual toggle.
- **Presentation Mode:** A "Reveal" mode where the host displays the results on a big screen, revealing the wines and rankings one by one with dramatic flair.
- **Admin Controls:**
  - Create/Finish Events
  - Manage Wine Order
  - Edit Scores (if needed)
  - Control Presentation Flow

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Authentication:** Custom session-based auth (JWT)
- **Testing:** [Playwright](https://playwright.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local or cloud like Neon)

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
3.  Set the `DATABASE_URL` and `SESSION_SECRET` environment variables in Vercel.
4.  Deploy!

*Note: The `postinstall` script will automatically generate the Prisma client during deployment.*

## 📝 License

This project is for personal use.
