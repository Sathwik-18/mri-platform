# NeuroScope

AI-powered MRI diagnostics platform for neurodegenerative disease detection.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Setup database

Run the SQL files in your Supabase project:
1. `database/01-create-tables.sql`
2. `database/02-rls-policies.sql`

### 4. Run the app

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
mri-platform/
├── frontend/          # Next.js app
│   └── src/
│       ├── app/       # Pages & API routes
│       ├── components/
│       └── lib/
└── database/          # SQL schema & seed data
```
