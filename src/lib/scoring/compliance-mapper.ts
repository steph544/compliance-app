import { ProductAnswers, ComplianceRequirement } from "./types";

export function mapCompliance(
  productAnswers: ProductAnswers,
  orgJurisdictions: string[]
): ComplianceRequirement[] {
  const requirements: ComplianceRequirement[] = [];

  const dataTypes = productAnswers.step5?.dataTypes || [];
  const endUsers = productAnswers.step4?.endUsers;
  const canDenyServices = productAnswers.step4?.canDenyServices;
  const decisions = productAnswers.step4?.decisions;

  const euCountries = [
    "EU", "Germany", "France", "Italy", "Spain", "Netherlands",
    "Belgium", "Austria", "Ireland", "Portugal", "Sweden",
    "Denmark", "Finland", "Poland", "Czech Republic", "Greece",
  ];
  const hasEU = orgJurisdictions.some((j) => euCountries.includes(j));
  const hasUS = orgJurisdictions.some((j) => j === "US" || j === "United States" || j.startsWith("US-"));
  const isExternalFacing = endUsers === "customers" || endUsers === "public";

  // EU AI Act
  if (hasEU && isExternalFacing) {
    requirements.push({
      regulation: "EU AI Act",
      requirements: [
        "Conduct a conformity assessment and classify the system by risk tier (unacceptable, high-risk, limited, or minimal).",
        "Implement a risk management system with continuous identification and mitigation of risks throughout the AI lifecycle.",
        "Ensure training, validation, and testing datasets meet quality criteria including representativeness, accuracy, and completeness.",
        "Provide transparency to end users including clear disclosure that they are interacting with an AI system.",
        "Maintain detailed technical documentation sufficient for authorities to assess compliance.",
      ],
      applicability:
        "Applicable because the system operates in an EU jurisdiction and is used by customers or the public. The EU AI Act imposes obligations proportional to the risk level of the AI system.",
      triggerSummary: "Your organization operates in an EU jurisdiction and this product is customer- or public-facing.",
    });
  }

  // HIPAA
  if (hasUS && dataTypes.includes("PHI")) {
    requirements.push({
      regulation: "HIPAA",
      requirements: [
        "Ensure all protected health information (PHI) is encrypted at rest and in transit.",
        "Implement access controls limiting PHI access to authorized personnel and systems with audit logging.",
        "Execute a Business Associate Agreement (BAA) with any third-party AI model provider processing PHI.",
        "Conduct a Security Risk Assessment covering the AI system's handling of PHI.",
        "Establish breach notification procedures compliant with the HIPAA Breach Notification Rule (60-day notification window).",
      ],
      applicability:
        "Applicable because the system processes protected health information (PHI) within a US jurisdiction. HIPAA requires safeguards for the confidentiality, integrity, and availability of PHI.",
      triggerSummary: "This product processes PHI and your organization operates in the US.",
    });
  }

  // PCI-DSS
  if (dataTypes.includes("PCI")) {
    requirements.push({
      regulation: "PCI-DSS",
      requirements: [
        "Restrict storage of cardholder data to the minimum necessary and never store sensitive authentication data post-authorization.",
        "Encrypt transmission of cardholder data across open or public networks.",
        "Implement strong access control measures including unique IDs for each person with computer access.",
        "Regularly test security systems and processes including vulnerability scans and penetration tests.",
        "Maintain an information security policy that addresses AI-specific data handling procedures.",
      ],
      applicability:
        "Applicable because the system processes payment card industry data. PCI-DSS requirements apply to all system components that store, process, or transmit cardholder data.",
      triggerSummary: "This product processes payment card (PCI) data.",
    });
  }

  // COPPA
  if (dataTypes.includes("children") || dataTypes.includes("children_data")) {
    requirements.push({
      regulation: "COPPA",
      requirements: [
        "Obtain verifiable parental consent before collecting personal information from children under 13.",
        "Provide clear and comprehensive privacy policies describing data collection and use practices.",
        "Implement reasonable procedures to protect the confidentiality, security, and integrity of children's personal information.",
        "Give parents the ability to review, delete, and refuse further collection of their child's data.",
        "Retain children's personal information only as long as reasonably necessary to fulfill the purpose for which it was collected.",
      ],
      applicability:
        "Applicable because the system processes data related to children. COPPA imposes strict requirements on the collection and use of personal information from children under 13.",
      triggerSummary: "This product processes data related to children.",
    });
  }

  // State algorithmic accountability laws
  if (hasUS && (canDenyServices || decisions)) {
    requirements.push({
      regulation: "State Algorithmic Accountability Laws",
      requirements: [
        "Conduct an algorithmic impact assessment documenting the system's purpose, data inputs, and potential disparate impacts.",
        "Provide notice to individuals when automated decision-making materially affects them.",
        "Offer a meaningful opportunity for human review and appeal of automated decisions.",
        "Maintain records of automated decisions sufficient to reconstruct the basis for each decision.",
        "Regularly audit the system for discriminatory outcomes across protected classes.",
      ],
      applicability:
        "Applicable because the system makes automated decisions affecting individuals in US jurisdictions. Multiple states (Colorado, Illinois, Connecticut, and others) have enacted or proposed algorithmic accountability requirements.",
      triggerSummary: "Your organization operates in the US and this product can deny services or makes automated decisions affecting individuals.",
    });
  }

  // Biometric privacy laws (BIPA)
  if (dataTypes.includes("biometric")) {
    requirements.push({
      regulation: "Biometric Information Privacy Laws (BIPA and similar)",
      requirements: [
        "Obtain informed written consent before collecting, capturing, or otherwise obtaining biometric identifiers or information.",
        "Publish a publicly available written policy establishing a retention schedule and guidelines for permanently destroying biometric data.",
        "Do not sell, lease, trade, or otherwise profit from biometric identifiers or biometric information.",
        "Store, transmit, and protect biometric data using reasonable security measures at least as protective as those used for other confidential information.",
        "Provide a private right of action for individuals whose biometric data rights are violated.",
      ],
      applicability:
        "Applicable because the system processes biometric data. Illinois BIPA and similar state laws impose strict requirements on the collection, use, retention, and destruction of biometric identifiers.",
      triggerSummary: "This product processes biometric data.",
    });
  }

  return requirements;
}
