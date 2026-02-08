import { ProductAnswers, FitForAIResult } from "./types";

export function validateFitForAI(answers: ProductAnswers): FitForAIResult {
  const concerns: string[] = [];

  const step2 = answers.step2;

  if (step2?.couldSolveWithoutAI === "yes") {
    concerns.push(
      "This problem can be solved without AI. Consider whether the added complexity, cost, and risk of an AI solution is justified."
    );
  }

  if (step2?.aiMaterialAdvantage === "no") {
    concerns.push(
      "AI does not provide a material advantage over non-AI approaches. The additional governance burden may not be worthwhile."
    );
  }

  if (step2?.machineErrorMoreHarmful === true && step2?.worstCaseImpact === "critical") {
    concerns.push(
      "Machine errors are more harmful than human errors and worst-case impact is critical. A mandatory human-in-the-loop configuration is required before proceeding."
    );
  }

  const hasBlockingConcerns = concerns.length > 0;

  let recommendation: string;
  if (!hasBlockingConcerns) {
    recommendation =
      "AI is a reasonable approach for this use case. Proceed with development while adhering to the organization's governance framework.";
  } else if (
    concerns.length === 1 &&
    step2?.couldSolveWithoutAI === "yes" &&
    step2?.aiMaterialAdvantage !== "no"
  ) {
    recommendation =
      "While the problem could be solved without AI, if AI provides measurable advantages, document the justification clearly and proceed with caution.";
  } else if (
    step2?.machineErrorMoreHarmful === true &&
    step2?.worstCaseImpact === "critical"
  ) {
    recommendation =
      "Do not proceed without establishing a robust human-in-the-loop system and obtaining explicit sign-off from the risk and ethics review board.";
  } else {
    recommendation =
      "Significant concerns have been identified. Re-evaluate whether AI is the right approach, or address each concern with documented mitigations before proceeding.";
  }

  return {
    validated: !hasBlockingConcerns,
    concerns,
    recommendation,
  };
}
