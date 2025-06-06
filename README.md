# Migration Command Center - Website Migration Tracker

A full-stack application built with the T3 Stack to track the status and communication history of website migration projects. This tool allows authenticated users to manage a list of websites, update their migration progress, and log all related communications.

---

## ✨ Features

- **Secure User Authentication:** Login via Discord using NextAuth.js.
- **Website Management (CRUD):** Add, view, edit, and delete website migration projects.
- **Status Tracking:** Each website has a `migrationStatus` to track progress from "Pending Outreach" to "Complete".
- **Communication Logging (CRUD):** For each website, create, view, edit, and delete timestamped communication logs (e.g., emails, chats).
- **User-Specific Logging:** Each communication log is automatically associated with the logged-in user who created it.
- **Responsive UI:** Clean and functional interface built with Tailwind CSS.
- **Full-stack Type-Safety:** End-to-end type safety between the frontend and backend thanks to tRPC and Zod.

---

## 🛠️ Tech Stack

This project is built on the T3 Stack and uses the following technologies:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **API Layer:** [tRPC](https://trpc.io/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Discord Provider)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Schema Validation:** [Zod](https://zod.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)
- A [Supabase](https://supabase.com/) account for the database.
- A [Discord](https://discord.com/developers/applications) application for OAuth.

### Installation & Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/jamesfulreader/migration-command-center.git
    cd migration-command-center
    ```

2. **Install dependencies:**

    ```bash
    pnpm install
    ```

3. **Set up the database:**
    - Go to [Supabase](https://supabase.com/) and create a new project.
    - Navigate to **Project Settings > Database**.
    - Under **Connection string**, find the URI that is compatible with Prisma (it will end with `?pgbouncer=true`). You will use this for your `DATABASE_URL`.

4. **Set up environment variables:**
    - Create a new file named `.env.local` in the root of your project.
    - Copy the contents of `.env.example` (if you have one) or use the template below and fill in the values.

    ```env
    # .env.local

    # Prisma / Supabase
    # Get this from your Supabase project's Database settings (the Prisma-compatible one)
    DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-SUPABASE-HOST]:6543/postgres?pgbouncer=true"

    # NextAuth.js
    # You can generate a secret with: openssl rand -base64 32
    NEXTAUTH_SECRET="[YOUR_NEXTAUTH_SECRET]"
    NEXTAUTH_URL="http://localhost:3000"

    # NextAuth.js Discord Provider
    # Get these from your Discord Developer Portal application
    DISCORD_CLIENT_ID="[YOUR_DISCORD_CLIENT_ID]"
    DISCORD_CLIENT_SECRET="[YOUR_DISCORD_CLIENT_SECRET]"
    ```

5. **Push the database schema:**
    - This command will sync your Prisma schema with your Supabase database, creating the necessary tables and columns.

    ```bash
    pnpm prisma db push
    ```

6. **Run the development server:**

    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You should be able to log in with Discord and start using the app!

---

## 🚢 Deployment

This application is configured for easy deployment on [Vercel](https://vercel.com/).

1. **Import Project:** Import your Git repository into Vercel. It will automatically detect the Next.js framework.
2. **Configure Environment Variables:** In the Vercel project settings, add all the environment variables from your `.env.local` file.
    - **IMPORTANT:** You must update `NEXTAUTH_URL` to your production Vercel URL (e.g., `https://[your-project-name].vercel.app`).
3. **Update Discord OAuth Redirect URL:** In your Discord Developer Portal, add a new Redirect URI pointing to your production app: `https://[your-project-name].vercel.app/api/auth/callback/discord`.
4. **Deploy:** Vercel will build and deploy your application. Any subsequent pushes to your `main` branch will trigger automatic redeployments.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

James Fulreader - [jamesfulreader@gmail.com](mailto:jamesfulreader@gmail.com)
