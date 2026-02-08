import type { OrgAnswers, RiskResult } from "@/lib/scoring/types";
import type { PolicyDraft } from "./types";

export function generateTransparencyPolicy(
  answers: OrgAnswers,
  riskResult: RiskResult
): PolicyDraft {
  const orgName = answers.step1?.orgName || "[Organization Name]";
  const sections = [];

  // Introduction
  const usageTypes = answers.step6?.aiUsage || [];
  sections.push({
    title: "Introduction",
    content: `${orgName} uses artificial intelligence to improve our products, services, and operations. We believe in being transparent about how we use AI and how it may affect you.\n\nThis policy explains what AI technologies we use, how we collect and use data with AI, your rights, and how we ensure ethical AI practices.`,
    source: "Organization Profile (Step 1), AI Usage (Step 6)",
  });

  // How We Use AI
  const usageDescriptions: string[] = [];
  if (usageTypes.includes("internal_only")) {
    usageDescriptions.push("**Internal Operations:** We use AI to improve our internal processes, including workflow automation, data analysis, and operational efficiency.");
  }
  if (usageTypes.includes("customer_facing")) {
    usageDescriptions.push("**Customer-Facing Applications:** We use AI in products and services that interact with our customers, including personalization, recommendations, and customer support.");
  }
  if (usageTypes.includes("decision_support")) {
    usageDescriptions.push("**Decision Support:** We use AI to provide insights and recommendations that help our team members make better-informed decisions. Final decisions are made by humans.");
  }
  if (usageTypes.includes("automated_decisions")) {
    usageDescriptions.push("**Automated Decision-Making:** Some of our processes use AI to make or assist with decisions that may affect individuals. These systems are subject to human oversight, and you have the right to request human review of any automated decision that significantly affects you.");
  }

  sections.push({
    title: "1. How We Use AI",
    content: `${orgName} uses AI in the following ways:\n\n${usageDescriptions.join("\n\n")}`,
    source: "AI Usage (Step 6), NIST MAP-2.1, MAP-2.2",
  });

  // Data Collection and AI
  const dataDescriptions: string[] = [];
  if (answers.step5?.pii) dataDescriptions.push("personal information (such as name, email, and contact details)");
  if (answers.step5?.phi) dataDescriptions.push("health-related information (where applicable and with appropriate consent)");
  if (answers.step5?.pci) dataDescriptions.push("payment information (processed in compliance with PCI-DSS standards)");
  if (answers.step5?.biometric) dataDescriptions.push("biometric data (with explicit consent where required by law)");

  sections.push({
    title: "2. Data Collection and AI",
    content: `When using AI, we may process the following types of data:\n\n${dataDescriptions.length > 0 ? `- ${dataDescriptions.join("\n- ")}` : "- General usage and interaction data"}\n\n**How we use data with AI:**\n- **Training and improvement:** We may use aggregated, anonymized data to improve our AI models.\n- **Personalization:** Data may be used to tailor AI-driven features to your needs.\n- **Bias checking:** We use data to test our AI systems for fairness and bias.\n\nWe apply data minimization principles — we only collect and process data that is necessary for the AI system's stated purpose.`,
    source: "Data Posture (Step 5), NIST MEASURE-2.2",
  });

  // Your Rights
  const jurisdictions = answers.step2?.countries || [];
  const hasGDPR = jurisdictions.some((c) => ["EU", "Germany", "France", "Italy", "Spain", "Netherlands", "Belgium", "Austria", "Ireland"].includes(c));
  const hasCCPA = jurisdictions.includes("US") || jurisdictions.includes("United States") || (answers.step2?.usStates?.length || 0) > 0;

  const rights: string[] = [
    "**Right to Explanation:** You can request an explanation of how AI was used in decisions that affect you.",
    "**Right to Appeal:** You can request human review of any automated decision.",
  ];

  if (answers.step9?.recourseMechanisms) {
    rights.push("**Right to Recourse:** We provide mechanisms to challenge AI decisions and seek remediation.");
  }

  if (hasGDPR) {
    rights.push("**GDPR Rights:** If you are in the EU/EEA, you have the right to: access your personal data, request correction or deletion, object to automated decision-making, data portability, and lodge a complaint with a supervisory authority.");
  }

  if (hasCCPA) {
    rights.push("**CCPA Rights:** If you are a California resident, you have the right to: know what personal information is collected, request deletion, opt out of the sale of personal information, and non-discrimination for exercising your rights.");
  }

  sections.push({
    title: "3. Your Rights Over AI and Data",
    content: `We respect your rights regarding AI and your data:\n\n${rights.map((r) => `- ${r}`).join("\n")}`,
    source: "Jurisdictions (Step 2), Stakeholder Engagement (Step 9), NIST GOVERN-5.2",
  });

  // Incident Reporting
  sections.push({
    title: "4. Incident Reporting and Accountability",
    content: `If you experience an issue with our AI systems, we want to hear from you.\n\n- **Report concerns:** Contact us at [Your AI Concerns Email] or use our reporting form.\n- **Response time:** We will acknowledge your report within 48 hours and provide an update within 2 weeks.\n${answers.step8?.incidentResponse ? "- **Incident response:** We have a formal incident response plan for AI-related issues with clear escalation procedures." : "- **Incident response:** We are establishing formal incident response procedures for AI-related issues."}\n\n**Data Protection Officer:** [DPO Name and Contact]`,
    source: "Existing Governance (Step 8), NIST MANAGE-4.3",
  });

  // Ethical AI Use
  sections.push({
    title: "5. Ensuring Ethical AI Use",
    content: `${orgName} takes the following steps to ensure ethical AI use:\n\n- **Governance:** ${answers.step1?.orgSize === "5000+" ? "Our AI Center of Excellence and AI Ethics Board oversee" : answers.step1?.orgSize === "501-5000" ? "Our AI Governance Committee oversees" : "Our leadership team oversees"} the ethical use of AI across the organization.\n- **Bias audits:** We conduct regular bias audits of our AI systems, with frequency based on the system's risk level.\n- **Accountability:** Every AI system has a designated owner responsible for its performance, fairness, and compliance.\n- **Training:** Team members who develop or operate AI systems receive training on responsible AI practices.`,
    source: "Organization Profile (Step 1), NIST GOVERN-2.2, GOVERN-4.1",
  });

  // Policy Updates
  sections.push({
    title: "6. Policy Updates",
    content: `This policy is reviewed and updated regularly to reflect changes in our AI practices, technology, and regulatory requirements.\n\nLast updated: ${new Date().toISOString().split("T")[0]}\nNext scheduled review: ${new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}`,
    source: "NIST MANAGE-4.2",
  });

  // Contact
  sections.push({
    title: "7. Contact Information",
    content: `For questions about this policy or our AI practices:\n\n- **General inquiries:** [Your Customer Service Email]\n- **AI concerns:** [Your AI Governance Email]\n- **Data protection:** [Your DPO Email]\n- **Privacy requests:** [Your Privacy Email]`,
    source: "Template placeholder",
  });

  return {
    title: `${orgName} — AI Transparency Policy`,
    sections,
  };
}
