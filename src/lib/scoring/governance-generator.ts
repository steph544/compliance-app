import { OrgAnswers, GovernanceBlueprint, ThreeLineOfDefense } from "./types";

function generateThreeLoD(orgSize: string, maturity: string): ThreeLineOfDefense[] {
  const lines: ThreeLineOfDefense[] = [];

  // 1st Line — Project/operational teams
  const firstLine: Record<string, string> = {
    "1-50": "AI Lead + project team",
    "51-500": "Project leads + data stewards",
    "501-5000": "Dedicated model owners per system",
    "5000+": "Model owners + data stewards + algorithm auditors",
  };
  lines.push({
    line: 1,
    role: "Operational Risk Management",
    description: "Project and operational teams perform initial risk and impact assessments for AI systems they own.",
    assignedTo: firstLine[orgSize] || firstLine["51-500"],
  });

  // 2nd Line — AI Governance
  const secondLine: Record<string, string> = {
    "1-50": "Leadership review (quarterly)",
    "51-500": maturity === "production" || maturity === "enterprise"
      ? "AI Governance Committee + designated risk owners per system"
      : "AI Steering Committee (4-6 members)",
    "501-5000": "AI Governance Committee (Legal, IT, HR, Compliance, Security, Risk)",
    "5000+": "Full AI Center of Excellence + AI Ethics Board",
  };
  lines.push({
    line: 2,
    role: "AI Governance & Oversight",
    description: "Validates mitigations, enforces policies, and provides cross-functional governance oversight.",
    assignedTo: secondLine[orgSize] || secondLine["51-500"],
  });

  // 3rd Line — Internal Audit
  const thirdLine: Record<string, string> = {
    "1-50": "External advisor (annual review)",
    "51-500": "Designated internal reviewer",
    "501-5000": "Internal audit function",
    "5000+": "AI Risk Committee + independent audit",
  };
  lines.push({
    line: 3,
    role: "Independent Assurance & Effective Challenge",
    description: "Provides independent verification that AI risk management is functioning effectively.",
    assignedTo: thirdLine[orgSize] || thirdLine["51-500"],
  });

  return lines;
}

function generateRoles(orgSize: string, maturity: string) {
  const roles = [
    { title: "AI Risk Owner", description: "Accountable for risk decisions and sign-off for each AI system.", line: 1 },
    { title: "AI Project Lead", description: "Manages AI project delivery and ensures risk controls are implemented.", line: 1 },
  ];

  if (orgSize !== "1-50") {
    roles.push({ title: "Data Steward", description: "Ensures data quality, privacy, and appropriate use in AI systems.", line: 1 });
    roles.push({ title: "AI Governance Lead", description: "Chairs governance committee and oversees AI risk management program.", line: 2 });
  }

  if (orgSize === "501-5000" || orgSize === "5000+") {
    roles.push({ title: "AI Ethics Advisor", description: "Provides guidance on ethical considerations and bias assessment.", line: 2 });
    roles.push({ title: "AI Compliance Officer", description: "Monitors regulatory requirements and ensures compliance.", line: 2 });
  }

  if (orgSize === "5000+") {
    roles.push({ title: "Chief AI Officer", description: "Executive accountability for AI strategy and governance.", line: 2 });
    roles.push({ title: "AI Audit Lead", description: "Leads independent audit of AI systems and governance processes.", line: 3 });
  }

  return roles;
}

function generateCommittees(orgSize: string, maturity: string) {
  if (orgSize === "1-50") {
    return [{
      name: "AI Leadership Review",
      members: "CEO/CTO + AI Lead + department heads",
      cadence: "Quarterly",
      charter: "Review AI initiatives, assess risks, approve policies, and ensure responsible AI use.",
    }];
  }

  const committees = [{
    name: orgSize === "5000+" ? "AI Center of Excellence" : "AI Governance Committee",
    members: orgSize === "5000+"
      ? "CAIO, Legal, Compliance, IT Security, HR, Risk, Business Unit leads"
      : "AI Governance Lead, Legal, IT, Compliance, Security, key BU representatives",
    cadence: orgSize === "5000+" ? "Monthly" : "Quarterly",
    charter: "Establish AI policies, review risk assessments, approve high-risk AI systems, oversee governance program effectiveness.",
  }];

  if (orgSize === "5000+" || (orgSize === "501-5000" && (maturity === "production" || maturity === "enterprise"))) {
    committees.push({
      name: "AI Ethics Advisory Board",
      members: "Internal ethics advisor, external experts, community representatives",
      cadence: "Quarterly",
      charter: "Advise on ethical implications of AI systems, review bias assessment results, recommend guardrails.",
    });
  }

  return committees;
}

