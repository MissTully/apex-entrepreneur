/**
 * The Apex / Reef-Native curriculum.
 * Maps the 5-month Experiential Entrepreneurship Program to a shark life-cycle
 * metaphor ("The Predator's Lexicon").
 */

export interface Objective {
  title: string;
  detail: string;
}

export interface Phase {
  /** URL slug, e.g. "apex-positioning" */
  slug: string;
  /** Month number in the program */
  month: number;
  /** Shark-themed phase name */
  codename: string;
  /** Underlying academic title */
  title: string;
  /** One-line hook */
  tagline: string;
  /** Longer framing paragraph */
  overview: string;
  /** Key learning objectives */
  objectives: Objective[];
}

export const PHASES: Phase[] = [
  {
    slug: "apex-positioning",
    month: 1,
    codename: "Apex Positioning",
    title: "The Entrepreneurial Mindset — Strategy, Motivation & Risk",
    tagline: "In Tampa Bay waters, clarity is survival.",
    overview:
      "Entrepreneurial performance is dictated by psychological positioning. A founder's default motivational focus determines how they perceive every goal, threat, and opportunity. Read the market currents with the precision of an apex predator.",
    objectives: [
      {
        title: "Promotion vs. Prevention Focus",
        detail:
          "Diagnose your default motivational lens. Promotion-focused founders chase rewards and move fast; prevention-focused founders manage responsibilities and prize accuracy. Learn to install the opposite safeguard before things derail.",
      },
      {
        title: "Game Theory at Work",
        detail:
          "Distinguish zero-sum conflicts (one party's gain is another's loss) from collaborative interactions where mutual benefit is possible — and choose your strategy accordingly.",
      },
      {
        title: "Winning vs. Not Losing",
        detail:
          "Run the strategy checklist: Are you chasing the reward of the win or fearing the loss? Are you fixated on a position ($12,000) or the underlying interest (a quick closing)?",
      },
    ],
  },
  {
    slug: "coral-scaffolding",
    month: 2,
    codename: "Coral Scaffolding",
    title: "Business Architecture — Scaffolding & Iterative Planning",
    tagline: "Each iteration adds structure, complexity, and a fortress of value.",
    overview:
      "The modern business plan is an evolving document — a mechanism for continuous planning, not a static funding requirement. Build like a reef: low-floor accessibility, high-ceiling extensibility, just-in-time feedback.",
    objectives: [
      {
        title: "The BizChat Methodology",
        detail:
          "Move from rough draft to polished pitch using low-floor tools (voice-to-text) and high-ceiling editors. Just-in-time AI feedback surfaces both deepening and bridging prompts.",
      },
      {
        title: "Iterative Plan Components",
        detail:
          "Assemble the executive summary (mission & value proposition), market analysis (evidence-based positioning), and future-of-the-company (scalability & sustainability).",
      },
      {
        title: "Help-Seeking Skills",
        detail:
          "Formulate sharp 'questions to ask an expert' — e.g. 'What are realistic financial projections for this sector?' — to reduce reputational risk and earn high-quality coaching.",
      },
    ],
  },
  {
    slug: "navigating-the-currents",
    month: 3,
    codename: "Navigating the Currents",
    title: "The Art of the Deal — Integrative Negotiation & Relationship Capital",
    tagline: "Don't get swept away by a poor deal — pivot against the current.",
    overview:
      "Strategic success relies on expanding the pie through integrative bargaining. Unlike win-lose distributive bargaining, this approach uncovers shared and differing interests to create lasting value and relationship capital.",
    objectives: [
      {
        title: "Build Rapport & Analyze BATNA",
        detail:
          "Humanize the deal first, then identify your Best Alternative to a Negotiated Agreement. A strong BATNA is the power to walk away — you negotiate with confidence, not desperation.",
      },
      {
        title: "Active Listening & MESOs",
        detail:
          "Paraphrase the counterpart's points to confirm understanding, then present Multiple Equivalent Offers Simultaneously to reveal their true preferences.",
      },
      {
        title: "Counter-Anchoring (Reading the Tide)",
        detail:
          "Neutralize an aggressive anchor with the expert-vetted phrase: 'It would be helpful if you could explain how you arrived at that value?' — forcing the counterpart to justify their logic.",
      },
    ],
  },
  {
    slug: "schooling-strategy",
    month: 4,
    codename: "Schooling Strategy",
    title: "Leadership Dynamics — Leading Through Uncertainty",
    tagline: "A school of sharks moves with intent and communication.",
    overview:
      "Emotionally intelligent leadership is a prerequisite for navigating disruption, financial crises, and organizational change. Cross-functional coordination is cited as the fastest-growing skill for 2026.",
    objectives: [
      {
        title: "High-Performance Soft Skills",
        detail:
          "Practice psychological safety (reduce catastrophic errors), purposeful inquiry (ask the right questions vs. provide answers), and productive disagreement (healthy conflict with respect).",
      },
      {
        title: "Conversational Repair",
        detail:
          "When communication breaks down, deploy keyword highlighting, providing options, explanations, or human intervention to rebuild trust and maintain the working alliance.",
      },
      {
        title: "Cross-Functional Coordination",
        detail:
          "Coordinate across functions under pressure — the new standard for hiring and team growth in the decentralized economy.",
      },
    ],
  },
  {
    slug: "the-migration",
    month: 5,
    codename: "The Migration",
    title: "Launch & Future-Proofing — Pitching, Compensation & Operational Excellence",
    tagline: "The migration from protected waters to the open, competitive ocean.",
    overview:
      "The final transition from learner to market-active entrepreneur focuses on the total compensation of the business and operational excellence through Reef-Native (Edge-Native) standards.",
    objectives: [
      {
        title: "Salary & Value Negotiation",
        detail:
          "Look beyond the paycheck. Use 2026 salary-guide data to justify premiums and negotiate a total package: signing bonuses, flexible hours, professional development, performance-review timelines.",
      },
      {
        title: "The Reef-Native Operational Philosophy",
        detail:
          "Adopt browser-native tools (zero install, native speeds), enforce performance budgets as a design priority, and design offline-first for resilience in low-bandwidth environments.",
      },
      {
        title: "Final Pitch Mastery",
        detail:
          "Refine delivery with AI-driven feedback on listenability & volume, hesitation-word counts ('um'/'ah'), pace, and eye contact — making the pitch memorable to investors.",
      },
    ],
  },
];

export interface Competency {
  title: string;
  detail: string;
}

export const CORE_COMPETENCIES: Competency[] = [
  {
    title: "Emotionally Intelligent Leadership",
    detail:
      "Other-awareness and empathy to maintain psychological safety and team morale during organizational disruption.",
  },
  {
    title: "Strategic Communication",
    detail:
      "Master the Negotiation-Strategy-Cooperation framework to build relationship capital and navigate conflict.",
  },
  {
    title: "Digital Scaffolding",
    detail:
      "Leverage AI and Reef-Native tools to eliminate IT friction and automate back-office operations.",
  },
];

export function getPhase(slug: string): Phase | undefined {
  return PHASES.find((p) => p.slug === slug);
}
