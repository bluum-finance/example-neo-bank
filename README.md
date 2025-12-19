# Neo Bank - Next.js Application

A modern banking application built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
BLUUM_API_BASE_URL=http://localhost:8080
BLUUM_API_KEY=your_api_key_here
BLUUM_SECRET_KEY=your_secret_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
example-neo-bank/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── (dashboard)/       # Dashboard pages with layout
│   ├── signin/            # Sign in page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities and helpers
├── services/              # API service clients
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features

- User authentication
- Investment portfolio management
- Savings plans
- Money transfers
- Card management
- Dashboard with transaction history

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Notifications**: Sonner

