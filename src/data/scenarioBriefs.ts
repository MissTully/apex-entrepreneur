/**
 * PUBLIC scenario briefs — the only scenario data the browser is allowed to see.
 *
 * The full scenarios (with the counterpart's secret `hiddenState`, the success-
 * signal evidence, and the debrief internals) live SERVER-SIDE in
 * api/_scenarios.ts and manifests/scenarios/. The browser only ever sends a
 * `scenarioId`; it never receives the secrets. This file is the learner-facing
 * half: the brief shown before the sim, the public persona, and the names of the
 * scoring dimensions so the learner knows how the debrief reads them.
 *
 * Keyed by PHASE SLUG (matching src/data/curriculum.ts) so the Phase page can
 * look up "is there a simulation for this phase?" in one call.
 *
 * To add a scenario for another phase: author its JSON in manifests/scenarios/,
 * register it in api/_scenarios.ts, then add its PUBLIC fields here under the
 * phase slug. Never copy hiddenState into this file.
 */

export interface ScoringDimensionBrief {
  id: string;
  name: string;
  objectiveId: string;
}

/**
 * Presentation copy for the simulation overlay. Kept here (not in the component)
 * so each scenario reads in its own voice — the counterpart can be a buyer in a
 * negotiation or a coach in a reflective conversation, and the UI follows suit
 * instead of hard-coding one scenario's flavor. Optional: the component falls
 * back to neutral defaults when a field is absent.
 */
export interface ScenarioUiCopy {
  /** Noun for the live interaction, e.g. "negotiation", "conversation". */
  simNoun: string;
  /** Compact label for the middle step in the phase trail, e.g. "Negotiation". */
  simStepLabel: string;
  /** Nudge shown once the learner has taken many turns. */
  softCapNote: string;
  /** Short scenario name used in replay buttons, e.g. "The Dock Deal". */
  replayLabel: string;
  /** Copy for the post-score gate (unlocked vs. not-yet). */
  gate: {
    unlockedTitle: string;
    unlockedBody: string;
    lockedTitle: string;
    lockedBody: string;
    /** Optional single line of advice rendered under the not-yet message. */
    lockedHint?: string;
  };
  /**
   * Copy for the "Practice by doing" pre-brief card on the Phase page — the
   * first thing a learner reads before entering the experience. Optional;
   * neutral, simulation-flavored defaults apply when omitted. Voice/coaching
   * scenarios set this to give an accurate, warmer pre-brief (e.g. no "debrief"
   * promise where the voice flow doesn't have one).
   */
  practiceCard?: {
    /** Card heading; defaults to "Practice by doing". */
    heading?: string;
    /** The pre-brief paragraph. */
    body: string;
    /** Primary button label, e.g. "Talk to Maren". */
    cta: string;
    /** The small meta line under the button. */
    meta: string;
  };
  /**
   * Optional paired-debrief guide shown after a VOICE role-play ends. Voice
   * scenarios have no auto-scored debrief, so this stages the formative loop:
   * the pair debriefs the call together, then switches seats so the partner
   * runs their own. The component frames the switch; these fields supply the
   * scenario-specific reflection prompts (sensible defaults apply when omitted).
   */
  pairedDebrief?: {
    /** One short framing line under the heading. */
    intro: string;
    /** The questions the pair talks through about the call just finished. */
    prompts: string[];
  };
  /**
   * Scripted lines used only when /api is unreachable (the bare dev server or a
   * key-less preview), so offline practice mode speaks in this scenario's voice
   * instead of another scenario's. Omit to fall back to the generic defaults.
   */
  fallback?: {
    simOpener: string;
    simReplies: string[];
    debriefOpener: string;
    debriefReplies: string[];
  };
}

export interface ScenarioBrief {
  scenarioId: string;
  moduleId: string;
  title: string;
  tagline: string;
  modality: string;
  estimatedMinutes: number;
  character: {
    name: string;
    persona: string;
    voice?: string;
    /** Small subtitle under the character's name on the brief (role · place). */
    title?: string;
    /** Optional portrait (public path) used as the character's avatar. */
    avatar?: string;
  };
  learnerBrief: {
    situation: string;
    yourRole: string;
    yourGoal: string;
    givens: string[];
    skillsToPractice: string[];
    /** Short tag for the learner's transcript label, e.g. "Jordan". */
    roleShort?: string;
  };
  /** Public names of the four debrief dimensions — no criteria, no evidence. */
  scoringDimensions: ScoringDimensionBrief[];
  /** Optional overlay presentation copy; sensible defaults apply when omitted. */
  ui?: ScenarioUiCopy;
  /**
   * Optional prebrief video shown on the BRIEF screen, before the learner enters
   * the simulation — a short founder's-eye orientation to the scenario. Only the
   * YouTube id is stored; the component renders a privacy-friendly
   * youtube-nocookie embed (nothing tracks until the learner presses play).
   */
  prebriefVideo?: {
    /** YouTube video id, used for the embed. */
    youtubeId: string;
    /** Heading above the embed; defaults to "Watch the prebrief". */
    title?: string;
    /** Optional one-line caption under the heading. */
    caption?: string;
  };
  /**
   * Optional ElevenLabs Conversational AI agent id. When present, the live
   * "Conversation" step runs as a VOICE call with this agent (via the embedded
   * <elevenlabs-convai> widget) instead of the text chat — and the auto
   * debrief/score steps (which read a text transcript) are skipped, because the
   * voice agent runs the full coach-and-close arc itself. The agent must have
   * public/unauthenticated embedding enabled. Safe to embed client-side: it is
   * a public agent id, not a secret key.
   */
  voiceAgentId?: string;
  /**
   * Optional on-page orientation for a coaching/reflective scenario that opens a
   * module. Rendered at the TOP of the module page to stage the learner with
   * context before they launch the conversation (the learner shows up as
   * themselves, not a role). When present, the simulation overlay also swaps its
   * role-play "brief" screen for a warmer setup screen.
   */
  orientation?: {
    /** Section heading on the module page, e.g. "Start here — before the frameworks". */
    heading: string;
    /** One short framing paragraph that sets the learner up. */
    intro: string;
  };
}

