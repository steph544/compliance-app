import { ProductAnswers, ReleaseCriterion } from "./types";

export function generateReleaseCriteria(answers: ProductAnswers): ReleaseCriterion[] {
  const criteria: ReleaseCriterion[] = [];

  const baselineMetrics = answers.step8?.baselineMetrics || [];
  const raiConstraints = answers.step8?.raiConstraints || [];
  const projectOwner = answers.step1?.projectOwner || "Unassigned";

  for (const metric of baselineMetrics) {
    criteria.push({
      metric: metric.name,
      type: "ROI",
      threshold: metric.target,
      dataSource: `Baseline measurement: ${metric.currentValue}`,
      owner: projectOwner,
      authority: metric.mustHave ? "block_release" : "allow_with_controls",
    });
  }

  for (const constraint of raiConstraints) {
    criteria.push({
      metric: constraint.metric,
      type: "RAI",
      threshold: constraint.threshold,
      dataSource: `RAI constraint: ${constraint.metric}`,
      owner: constraint.owner || projectOwner,
      authority: "block_release",
    });
  }

  return criteria;
}
