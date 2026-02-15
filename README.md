# Praxis Simulation

The most advanced cross-functional business simulation platform for MBA capstones and corporate strategy labs.

## Overview

Praxis Simulation is a live, cross-functional enterprise simulation where strategy, finance, risk, and execution collide under uncertainty. Teams manage a company over 8 quarters, making decisions across 7 functional roles while responding to market events and competitive pressures.

### Key Features

- **Multi-round decisions** - Navigate 8 quarters of strategic choices with compounding consequences
- **Cross-functional roles** - Strategy, Marketing, Sales, Operations, R&D, Legal, and General Management
- **Competitive market + shocks** - Dynamic events including regulatory inquiries, price wars, and viral reviews
- **Facilitator console** - Control scenarios, inject events, compare teams, and export results
- **Debrief exports** - Board memos, decision timelines, and lessons learned
- **Seeded replay** - Deterministic simulation for comparing team performance

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Imomazin/praxis-simulation-core.git
cd praxis-simulation-core

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

### Environment Variables

Create a `.env.local` file for local development (optional):

```env
# Optional: Supabase for persistence (uses in-memory store if not set)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The app works without Supabase using in-memory storage (data resets on server restart).

## Project Structure

```
praxis-simulation-core/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page
│   │   ├── simulation/         # Player simulation view
│   │   ├── facilitator/        # Facilitator console
│   │   ├── debrief/            # Debrief & exports
│   │   └── api/                # API route handlers
│   ├── domain/
│   │   └── engine/             # Pure TypeScript game engine
│   ├── components/             # React components
│   ├── lib/                    # Utilities & storage
│   └── store/                  # Zustand client state
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/state` | GET | Get current game state |
| `/api/decide` | POST | Submit a role decision |
| `/api/advance` | POST | Advance by one quarter |
| `/api/reset` | POST | Reset simulation |
| `/api/export` | GET | Export data |

### Example: Submit a Decision

```bash
curl -X POST http://localhost:3000/api/decide \
  -H "Content-Type: application/json" \
  -d '{
    "runId": "run_xxx",
    "teamId": "team_xxx",
    "round": 1,
    "role": "marketing",
    "decision": {
      "campaignSpend": 5,
      "pricingChangePct": 0,
      "positioning": "trust-first",
      "channelMix": "community"
    }
  }'
```

## Running Tests

```bash
npm test        # Watch mode
npm run test:run # Run once
```

## How to Test on Vercel

After deployment:

1. **Visit `/`** - Should show premium landing page (white background)
2. **Visit `/simulation`** - Should show interactive dashboard
3. **Click "Start Simulation"** - Initializes a new game
4. **Submit decisions** - Select a role and submit
5. **Click "Advance Quarter"** - Process decisions and see results
6. **Visit `/facilitator`** - Create and manage simulation runs
7. **Visit `/debrief`** - View charts and export reports

### Test URLs

```
https://your-app.vercel.app/           # Landing page
https://your-app.vercel.app/simulation # Simulation dashboard
https://your-app.vercel.app/facilitator # Facilitator console
https://your-app.vercel.app/debrief    # Debrief view
https://your-app.vercel.app/api/state  # API: Get state
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Animations:** Framer Motion
- **State:** Zustand
- **Validation:** Zod
- **Testing:** Vitest

## Simulation Scenario

**Praxis Assist: Responsible AI Product Launch**

Navigate 8 quarters of growth while balancing innovation, trust, and compliance.

### Initial State
- Cash: $50M
- Revenue: $5M/quarter
- Headcount: 150 employees
- Brand Trust: 65%

### Scoring
- Financial Health (profitability, runway)
- Growth (demand capture, market share)
- Trust (brand trust, compliance)
- Resilience (risk profile, supply stability)
- Execution (quality, delivery)

## License

MIT License

---

Built by Ambidexters Inc.
