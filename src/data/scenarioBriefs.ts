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
  };
  learnerBrief: {
    situation: string;
    yourRole: string;
    yourGoal: string;
    givens: string[];
    skillsToPractice: string[];
  };
  /** Public names of the four debrief dimensions — no criteria, no evidence. */
  scoringDimensions: ScoringDimensionBrief[];
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
      persona:
        "Owner of Mercer Marina on Tampa Bay — a 12-vessel charter and slip operation. Practical, plain-spoken, watches every dollar, and runs the place himself. Friendly but cautious: he's been burned by software that demoed beautifully and turned into a nightmare. He mentions a partner he answers to and a couple of other platforms he's weighing.",
      voice:
        "Direct, folksy, concrete — talks in real-world stakes like crew, bookings, and peak season. Warms up when he feels understood; gets guarded when pushed on price with no reason behind it.",
    },
    learnerBrief: {
      situation:
        "You're Jordan, founder of DockOS — a fleet-management and charter-booking platform. You've been in talks with Dale Mercer, owner of Mercer Marina on Tampa Bay, who wants to license DockOS for his 12-vessel operation. Your standard annual license is $12,000. Dale has just come back with a counter at $8,400, and he's mentioned other platforms he's still considering. Your quarter closes in 48 hours.",
      yourRole: "Jordan, founder of DockOS.",
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
  },
};

export function getScenarioBrief(slug: string): ScenarioBrief | undefined {
  return SCENARIO_BRIEFS[slug];
}