export const SCENARIO_BRIEFS: Record<string, ScenarioBrief> = {
  "apex-positioning": {
    scenarioId: "apex-positioning-S1",
    moduleId: "apex-positioning",
    title: "The Dock Deal",
    tagline: "A marina owner is weighing his options, with the quarter closing in 48 hours.",
    modality: "negotiation",
    estimatedMinutes: 15,
    character: {
      name: "Dale Mercer",
      title: "Owner, Mercer Marina · Tampa Bay, FL",
      avatar: "/images/dale.png",
      persona:
        "Owner of Mercer Marina on Tampa Bay — a 12-vessel charter and slip operation. Practical, plain-spoken, watches every dollar, and runs the place himself. Friendly but cautious, and careful with a commitment until he understands exactly what he's signing up for.",
      voice:
        "Direct, folksy, concrete — talks in real-world stakes like crew, bookings, and peak season. Warms up when he feels understood; gets guarded when pushed on price with no reason behind it.",
    },
    learnerBrief: {
      situation:
        "You're Jordan, founder of DockOS — a fleet-management and charter-booking platform. You've been in talks with Dale Mercer, owner of Mercer Marina on Tampa Bay, who wants to license DockOS for his 12-vessel operation. Your standard annual license is $12,000. You're about to get on a call with Dale to work toward a deal. Your quarter closes in 48 hours.",
      yourRole: "Jordan, founder of DockOS.",
      roleShort: "Jordan",
      yourGoal:
        "Close a deal that protects the value of DockOS (ideally at or near your $12,000 license) AND leaves Dale confident he's making the right call.",
      givens: [
        "Your standard annual license is $12,000. That is your value, not an opening bluff.",
        "Your quarter closes in 48 hours. You'd like to close, but a bad-value deal is worse than no deal.",
        "You can flex on onboarding support, payment timing, and expansion terms — you do NOT have to gut the price to win.",
      ],
      skillsToPractice: [
        "Notice your very first reaction to Dale's opening position. Are you chasing the win (holding $12k because it's the prize) or avoiding a loss (clinging to $12k out of fear)? Choose your stance on purpose.",
        "Decide whether this is really a zero-sum fight over one number, or a collaborative deal with room to create value — then negotiate the way that read demands.",
        "Separate Dale's position from the interest underneath it. Surface what he's actually protecting, then use evidence to reframe the value — and ask him to confirm what that evidence is worth.",
      ],
    },
    scoringDimensions: [
      { id: "D1", name: "Motivational Focus Awareness", objectiveId: "apex-positioning-LO1" },
      { id: "D2", name: "Game Type Identification", objectiveId: "apex-positioning-LO2" },
      { id: "D3", name: "Position vs. Interest Clarity", objectiveId: "apex-positioning-LO3" },
      { id: "D4", name: "Evidence Use and Confirmation", objectiveId: "apex-positioning-LO3" },
    ],
    prebriefVideo: {
      youtubeId: "QMK94hZK9XA",
      title: "Prebrief: The Dock Deal",
      caption: "Watch this before you sit down with Dale — a quick orientation to what's really at stake.",
    },
    // The live "Negotiation" step runs as a VOICE call with Dale Mercer (the
    // ElevenLabs agent plays the counterpart and ends the call on resolution).
    // As with any voice scenario, the text-transcript debrief/score steps are
    // skipped — voice gives us no transcript to score.
    voiceAgentId: "agent_6801kvyjqdbmfd39jnxegb8c7q31",
    ui: {
      simNoun: "negotiation",
      simStepLabel: "Negotiation",
      softCapNote: "Dale's checking the clock — this is a good moment to close, or to end and debrief.",
      replayLabel: "The Dock Deal",
      practiceCard: {
        heading: "Practice by doing",
        body: "Step into The Dock Deal — a live voice negotiation with Dale Mercer, owner of Mercer Marina. You play Jordan, founder of DockOS, and hold the conversation out loud. This is formative practice: nothing is graded here — afterward, you'll debrief in pairs with a partner.",
        cta: "Enter the negotiation",
        meta: "Voice negotiation · ~15 min · formative, not graded",
      },
      pairedDebrief: {
        intro:
          "That's your call with Dale. The real learning happens out loud — so before you move on, pair up and debrief the negotiation together. Then switch seats and run it again.",
        prompts: [
          "How did it feel — and where did the deal actually land?",
          "What was your very first reaction to Dale's $8,400 counter: were you chasing the win, or avoiding a loss?",
          "What was Dale really protecting underneath the number? Did you surface it — and how?",
          "Did you hand Dale the 3-day onboarding evidence and ask him what it was worth to his math?",
          "Point to the moment Dale's tone shifted. What had you just said right before it?",
          "What's the one thing you'll do differently next time a buyer counters low and fast?",
        ],
      },
      gate: {
        unlockedTitle: "You read the water.",
        unlockedBody:
          "Dale wasn't guarding a price. He was guarding a mistake he'd already made once. The number was a symptom; the fear was the signal. That's what this phase was about — seeing past the position to what's driving the room.",
        lockedTitle: "Not yet.",
        lockedBody:
          "The deal was there. Dale showed you the door — the onboarding fear, the Clearwater location, the math that already worked in your favor. This phase is built on what you learn here. Go back in; this time, you know the water.",
        lockedHint: "What would make this hard for you? Ask it early. See what Dale does.",
      },
    },
  },

  "entering-the-reef": {
    scenarioId: "entering-the-reef-S1",
    moduleId: "entering-the-reef",
    title: "The First Attempt",
    tagline: "You've never done this before. That's the point. Do it anyway — and see what you actually learn.",
    modality: "coaching conversation",
    estimatedMinutes: 10,
    character: {
      name: "Maren Cole",
      title: "Founding coach · early-stage mentor",
      avatar: "/images/maren.webp",
      persona:
        "A founding advisor and early-stage coach who has helped over 40 first-time entrepreneurs move from paralysis to momentum. Maren is warm but relentlessly honest. She doesn't let people off the hook with vague answers, but she never makes them feel stupid for not knowing. She asks short, precise questions and waits. She believes the biggest obstacle for most entrepreneurs is a belief they haven't examined — and her job is to surface it, not remove it.",
      voice:
        "Direct, curious, unhurried. Uses silence intentionally. Never tells — always asks. Celebrates attempts explicitly and out loud. Will push back gently when a learner attributes failure to fixed ability rather than approach or persistence.",
    },
    learnerBrief: {
      situation:
        "You've just entered the Apex program. Before your first simulation in Phase 1, Maren Cole — a founding coach — wants to have a 10-minute conversation with you. She's not evaluating your skills. She's interested in one thing: the beliefs you're carrying into this program, and whether any of them might be limiting you before you even start.",
      yourRole: "Yourself — a learner entering the program for the first time.",
      yourGoal:
        "Have an honest conversation with Maren. Surface at least one belief you hold about your own abilities that you haven't yet tested. Design one small experiment you could run in the next 24 hours to start collecting real data. Leave the conversation with a clearer sense of what you actually want from this program — not what you think you should want.",
      givens: [
        "You do not need to know what you want yet. That's one of the things you're here to figure out.",
        "There are no wrong answers in this conversation. There are only unexamined ones.",
        "Maren has seen every flavor of self-limiting belief. Nothing you say will surprise her.",
        "The only thing that doesn't work in this conversation is performing confidence you don't have.",
        "At the end of the conversation, you will be asked to name one experiment and one question you're still holding.",
      ],
      skillsToPractice: [
        "Notice the moment you want to give a 'good' answer instead of an honest one. Catch it. Then give the honest one.",
        "When Maren asks what you want from the program, resist the urge to say what sounds impressive. Say what's actually true.",
        "When you describe something you believe you can't do, immediately ask yourself: is this a fact or a prediction? Tell Maren which one it is.",
      ],
    },
    scoringDimensions: [
      { id: "D1", name: "Belief Identification", objectiveId: "entering-the-reef-LO1" },
      { id: "D2", name: "Experiment Design", objectiveId: "entering-the-reef-LO2" },
      { id: "D3", name: "Honest vs. Performed Response", objectiveId: "entering-the-reef-LO3" },
      { id: "D4", name: "Purpose Articulation", objectiveId: "entering-the-reef-LO5" },
    ],
    voiceAgentId: "agent_2901kvy97phtfdssxey4hcsagn1r",
    orientation: {
      heading: "Start here — before the frameworks",
      intro:
        "Apex doesn't open with content. It opens with you. Before your first simulation in Phase 1, you'll have a short, honest conversation with Maren Cole — a founding coach. It's not a test, and there's no role to play. She's listening for one thing: a belief you carry about what you can or can't do, and whether it's actually true or just something you've never tested. Name that, shape one small experiment to test it, and you've done the real work of this module.",
    },
    ui: {
      simNoun: "conversation",
      simStepLabel: "Conversation",
      softCapNote: "You've covered real ground with Maren — a good moment to land it, or to end and debrief.",
      replayLabel: "The First Attempt",
      gate: {
        unlockedTitle: "You shed a little shell.",
        unlockedBody:
          "You named a belief you'd never tested, designed an experiment to test it, and told Maren something true instead of something impressive. That's the whole move — clarity comes from action, not before it. Carry that into Phase 1.",
        lockedTitle: "Almost — but you stayed armored.",
        lockedBody:
          "Maren kept opening the door: what you actually want, the belief underneath the 'I can't,' the smallest experiment you could run tomorrow. The honest answer was right there. Go back in — this time, give her the real one, not the good one.",
        lockedHint: "Pick one 'I can't' you said out loud, and ask yourself: is that a fact, or a prediction? Tell Maren which.",
      },
      practiceCard: {
        heading: "Start with a conversation",
        body: "Before any frameworks, you'll talk with Maren Cole — out loud, by voice — for about ten minutes. She isn't grading you, and there are no right answers. Her job is to help you name one belief you're carrying about what you can do, work out whether it's a fact or just an untested prediction, and leave with one small experiment to run this week. Come honest, not polished.",
        cta: "Talk to Maren",
        meta: "Voice conversation · ~10 min · no scoring, just an honest talk",
      },
      fallback: {
        simOpener:
          "Thanks for making the time. Before we get anywhere near the program, I just want to understand what you're carrying in with you. So let me ask plainly: when you picture actually building something, what's the first thing your head tells you that you can't do?",
        simReplies: [
          "Okay. Is that a fact, or a prediction? Walk me through it — how many times have you actually tried?",
          "I hear the 'I should want this.' Set that down for a second. What do you actually want — even if it sounds small or unimpressive?",
          "Good. So what's the smallest experiment you could run in the next 24 hours to find out whether that belief is even true?",
        ],
        debriefOpener:
          "That's the conversation — and the honest parts were the useful parts. I'm here to reflect with you, not grade you. Before we get analytical: how did that feel, and what's one thing you said that was truer than you expected?",
        debriefReplies: [
          "Say more about that. When you said you 'can't' do that thing — was that something you've tested, or something you've assumed?",
          "Here's what I noticed: the moment you stopped performing and gave me the real answer, this got useful. What made that shift possible?",
          "Name one experiment you'll actually run this week — and the one question you're still holding onto.",
        ],
      },
    },
  },

  "navigating-the-currents": {
    scenarioId: "navigating-the-currents-S1",
    moduleId: "navigating-the-currents",
    title: "The Reef-Supply Contract",
    tagline: "A 12-month contract is on the table — and a relationship that could repeat for years.",
    modality: "negotiation",
    estimatedMinutes: 35,
    character: {
      name: "Marcus Vane",
      title: "Procurement Lead · regional aquarium-installation firm",
      avatar: "/images/marcus.webp",
      persona:
        "Procurement lead at a regional aquarium-installation firm. Experienced, friendly-but-transactional, and proud of getting a good number. He's done this many times and moves quickly once he's on a call.",
      voice:
        "Warm on the surface, clipped and quick underneath. Uses a little time pressure and easy flattery; gets more concrete and respectful when a supplier holds firm with a real reason.",
    },
    learnerBrief: {
      situation:
        "You run a small reef-safe materials supplier. A regional aquarium-installation firm wants a 12-month supply contract, and their procurement lead, Marcus Vane, has asked to 'talk numbers' on a call. This is a relationship that could repeat for years — or end at this call.",
      yourRole: "Founder and head of sales of the supplier.",
      roleShort: "You",
      yourGoal:
        "Close a 12-month contract that protects your margin AND leaves Marcus feeling he got a fair, repeatable deal.",
      givens: [
        "Your cost to fulfill is $46,000/year. Below that you lose money.",
        "Your reservation point (walk-away price) is $58,000/year — your defensible floor.",
        "Your realistic target is $72,000/year.",
        "Your BATNA: a smaller competing buyer has verbally offered $61,000/year for a similar 9-month deal. Real, but not signed.",
        "You can flex on payment timing, delivery cadence, and exclusivity — not on going below your floor.",
      ],
      skillsToPractice: [
        "Build rapport and anchor your own confidence on your BATNA before you talk price.",
        "Paraphrase to confirm Marcus's real interest, then present Multiple Equivalent Simultaneous Offers (MESOs) to surface what he actually values.",
        "If Marcus drops an aggressive low anchor, neutralize it — make him justify the figure before you counter, instead of firing back your own number.",
      ],
    },
    scoringDimensions: [
      { id: "D1", name: "Rapport & BATNA-Led Confidence", objectiveId: "navigating-the-currents-LO1" },
      { id: "D2", name: "Interest Paraphrasing", objectiveId: "navigating-the-currents-LO2" },
      { id: "D3", name: "MESO Use", objectiveId: "navigating-the-currents-LO2" },
      { id: "D4", name: "Anchor Neutralization", objectiveId: "navigating-the-currents-LO3" },
    ],
    // The live "Negotiation" step runs as a VOICE call with Marcus Vane. As with
    // any voice scenario the text debrief/score steps are skipped; learners
    // debrief in pairs afterward.
    voiceAgentId: "agent_6301kvysy6j4ewabtafd4dtz6f80",
    ui: {
      simNoun: "negotiation",
      simStepLabel: "Negotiation",
      softCapNote: "Marcus is watching the clock — a good moment to land the deal, or to end and debrief.",
      replayLabel: "The Reef-Supply Contract",
      practiceCard: {
        heading: "Practice by doing",
        body: "Step into The Reef-Supply Contract — a live voice negotiation with Marcus Vane, a sharp procurement lead. You play the founder of a reef-safe supplier closing a 12-month deal, and hold the conversation out loud. This is formative practice: nothing is graded here — afterward, you'll debrief in pairs with a partner.",
        cta: "Enter the negotiation",
        meta: "Voice negotiation · ~35 min · formative, not graded",
      },
      pairedDebrief: {
        intro:
          "That's your call with Marcus. The real learning happens out loud — so before you move on, pair up and debrief the negotiation together. Then switch seats and run it again.",
        prompts: [
          "How did it feel — and where did the contract actually land?",
          "When Marcus opened at $48k, did you make him justify it, or did you fire back your own number?",
          "What was Marcus really protecting underneath the price? Did you paraphrase it back to him — and did he confirm it?",
          "Did you put real MESOs on the table — packages that traded price for term, timing, or exclusivity? Which one did he reach for?",
          "Every time you gave ground, what did Marcus do? What will you ask for in return next time?",
          "What's the one move you'll add — and the one habit you'll drop — in your next negotiation?",
        ],
      },
      gate: {
        unlockedTitle: "You read the tide.",
        unlockedBody:
          "Marcus wasn't really guarding a number — he was guarding a story he could take to his CFO, and a switch he couldn't safely make. You made him justify his anchor, surfaced what he actually valued, and traded value instead of caving. That's integrative negotiation.",
        lockedTitle: "Not yet.",
        lockedBody:
          "The deal was there. Marcus's low anchor was bait just above your floor, and his cheaper alternative was riskier than he let on. Make him justify the number, paraphrase what he's really after, and put MESOs on the table — then go back in.",
        lockedHint: "Before you counter his anchor, try: \"Help me understand how you arrived at that figure.\"",
      },
    },
  },

  "coral-scaffolding": {
    scenarioId: "coral-scaffolding-S1",
    moduleId: "coral-scaffolding",
    title: "The Architect's Hour",
    tagline: "A rough plan, a focused hour with your coach, and the questions that decide what you get from it.",
    modality: "advisory conversation",
    estimatedMinutes: 15,
    character: {
      name: "Maren Cole",
      title: "Founding coach · business-plan advisor",
      avatar: "/images/maren.webp",
      persona:
        "The coach you met entering the program — a founding advisor who has helped over 40 first-time entrepreneurs find momentum. Warm but relentlessly honest. With a business plan in front of her she's just as exacting: she spots a hand-wavy market claim in seconds and won't let a vague question stand, but she never makes you feel stupid for not knowing. She's most generous with founders who come honest and ask sharp questions.",
      voice:
        "Direct, curious, unhurried. Asks 'what specifically?' Never tells — always asks. Gets more generous and concrete when you ask a sharp question or name a real gap; warmly hands a vague question back instead of answering it.",
    },
    learnerBrief: {
      situation:
        "You're deeper into Apex now, with a rough, evolving business plan — an executive summary taking shape, a market you're starting to understand, a sense of where the company could go. Maren Cole has carved out a focused hour to help you pressure-test it. She won't write it for you. What you get from the hour depends on how you use it: how you iterate your draft, how clearly you can state your plan, and above all the quality of the questions you bring her.",
      yourRole: "Yourself — a founder with an early, evolving business plan.",
      roleShort: "You",
      yourGoal:
        "Leave with concrete improvements to your plan and a clearer sense of which questions actually move you forward. Iterate a rough draft out loud instead of defending a polished one; state your value proposition, your market evidence, and where the company is headed crisply; and ask sharp, scoped questions — being honest about your real gaps rather than performing polish.",
      givens: [
        "You don't need a finished plan. You need honest gaps and good questions.",
        "Vague questions get vague answers. The sharper and more specific your ask, the better Maren's help.",
        "It's tempting to perform polish to protect your reputation — but that wastes the hour. Candor about a weak spot earns better coaching.",
        "Maren won't write your plan or hand you the answer. She sharpens your thinking and points the way.",
        "Near the end, you'll be asked to name your single biggest open question.",
      ],
      skillsToPractice: [
        "Start rough out loud and revise live — let Maren help you deepen and bridge your draft instead of presenting it as finished (the BizChat way).",
        "Be ready to state, in a sentence each, your value proposition, one evidence-based market claim, and where the company goes next.",
        "Ask expert-worthy questions: specific, scoped to a real decision, and backed by what you already know — not 'what do you think of my idea?'",
      ],
    },
    scoringDimensions: [
      { id: "D1", name: "Iterative Drafting (BizChat)", objectiveId: "coral-scaffolding-LO1" },
      { id: "D2", name: "Plan Component Clarity", objectiveId: "coral-scaffolding-LO2" },
      { id: "D3", name: "Question Quality", objectiveId: "coral-scaffolding-LO3" },
      { id: "D4", name: "Candor over Performance", objectiveId: "coral-scaffolding-LO3" },
    ],
    // The session runs as a VOICE conversation with Maren (her recurring-coach
    // agent, configured with the Phase-2 plan-advisor prompt). Voice skips the
    // text debrief/score; learners debrief in pairs afterward.
    voiceAgentId: "agent_8201kvyvg7s5e318q8hsem6eehm6",
    orientation: {
      heading: "Start here — bring a draft, not a pitch",
      intro:
        "This module is about building your plan like a reef — one iteration at a time — and learning to borrow an expert's time well. Maren Cole is making a focused hour for your evolving plan. Come with a rough draft and honest gaps, not a polished pitch: the whole skill here is asking sharp, scoped questions and being candid about what's weak, so you walk away with real improvements instead of empty reassurance.",
    },
    ui: {
      simNoun: "conversation",
      simStepLabel: "Conversation",
      softCapNote: "You've used real ground with Maren — a good moment to land your biggest question, or to end and debrief.",
      replayLabel: "The Architect's Hour",
      practiceCard: {
        heading: "Sit down with Maren",
        body: "Spend a focused hour with Maren Cole on your evolving business plan. Bring a rough draft and real questions — she'll help you sharpen your value proposition, pressure-test your market, and practice asking the kind of questions that earn an expert's best answer. Come honest about the gaps, not polished.",
        cta: "Start the session",
        meta: "Voice conversation · ~15 min · debrief in pairs afterward",
      },
      pairedDebrief: {
        intro:
          "That's your hour with Maren. The real learning happens out loud — so before you move on, pair up and debrief the session together. Then switch seats and run it again.",
        prompts: [
          "How did it feel — and what's the one thing you most wish you'd asked?",
          "Did you bring Maren a draft to improve, or a pitch to defend? Where did you actually revise something on the spot?",
          "In a sentence each: what's your value proposition, your market evidence, and where the company goes next? Which was fuzziest?",
          "Which of your questions was sharp enough to earn a real answer — and which one did Maren have to hand back to you?",
          "Where did you admit a real gap, and where did you perform polish? Which one got you better help?",
          "What's the single sharpest question you'll walk in with next time you get an expert's time?",
        ],
      },
      gate: {
        unlockedTitle: "You used the hour.",
        unlockedBody:
          "That's how you borrow an expert's time. You brought a draft instead of a pitch, named your real gaps, and asked questions sharp enough to earn real answers — not empty reassurance. Take that habit into every room.",
        lockedTitle: "Not yet.",
        lockedBody:
          "You spent the hour protecting the pitch instead of using Maren. The opening was right there — a rough draft to iterate, a real gap to name, a question scoped tightly enough to get gold. Go back in and ask for what you actually need.",
        lockedHint: "Swap \"what do you think of my idea?\" for a scoped question: \"Between these two first customers, which would you test first — and why?\"",
      },
    },
  },

  "schooling-strategy": {
    scenarioId: "schooling-strategy-S1",
    moduleId: "schooling-strategy",
    title: "Breaking Formation",
    tagline: "Your strongest teammate has gone quiet two weeks before launch. The fix isn't the plan — it's the conversation.",
    modality: "leadership conversation",
    estimatedMinutes: 20,
    character: {
      name: "Priya Raman",
      avatar: "/images/priya.png",
      title: "Head of Operations · your first key hire",
      persona:
        "Your Head of Operations and first key hire — sharp, conscientious, and usually the most vocal person in the room. She has carried the company through every crunch and is fiercely committed to this launch. Right now she's hurt and guarded: she raised a real risk yesterday, got cut off, and has pulled back into clipped, compliant 'just tell me what you need' mode. She isn't sulking — she's protecting herself.",
      voice:
        "Normally direct and warm; right now measured, polite, and a half-step distant, with short answers. Warms and re-engages when she feels genuinely heard and safe; goes quieter when she's pushed, rushed, reassured, or managed.",
    },
    learnerBrief: {
      situation:
        "You're the founder and CEO of a fast-growing startup, two weeks from your biggest launch. In yesterday's planning meeting, Priya Raman — your Head of Operations and first key hire — started to raise a concern about the timeline. In the rush, she got cut off and the plan moved on without her. Since then she's gone quiet: clipped replies, 'just tell me what you need,' none of her usual push. You've asked her for a one-on-one. The whole cross-functional launch is riding on getting her back.",
      yourRole: "The founder and CEO.",
      roleShort: "You",
      yourGoal:
        "Repair the working alliance with Priya, make it genuinely safe for her to say the thing she's holding back, hear the real concern even if you disagree with it, and leave with a shared coordination move for the launch — without steamrolling her again or papering over what happened.",
      givens: [
        "Priya is your strongest operator. Losing her trust two weeks before launch costs you far more than any single timeline call.",
        "Something specific is behind her silence — she raised it once and got cut off. She won't lead with it again until it feels safe.",
        "You can flex the plan: scope, sequencing, who owns what, even the date. What you can't afford is to ship with a risk no one will name.",
        "This is a conversation to repair, not a meeting to win. Rushing to solutions before she feels heard will close the door again.",
        "By the end you'll want one concrete coordination step you both own — but only after the real concern is on the table.",
      ],
      skillsToPractice: [
        "Open by repairing the breakdown, not relitigating the plan — name what happened in the meeting and own your part of it.",
        "Use purposeful inquiry and make it safe to disagree: ask open questions, let her finish, and welcome the dissent instead of defending the timeline.",
        "Once the real concern is out, treat it as information — then co-design a cross-functional coordination move you both own under the two-week clock.",
      ],
    },
    scoringDimensions: [
      { id: "D1", name: "Conversational Repair", objectiveId: "schooling-strategy-LO2" },
      { id: "D2", name: "Psychological Safety & Inquiry", objectiveId: "schooling-strategy-LO1" },
      { id: "D3", name: "Productive Disagreement", objectiveId: "schooling-strategy-LO1" },
      { id: "D4", name: "Cross-Functional Coordination", objectiveId: "schooling-strategy-LO3" },
    ],
    // The one-on-one runs as a VOICE conversation with Priya. Voice skips the
    // text debrief/score; learners debrief in pairs afterward.
    voiceAgentId: "agent_9801kvyx6s8hfxht55na6c55gd7d",
    ui: {
      simNoun: "conversation",
      simStepLabel: "Conversation",
      softCapNote: "You've covered real ground with Priya — a good moment to land a shared next step, or to end and debrief.",
      replayLabel: "Breaking Formation",
      practiceCard: {
        heading: "Practice by doing",
        body: "Step into Breaking Formation — a live voice one-on-one with Priya Raman, your Head of Operations, who's gone quiet two weeks before launch. You're the founder: repair the rupture, make it safe for her to tell you the truth, and align on a way forward. This is formative practice: nothing is graded here — afterward, you'll debrief in pairs with a partner.",
        cta: "Enter the conversation",
        meta: "Voice conversation · ~20 min · debrief in pairs afterward",
      },
      pairedDebrief: {
        intro:
          "That's your one-on-one with Priya. The real learning happens out loud — so before you move on, pair up and debrief the conversation together. Then switch seats and run it again.",
        prompts: [
          "How did it feel — and where do you think you actually stand with Priya now?",
          "How did you open: did you repair the rupture from the meeting, or go straight back to the plan?",
          "Where did you make it safe for her to say the hard thing — and where did you fill the silence yourself?",
          "When her real concern landed, what did you do with it — work it, or defend the date?",
          "What did you leave with: a move you both own, or a to-do you handed her?",
          "Next time a teammate goes quiet on you, what's the exact first thing you'll say?",
        ],
      },
      gate: {
        unlockedTitle: "You brought the school back.",
        unlockedBody:
          "Priya wasn't being difficult — she was testing whether it was safe to tell you the truth. You repaired the rupture before touching the plan, made it safe to disagree, took the hard concern seriously, and left with a move you both own. That's how a school turns together under pressure.",
        lockedTitle: "Not yet.",
        lockedBody:
          "She stayed behind the glass. The concern she was holding — a vendor she's watched slip, a team stretched thin — never made it onto the table, because the rupture from yesterday never got repaired. Go back in: own the meeting first, then make it safe for her to say the thing she tried to say.",
        lockedHint: "Open with repair, not the plan: \"Yesterday I cut you off and moved on. That was on me — and I think you were about to say something I need to hear.\"",
      },
    },
  },

  "the-migration": {
    scenarioId: "the-migration-S1",
    moduleId: "the-migration",
    title: "Open Water",
    tagline: "The hire you need has a bigger offer somewhere else. You can't outspend them — so what can you do?",
    modality: "negotiation",
    estimatedMinutes: 20,
    character: {
      name: "Theo Hanson",
      title: "Senior engineering leader · weighing a competing offer",
      persona:
        "A sought-after senior engineering leader you're trying to hire as a pivotal early team member. Sharp, candid, and genuinely curious about your company — but pragmatic: they have a competing offer from a larger, better-funded firm with a higher base, and they won't leave real money on the table without a reason. They'll engage seriously with a founder who understands total compensation and can sell a real future, and tune out one who just tries to match the other number.",
      voice:
        "Easygoing but precise — asks pointed questions about equity, scope, and runway. Warms when the founder talks ownership and vision with specifics; gets politely skeptical when the founder hand-waves on upside or fixates on matching base.",
    },
    learnerBrief: {
      situation:
        "You're a founder pushing into the open market, and you need to land Theo Hanson — a senior engineering leader who would be a pivotal early hire. Theo's interested enough to take the call, but they have a competing offer from a larger, better-funded company with a higher base salary. You can't win a cash bidding war. You've got 2026 salary-guide data in hand and real levers beyond base — equity, scope, milestones, flexibility — and one conversation to put together a package, and a story, that lands them.",
      yourRole: "The founder and CEO, making a pivotal hire.",
      roleShort: "You",
      yourGoal:
        "Land Theo with a fair, well-justified TOTAL compensation package — not by matching the bigger offer's base (you can't), but by constructing real value across equity, scope, and growth, anchored in market data, and selling the upside and mission money alone can't buy. Protect your runway and cap table while still making an offer Theo can say yes to.",
      givens: [
        "You cannot out-base the larger company. Trying to win on salary alone is a losing game — and it signals you don't understand your own advantage.",
        "You have 2026 salary-guide data: it justifies a fair, competitive base for your stage and shows you where the bigger offer is actually beatable.",
        "Total compensation is your lever: equity/ownership, a signing or milestone bonus, scope and title, flexibility, and an accelerated review all cost less than base and can matter more.",
        "Equity and cash aren't infinite — every point of the cap table and month of runway you spend has a cost. Trade deliberately.",
        "Theo can be won by upside and mission, but only if you make them real and specific — not a hand-wavy 'we're going to be huge.'",
      ],
      skillsToPractice: [
        "Reframe the conversation from base salary to total value — name the levers beyond cash before you talk numbers.",
        "Use 2026 market data to set a defensible base and to quantify the equity upside honestly, instead of hand-waving.",
        "Pitch the mission, scope, and ownership the bigger company can't offer — make the intangible concrete — and trade levers to protect runway and the cap table.",
      ],
    },
    scoringDimensions: [
      { id: "D1", name: "Total-Package Construction", objectiveId: "the-migration-LO1" },
      { id: "D2", name: "Data-Justified Offer", objectiveId: "the-migration-LO1" },
      { id: "D3", name: "Vision & Upside Pitch", objectiveId: "the-migration-LO3" },
      { id: "D4", name: "Trading & Cap-Table Discipline", objectiveId: "the-migration-LO1" },
    ],
    ui: {
      simNoun: "negotiation",
      simStepLabel: "Negotiation",
      softCapNote: "Theo's weighing it against the other offer — a good moment to land the package, or to end and debrief.",
      replayLabel: "Open Water",
      practiceCard: {
        heading: "Practice by doing",
        body: "Step into Open Water — a negotiation with Theo Hanson, a star engineering leader you need, who has a bigger offer elsewhere. You're the founder: you can't outspend a giant, so reframe to total value, justify it with market data, and sell the upside money can't buy. Then debrief with a coach on what happened and what to try next.",
        cta: "Enter the negotiation",
        meta: "Experiential learning · ~20 min · debrief included",
      },
      // The Migration is the one scenario that still runs as TEXT (Theo has no
      // ElevenLabs agent yet), so it is the one most likely to be seen in
      // offline practice mode. Give it copy in its own voice rather than the
      // neutral last-resort lines.
      fallback: {
        simOpener:
          "Thanks for making the time — I've been looking forward to this one. I'll be straight with you: I've got another offer on the table, and the base is meaningfully higher than what I'd expect from a company at your stage. I like what you're building. So convince me. What are we actually talking about here?",
        simReplies: [
          "Okay. But help me hold those two side by side — one of these is money in my account every month, and the other is a maybe. How do you think about that?",
          "I hear the vision. What I can't tell yet is what my actual scope is. Am I building the thing, or am I running the people who build it?",
          "Let's say I believe the upside. What happens if it takes twice as long as you think? What does my life look like in year two?",
        ],
        debriefOpener:
          "That's the call with Theo. I'm your debrief coach, not your judge — my job is to show you what was on the table in there. Before we get analytical: how did that feel, and where do you think Theo actually landed?",
        debriefReplies: [
          "Good. When Theo named the bigger base, what was the very next thing you said? Read it back to yourself.",
          "Here's what most founders miss: Theo never wanted a bidding war. They wanted a reason to choose you. Did you give them one they could repeat to someone else?",
          "Name the one lever you moved that cost you least and mattered most to Theo — and the one you'd trade differently next time.",
        ],
      },
      pairedDebrief: {
        intro:
          "That's your call with Theo. The real learning happens out loud — so before you move on, pair up and debrief the negotiation together. Then switch seats and run it again.",
        prompts: [
          "How did it feel — and where do you think Theo actually landed?",
          "When Theo raised the bigger base and asked how you compete, did you try to match it, or change the game to total value?",
          "Where did your numbers come from — could Theo see how you got to the base and the equity, or did they have to take it on faith?",
          "What did you give Theo that the bigger company couldn't — and did you make it real, or just exciting?",
          "Every lever you moved had a cost. Where did you trade something you valued less for something Theo valued more?",
          "Next time you're outgunned on base, what's the exact first thing you'll say when a candidate names the bigger number?",
        ],
      },
      gate: {
        unlockedTitle: "You landed them in open water.",
        unlockedBody:
          "Theo never wanted a bidding war — they wanted a reason to choose you, and they secretly preferred your company all along. You changed the game to total value, justified every number, made the upside real, and traded with discipline. That's how a founder hires above their cash with the cap table intact.",
        lockedTitle: "Not yet.",
        lockedBody:
          "You fought on their turf. The other offer was higher on base but thin on equity and narrow in scope — and Theo would rather have joined you. Stop matching the number you can't match: reframe to total value, ground it in data, and make the upside concrete. Then go back in.",
        lockedHint: "When Theo names the bigger base, don't flinch toward it — try: \"I can't beat them on cash, and I won't pretend to. Here's what I can give you that they can't.\"",
      },
    },
  },
};

export function getScenarioBrief(slug: string): ScenarioBrief | undefined {
  return SCENARIO_BRIEFS[slug];
}
