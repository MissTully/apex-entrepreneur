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
   * Optional ElevenLabs Conversational AI agent id. When present, the live
   * "Conversation" step runs as a VOICE call with this agent (via the embedded
   * <elevenlabs-convai> widget) instead of the text chat — and the auto
   * debrief/score steps (which read a text transcript) are skipped, because the
   * voice agent runs the full coach-and-close arc itself. The agent must have
   * public/unauthenticated embedding enabled. Safe to embed client-side: it is
   * a public agent id, not a secret key.
   */
  voiceAgentId?: string;
}

export const SCENARIO_BRIEFS: Record<string, ScenarioBrief> = {
  "apex-positioning": {
    scenarioId: "apex-positioning-S1",
    moduleId: "apex-positioning",
    title: "The Dock Deal",
    tagline: "A buyer counters low and fast. Find what he's really protecting before the quarter closes.",
    modality: "negotiation",
    estimatedMinutes: 15,
    character: {
      name: "Dale Mercer",
      title: "Owner, Mercer Marina · Tampa Bay, FL",
      persona:
        "Owner of Mercer Marina on Tampa Bay — a 12-vessel charter and slip operation. Practical, plain-spoken, watches every dollar, and runs the place himself. Friendly but cautious: he's been burned by software that demoed beautifully and turned into a nightmare. He mentions a partner he answers to and a couple of other platforms he's weighing.",
      voice:
        "Direct, folksy, concrete — talks in real-world stakes like crew, bookings, and peak season. Warms up when he feels understood; gets guarded when pushed on price with no reason behind it.",
    },
    learnerBrief: {
      situation:
        "You're Jordan, founder of DockOS — a fleet-management and charter-booking platform. You've been in talks with Dale Mercer, owner of Mercer Marina on Tampa Bay, who wants to license DockOS for his 12-vessel operation. Your standard annual license is $12,000. Dale has just come back with a counter at $8,400, and he's mentioned other platforms he's still considering. Your quarter closes in 48 hours.",
      yourRole: "Jordan, founder of DockOS.",
      roleShort: "Jordan",
      yourGoal:
        "Close a deal that protects the value of DockOS (ideally at or near your $12,000 license) AND leaves Dale confident he's making the right call — not a discount that signals weakness or a 'pilot' that strips the deal of value.",
      givens: [
        "Your standard annual license is $12,000. That is your value, not an opening bluff.",
        "DockOS onboarding takes 3 days — dramatically faster than most marine software, where switchovers run for weeks.",
        "Your quarter closes in 48 hours. You'd like to close, but a bad-value deal is worse than no deal.",
        "You can flex on onboarding support, payment timing, and expansion terms — you do NOT have to gut the price to win.",
        "Dale opened at $8,400 and says he's looking at other platforms and wants to close this week.",
      ],
      skillsToPractice: [
        "Notice your very first reaction to Dale's $8,400 counter. Are you chasing the win (holding $12k because it's the prize) or avoiding a loss (clinging to $12k out of fear)? Choose your stance on purpose.",
        "Decide whether this is really a zero-sum fight over one number, or a collaborative deal with room to create value — then negotiate the way that read demands.",
        "Separate Dale's position ($8,400) from the interest underneath it. Surface what he's actually protecting, then use evidence to reframe the value — and ask him to confirm what that evidence is worth.",
      ],
    },
    scoringDimensions: [
      { id: "D1", name: "Motivational Focus Awareness", objectiveId: "apex-positioning-LO1" },
      { id: "D2", name: "Game Type Identification", objectiveId: "apex-positioning-LO2" },
      { id: "D3", name: "Position vs. Interest Clarity", objectiveId: "apex-positioning-LO3" },
      { id: "D4", name: "Evidence Use and Confirmation", objectiveId: "apex-positioning-LO3" },
    ],
    ui: {
      simNoun: "negotiation",
      simStepLabel: "Negotiation",
      softCapNote: "Dale's checking the clock — this is a good moment to close, or to end and debrief.",
      replayLabel: "The Dock Deal",
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
    estimatedMinutes: 20,
    character: {
      name: "Maren Cole",
      title: "Founding coach · early-stage mentor",
      persona:
        "A founding advisor and early-stage coach who has helped over 40 first-time entrepreneurs move from paralysis to momentum. Maren is warm but relentlessly honest. She doesn't let people off the hook with vague answers, but she never makes them feel stupid for not knowing. She asks short, precise questions and waits. She believes the biggest obstacle for most entrepreneurs is a belief they haven't examined — and her job is to surface it, not remove it.",
      voice:
        "Direct, curious, unhurried. Uses silence intentionally. Never tells — always asks. Celebrates attempts explicitly and out loud. Will push back gently when a learner attributes failure to fixed ability rather than approach or persistence.",
    },
    learnerBrief: {
      situation:
        "You've just entered the Apex program. Before your first simulation in Phase 1, Maren Cole — a founding coach — wants to have a 20-minute conversation with you. She's not evaluating your skills. She's interested in one thing: the beliefs you're carrying into this program, and whether any of them might be limiting you before you even start.",
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
