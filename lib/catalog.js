// lib/catalog.js
// The Praxis simulation catalog. Each entry mirrors one of the simulation
// engines under /simulations and is seeded into the `simulations` table so
// runs can reference it by a stable slug. Editing engine logic does not
// require changing this list; it only provides catalog metadata.

export const CATALOG = [
  { slug: 'crucible', name: 'Crucible', category: 'Crisis Leadership', description: 'Navigate simultaneous crises threatening company survival under extreme pressure.' },
  { slug: 'entangled', name: 'Entangled', category: 'M&A Integration', description: 'Steer a complex merger integration through competing stakeholder interests.' },
  { slug: 'financial-acumen', name: 'Financial Acumen', category: 'Finance', description: 'Make capital allocation and financial strategy decisions under uncertainty.' },
  { slug: 'governance-compliance', name: 'Governance & Compliance', category: 'Governance', description: 'Uphold ethics, regulatory standing and governance effectiveness under scrutiny.' },
  { slug: 'innovation-lab', name: 'Innovation Lab', category: 'Innovation', description: 'Balance R&D bets, speed to market and portfolio risk to drive innovation.' },
  { slug: 'margin-call', name: 'Margin Call', category: 'Finance', description: 'Manage liquidity, creditors and risk exposure through a financial squeeze.' },
  { slug: 'market-dynamics', name: 'Market Dynamics', category: 'Strategy', description: 'Respond to shifting demand, pricing and competitive pressure in a live market.' },
  { slug: 'metamorphosis', name: 'Metamorphosis', category: 'Change Management', description: 'Lead a large-scale organisational transformation from launch to adoption.' },
  { slug: 'nexus-protocol', name: 'Nexus Protocol', category: 'Strategy', description: 'Coordinate interdependent decisions across a networked enterprise.' },
  { slug: 'operations-excellence', name: 'Operations Excellence', category: 'Operations', description: 'Optimise capacity, quality and supply stability across the value chain.' },
  { slug: 'portfolio-roulette', name: 'Portfolio Roulette', category: 'Finance', description: 'Build and rebalance an investment portfolio against volatile outcomes.' },
  { slug: 'risk-intelligence', name: 'Risk Intelligence', category: 'Risk', description: 'Set risk appetite and controls across strategic, financial and cyber risk.' },
  { slug: 'sales-mastery', name: 'Sales Mastery', category: 'Sales', description: 'Win complex deals by managing pipeline, negotiation and buyer relationships.' },
  { slug: 'strategic-leadership', name: 'Strategic Leadership', category: 'Leadership', description: 'Set direction, build credibility and align stakeholders around a strategy.' },
  { slug: 'talent-culture', name: 'Talent & Culture', category: 'People', description: 'Shape engagement, culture and employer brand across the employee lifecycle.' },
];

export function getCatalogBySlug(slug) {
  return CATALOG.find((c) => c.slug === slug) || null;
}