function generateDecisionRights(orgSize: string) {
  const decisions = [
    {
      decision: "New AI system approval",
      responsible: "AI Project Lead",
      accountable: "AI Risk Owner",
      consulted: "Legal, Compliance, Security",
      informed: "Governance Committee",
    },
    {
      decision: "Risk tier classification",
      responsible: "AI Risk Owner",
      accountable: "Governance Committee",
      consulted: "Legal, Data Steward",
      informed: "Executive Sponsor",
    },
    {
      decision: "Go/No-Go for deployment",
      responsible: "AI Project Lead",
      accountable: "AI Risk Owner",
      consulted: "Security, QA, Legal",
      informed: "Governance Committee",
    },
    {
      decision: "Incident response activation",
      responsible: "AI Project Lead",
      accountable: orgSize === "1-50" ? "CTO/CEO" : "AI Governance Lead",
      consulted: "Security, Legal",
      informed: "Executive Leadership",
    },
    {
      decision: "Policy changes",
      responsible: orgSize === "1-50" ? "AI Lead" : "AI Governance Lead",
      accountable: "Governance Committee",
      consulted: "Legal, Compliance, BU Leads",
      informed: "All AI practitioners",
    },
  ];

  return decisions;
}

function generateWhistleblower(orgSize: string) {
  if (orgSize === "1-50") {
    return {
      channel: "Dedicated email alias (e.g., ai-concerns@company.com) with confidentiality guarantee",
      process: "Reports reviewed by AI Lead within 48 hours. Escalation to CEO if unresolved within 1 week.",
      sla: "Triage: 48 hours. Investigation: 2 weeks. Resolution: tracked to closure.",
    };
  }

  if (orgSize === "5000+") {
    return {
      channel: "Anonymous reporting hotline, web portal, and designated ombudsperson for AI concerns",
      process: "Reports triaged by compliance team, investigated by AI audit function, escalated to AI Risk Committee if systemic.",
      sla: "Triage: 24 hours. Investigation: 2 weeks. Resolution: tracked with monthly board reporting.",
    };
  }

  return {
    channel: "Anonymous reporting form and designated AI governance contact",
    process: "Reports reviewed by AI Governance Lead within 48 hours. Investigation by governance committee. Escalation to leadership if needed.",
    sla: "Triage: 48 hours. Investigation: 2 weeks. Resolution: tracked to closure.",
  };
}

function generateEscalation(orgSize: string) {
  const escalation = [
    { level: "Level 1 — Project Team", trigger: "AI system error, unexpected output, user complaint", owner: "AI Project Lead / Model Owner", timeline: "Resolve within 24 hours" },
    { level: "Level 2 — Governance", trigger: "Repeated issues, bias detected, compliance concern, unresolved L1", owner: orgSize === "1-50" ? "AI Lead / CTO" : "AI Governance Lead / Committee", timeline: "Review within 48 hours" },
    { level: "Level 3 — Executive / Audit", trigger: "Systemic risk, regulatory inquiry, safety incident, unresolved L2", owner: orgSize === "5000+" ? "AI Risk Committee / Board" : "Executive Leadership", timeline: "Emergency response within 4 hours" },
  ];

  return escalation;
}

function generateHumanAIPatterns() {
  return [
    {
      pattern: "Human-in-the-loop",
      description: "Human approval required before AI output is acted upon. AI generates recommendations; human makes final decision.",
      whenToApply: "High-stakes decisions (deny services, financial impact, medical/legal, hiring/firing). Required when canDenyServices is true or impactSeverity is critical.",
    },
    {
      pattern: "Human-on-the-loop",
      description: "AI acts autonomously with human monitoring and override capability. Human reviews samples and can intervene.",
      whenToApply: "Medium-risk customer-facing applications with fallback mechanisms. Appropriate for content generation, recommendations, triage.",
    },
    {
      pattern: "Human-out-of-the-loop",
      description: "Fully automated operation, supervised via dashboards and alerts. Human intervention only on alert triggers.",
      whenToApply: "Low-risk internal analytics, recommendations, non-customer-impacting automation. Requires robust monitoring and alerting.",
    },
  ];
}

export function generateGovernanceBlueprint(answers: OrgAnswers): GovernanceBlueprint {
  const orgSize = answers.step1?.orgSize || "51-500";
  const maturity = answers.step3?.maturityStage || "none";

  const cadenceMap: Record<string, string> = {
    "1-50": "Quarterly governance reviews, annual comprehensive audit",
    "51-500": "Quarterly governance committee meetings, bi-annual policy reviews",
    "501-5000": "Monthly governance meetings, quarterly policy reviews, annual comprehensive audit",
    "5000+": "Monthly governance committee, weekly AI CoE sync, quarterly board reporting, annual independent audit",
  };

  return {
    threeLoD: generateThreeLoD(orgSize, maturity),
    roles: generateRoles(orgSize, maturity),
    committees: generateCommittees(orgSize, maturity),
    decisionRights: generateDecisionRights(orgSize),
    reviewCadence: cadenceMap[orgSize] || cadenceMap["51-500"],
    humanAiPatterns: generateHumanAIPatterns(),
    whistleblower: generateWhistleblower(orgSize),
    escalation: generateEscalation(orgSize),
  };
}
