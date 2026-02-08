import type { OrgAnswers, RiskResult } from "@/lib/scoring/types";
import type { PolicyDraft } from "./types";

export function generateResponsibleAIPolicy(
  answers: OrgAnswers,
  riskResult: RiskResult
): PolicyDraft {
  const orgName = answers.step1?.orgName || "[Organization Name]";
  const sections = [];

  // Introduction
  sections.push({
    title: "Introduction",
    content: `${orgName} is committed to the responsible development, deployment, and use of artificial intelligence (AI) systems. This policy establishes the principles and guidelines that govern our approach to AI, ensuring our systems are trustworthy, fair, and aligned with our organizational values and regulatory obligations.\n\nThis policy applies to all employees, contractors, and third-party partners involved in the development, procurement, deployment, or operation of AI systems at ${orgName}.`,
    source: "Organization Profile (Step 1)",
  });

  // Fairness
  const hasBiasControls = answers.step6?.aiUsage?.includes("automated_decisions") || answers.step6?.aiUsage?.includes("customer_facing");
  sections.push({
    title: "1. Fairness",
    content: `${orgName} is committed to building AI systems that treat all individuals fairly and equitably.\n\n- We will assess AI systems for potential bias across protected characteristics before deployment.\n- We will use diverse and representative datasets for training and evaluation.\n- We will conduct regular outcome reviews to identify and address disparate impact.${hasBiasControls ? "\n- Automated decision-making systems will undergo mandatory bias impact assessments before go-live." : ""}`,
    source: "Data Posture (Step 5), AI Usage (Step 6), NIST MAP-2.2",
  });

  // Transparency
  const isCustomerFacing = answers.step6?.aiUsage?.includes("customer_facing");
  sections.push({
    title: "2. Transparency",
    content: `${orgName} believes in transparent AI practices.\n\n- We will clearly communicate when AI is being used in our products and services.${isCustomerFacing ? "\n- Customers will be notified when they are interacting with or affected by AI systems." : ""}\n- We will document the purpose, capabilities, and limitations of each AI system.\n- We will maintain an inventory of all AI systems in use across the organization.\n- Explanations of AI-driven decisions will be available upon request where technically feasible.`,
    source: "AI Usage (Step 6), NIST GOVERN-1.4",
  });

  // Privacy
  const dataTypes = [];
  if (answers.step5?.pii) dataTypes.push("PII");
  if (answers.step5?.phi) dataTypes.push("PHI");
  if (answers.step5?.pci) dataTypes.push("PCI");
  if (answers.step5?.biometric) dataTypes.push("biometric data");

  const jurisdictions = answers.step2?.countries || [];
  const hasGDPR = jurisdictions.some((c) => ["EU", "Germany", "France", "Italy", "Spain", "Netherlands"].includes(c));
  const hasCCPA = jurisdictions.includes("US") || jurisdictions.includes("United States");

  sections.push({
    title: "3. Privacy and Data Security",
    content: `${orgName} prioritizes the protection of personal data in our AI systems.\n\n- We practice data minimization — collecting and processing only the data necessary for the AI system's purpose.${dataTypes.length > 0 ? `\n- We handle ${dataTypes.join(", ")} with enhanced security controls and access restrictions.` : ""}\n- All AI training data undergoes privacy review before use.\n- We implement appropriate technical and organizational measures to protect data used in AI systems.${hasGDPR ? "\n- We comply with GDPR requirements for data protection, including data subject rights and data protection impact assessments." : ""}${hasCCPA ? "\n- We comply with CCPA requirements for consumer privacy rights." : ""}`,
    source: "Data Posture (Step 5), Jurisdictions (Step 2), NIST MEASURE-2.2",
  });

  // Accountability
  sections.push({
    title: "4. Accountability",
    content: `${orgName} maintains clear accountability for AI systems.\n\n- Every AI system has a designated risk owner responsible for its governance and compliance.\n- Human oversight is maintained proportional to the risk level of each AI system.\n- Our governance structure ensures appropriate review and approval at each stage of the AI lifecycle.${answers.step8?.incidentResponse ? "\n- Our incident response plan covers AI-specific failure modes and escalation procedures." : "\n- [Action Required] Establish an AI incident response plan with clear escalation procedures."}`,
    source: "Existing Governance (Step 8), NIST GOVERN-2.1",
  });

  // Safety and Reliability
  const maturityDescriptions: Record<string, string> = {
    none: "As we begin our AI journey, we will establish testing and validation practices from the start.",
    pilots: "Our pilot programs include testing and validation protocols to ensure reliable AI performance.",
    production: "Our production AI systems undergo rigorous testing, validation, and continuous monitoring.",
    enterprise: "Our enterprise-wide AI deployment includes comprehensive TEVV (Testing, Evaluation, Verification, and Validation) processes.",
  };

  sections.push({
    title: "5. Safety and Reliability",
    content: `${orgName} is committed to safe and reliable AI systems.\n\n- ${maturityDescriptions[answers.step3?.maturityStage || "none"]}\n- We conduct pre-deployment testing for accuracy, robustness, and safety.\n- We implement continuous monitoring to detect performance degradation and drift.\n- We maintain rollback procedures for AI systems that fail to meet safety standards.`,
    source: "AI Maturity (Step 3), NIST MEASURE-1.3",
  });

  // Managing AI Risks
  const impactAssessments = answers.step9?.impactAssessments;
  sections.push({
    title: "Managing AI Risks — Ethical Considerations",
    content: `${orgName} proactively manages ethical risks in AI.\n\n${impactAssessments === "systematic" ? "- We conduct systematic impact assessments for all AI projects before deployment." : impactAssessments === "ad_hoc" ? "- We conduct impact assessments for AI projects and are working to make this process systematic." : "- [Action Required] Implement AI impact assessments for all projects."}\n${answers.step9?.externalEngagement === "regularly" ? "- We regularly engage external stakeholders — including affected communities — to understand AI impacts." : "- [Recommended] Increase engagement with external stakeholders on AI impacts."}`,
    source: "Stakeholder Engagement (Step 9), NIST GOVERN-4.2, GOVERN-5.1",
  });

  // Bias Mitigation
  const tierGuidance: Record<string, string> = {
    LOW: "Annual bias reviews for all AI systems.",
    MEDIUM: "Semi-annual bias audits with documented findings and remediation plans.",
    HIGH: "Quarterly bias testing with independent review and mandatory remediation before continued operation.",
    REGULATED: "Continuous bias monitoring, quarterly independent audits, and regulatory reporting of findings.",
  };

  sections.push({
    title: "Managing AI Risks — Bias Mitigation",
    content: `${orgName} actively works to identify and mitigate bias in AI systems.\n\n- Cadence: ${tierGuidance[riskResult.tier]}\n- We use quantitative fairness metrics to measure and track bias across protected groups.\n- When bias is detected, we implement remediation strategies including data rebalancing, model retraining, or human-in-the-loop overrides.`,
    source: `Risk Tier: ${riskResult.tier}, NIST MEASURE-2.6`,
  });

  // User Trust
  sections.push({
    title: "Managing AI Risks — User Trust",
    content: `${orgName} values the trust of our users and stakeholders.\n\n${answers.step9?.recourseMechanisms ? "- We provide recourse mechanisms for individuals affected by AI decisions, including the ability to challenge and appeal." : "- [Action Required] Establish recourse mechanisms for individuals affected by AI decisions."}\n- Users can request explanations of AI-driven decisions that affect them.\n- We maintain channels for reporting concerns about AI systems.`,
    source: "Stakeholder Engagement (Step 9), NIST GOVERN-5.2",
  });

  // Continuous Learning
  sections.push({
    title: "Continuous Learning",
    content: `${orgName} commits to continuous improvement of our AI governance practices.\n\n- This policy will be reviewed and updated on a regular cadence.\n- We stay current with evolving AI regulations, standards, and best practices.\n- We invest in AI literacy and ethics training for all team members involved with AI systems.${answers.step9?.publishedPrinciples ? "\n- Our published AI principles are reviewed annually and updated to reflect organizational learning." : ""}`,
    source: "NIST MANAGE-4.2",
  });

  // Commitment
  sections.push({
    title: "Commitment",
    content: `${orgName} is committed to responsible AI practices that benefit our users, employees, and society. This policy reflects our dedication to building AI systems that are trustworthy, fair, transparent, and aligned with our values.\n\nFor questions about this policy, contact: [AI Governance Lead Email]\nLast updated: ${new Date().toISOString().split("T")[0]}`,
    source: "Organization Profile (Step 1)",
  });

  return {
    title: `${orgName} — Responsible AI Policy`,
    sections,
  };
}
