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
};

export function getScenarioBrief(slug: string): ScenarioBrief | undefined {
  return SCENARIO_BRIEFS[slug];
}
