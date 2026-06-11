/**
 * The Apex / Reef-Native curriculum.
 * Maps the 5-month Experiential Entrepreneurship Program to a shark life-cycle
 * metaphor ("The Predator's Lexicon").
 */

export interface Objective {
  title: string;
  detail: string;
}

/**
 * "Deep dive" content blocks — the hands-on material lifted from the program
 * document (checklists, negotiation scripts, repair tables). A discriminated
 * union so each phase can mix block types and the renderer stays type-safe.
 * Add new `kind`s here and a matching branch in <Phase/> to extend the modules.
 */
export interface ChecklistBlock {
  kind: "checklist";
  heading: string;
  intro?: string;
  /** Each item: a bold lead-in + the rest of the line. */
  items: { lead: string; body: string }[];
}

export interface ScriptBlock {
  kind: "script";
  heading: string;
  intro?: string;
  steps: { label: string; quote: string }[];
}

export interface TableBlock {
  kind: "table";
  heading: string;
  intro?: string;
  columns: string[];
  rows: string[][];
}

export interface CalloutBlock {
  kind: "callout";
  heading: string;
  body: string;
  /** Optional verbatim phrase to render as a pull-quote. */
  quote?: string;
}

export type DeepDive = ChecklistBlock | ScriptBlock | TableBlock | CalloutBlock;

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
  /** Hands-on workshop material rendered below the objectives. */
  deepDives?: DeepDive[];
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
    deepDives: [
      {
        kind: "table",
        heading: "Motivational focus: Promotion vs. Prevention",
        intro:
          "A founder's default focus colors how they read every goal, threat, and opportunity. Know yours — then install the opposite safeguard.",
        columns: ["Focus", "Behavioral traits", "The “so what?” impact"],
        rows: [
          [
            "Promotion",
            "Sees goals as paths to reward. Works fast, seizes opportunities, comfortable with high risk.",
            "Great at rapid market share — but must consciously add prevention safeguards to avoid catastrophe when things derail.",
          ],
          [
            "Prevention",
            "Sees goals as responsibilities to manage. Prizes accuracy over speed; aims to get it right the first time.",
            "Excels at stability and risk mitigation — but can play “not to lose,” missing opportunities when fear overrides the math.",
          ],
        ],
      },
      {
        kind: "checklist",
        heading: "Strategy checklist — Winning vs. Not Losing",
        intro: "Four questions to run before any high-stakes move.",
        items: [
          {
            lead: "Primary focus",
            body: "Am I prioritizing the potential rewards of the win, or the consequences of the loss?",
          },
          {
            lead: "Positional assessment",
            body: "Am I fixated on a position (a $12,000 price point) or the underlying interest (a quick closing)?",
          },
          {
            lead: "Game type",
            body: "Have I identified whether this is a zero-sum conflict or a collaborative value-creation opportunity?",
          },
          {
            lead: "Evidence check",
            body: "Am I communicating my case clearly and asking the counterpart to confirm the evidence provided?",
          },
        ],
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
    deepDives: [
      {
        kind: "table",
        heading: "The BizChat methodology",
        intro:
          "Move from rough draft to polished pitch with a tool that meets every learner where they are.",
        columns: ["Layer", "What it means", "In practice"],
        rows: [
          [
            "Low-floor accessibility",
            "Anyone can start — no technical fluency required.",
            "Dictate edits and describe concepts with voice-to-text; Reef-Native design runs at native speed even on a $200 Chromebook.",
          ],
          [
            "High-ceiling extensibility",
            "Power users can go as deep as they like.",
            "Rich-text editors; specify criteria for in-line text generation and complex formatting.",
          ],
          [
            "Just-in-time feedback",
            "Micro-learning in the moment.",
            "AI offers “exploitation” prompts (deepen the current topic) and “exploration” prompts (bridge to new ones).",
          ],
        ],
      },
      {
        kind: "checklist",
        heading: "Iterative plan components",
        intro: "The evolving document grows three sections in parallel.",
        items: [
          { lead: "Executive summary", body: "Define the mission and core value proposition." },
          { lead: "Market analysis", body: "Anchor your position with evidence-based research." },
          { lead: "Future of the company", body: "Outline scalability and sustainability goals." },
        ],
      },
      {
        kind: "callout",
        heading: "Workshop — help-seeking skills",
        body: "Founders formulate targeted 'questions to ask an expert' to reduce reputational risk and earn high-quality feedback from coaches. Practice objective self-reflection by leading with the specific number or constraint you most need validated.",
        quote: "What are realistic financial projections for this sector?",
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
    deepDives: [
      {
        kind: "checklist",
        heading: "The integrative negotiation protocol",
        intro: "Expand the pie instead of splitting it — four moves, in order.",
        items: [
          {
            lead: "Build rapport",
            body: "Humanize the deal first. Research proves introductory interaction leads to more collaborative, higher-value outcomes.",
          },
          {
            lead: "Analyze BATNA",
            body: "Identify your Best Alternative to a Negotiated Agreement — a strong one is the power to walk away, so you negotiate with confidence rather than desperation.",
          },
          {
            lead: "Active listening",
            body: "Paraphrase the counterpart's main points to confirm understanding and acknowledge their constraints or emotions.",
          },
          {
            lead: "Propose MESOs",
            body: "Present Multiple Equivalent Offers Simultaneously to discover the other party's true preferences from which one they pick.",
          },
        ],
      },
      {
        kind: "callout",
        heading: "Counter-anchoring — reading the tide",
        body: "The first number mentioned (the anchor) dictates the range of the deal. When you face an aggressive anchor, don't counter with emotion — make them justify the logic. This neutralizes the anchoring effect.",
        quote: "It would be helpful to us if you could explain how you arrived at that value?",
      },
      {
        kind: "script",
        heading: "Negotiation script — the path to cooperation",
        intro: "A three-beat template you can adapt to any deal.",
        steps: [
          {
            label: "Negotiation",
            quote:
              "I appreciate the offer. Based on my research of the market rate for similar roles in this industry, I was expecting a range of [X to Y]. Is there flexibility here?",
          },
          {
            label: "Strategy",
            quote:
              "If increasing the base budget isn't an option, I'm open to discussing non-salary benefits like flexible hours, remote options, or professional development.",
          },
          {
            label: "Cooperation",
            quote:
              "If we cannot meet on these terms today, would you be open to a performance-based salary review in six months to ensure we are aligned?",
          },
        ],
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
    deepDives: [
      {
        kind: "checklist",
        heading: "High-performance soft skills (VR use cases)",
        intro: "Three behaviors rehearsed in simulation before they're needed for real.",
        items: [
          {
            lead: "Psychological safety",
            body: "Reduces the risk of catastrophic errors by encouraging team members to speak up without fear.",
          },
          {
            lead: "Purposeful inquiry",
            body: "Enhances problem-solving by shifting from providing answers to asking the right questions.",
          },
          {
            lead: "Productive disagreement",
            body: "Allows healthy conflict while maintaining respect — explicitly reducing the morale dip during organizational change.",
          },
        ],
      },
      {
        kind: "table",
        heading: "Conversational repair strategy guide",
        intro:
          "When communication breaks down between teams — or between humans and AI — deploy the matching strategy to rebuild trust.",
        columns: ["Strategy", "When to deploy", "Strategic goal"],
        rows: [
          [
            "Keyword highlighting",
            "You need to show shared understanding fast.",
            "Show the team exactly which keywords the system or leader understood.",
          ],
          [
            "Assisted self-repair",
            "The request is close, but needs reframing.",
            "Explain the logic of the breakdown to guide a better rephrasing.",
          ],
          [
            "Providing options",
            "A request is misunderstood but near the team's capability.",
            "Resolve faster by narrowing down the dialogue initiative.",
          ],
          [
            "Explanations",
            "The breakdown stems from a lack of shared logic or models.",
            "Teach the underlying reasoning to foster long-term alignment.",
          ],
          [
            "Human intervention",
            "Automated or initial repair attempts fail at a high-stakes junction.",
            "Refer to an expert to prevent frustration and preserve the working alliance.",
          ],
        ],
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
    deepDives: [
      {
        kind: "callout",
        heading: "Total compensation focus",
        body: "Navigate hiring and contracting by looking beyond the paycheck. Use 2026 Salary Guide data to justify premiums for the hottest jobs and most in-demand skills — then negotiate a package: signing bonuses, flexible hours, professional development, and specific performance-review timelines.",
      },
      {
        kind: "checklist",
        heading: "The Reef-Native operational philosophy",
        intro: "Close the digital divide by turning any browser into a high-performance engine (WebAssembly).",
        items: [
          {
            lead: "Low friction",
            body: "Browser-native tools that require zero local installation and run at native speed on any hardware.",
          },
          {
            lead: "Performance budgets",
            body: "Manage system resources as a design priority — if an app exceeds its memory budget, that's a design failure.",
          },
          {
            lead: "Offline resilience",
            body: "Design Edge-First so the business stays operational in low-bandwidth, rural areas by processing data locally.",
          },
        ],
      },
      {
        kind: "checklist",
        heading: "Final pitch — what the AI scores",
        intro: "Quantifiable feedback turns a good pitch into a memorable one.",
        items: [
          { lead: "Listenability & volume", body: "Optimize vocal delivery for maximum engagement." },
          {
            lead: "Hesitation words",
            body: "Quantify 'um' and 'ah' counts to ensure a professional, authoritative delivery.",
          },
          { lead: "Pace & eye contact", body: "Track non-verbal cues so the pitch stays memorable to investors." },
        ],
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
