export interface ControlSeed {
  controlId: string;
  name: string;
  description: string;
  type: "TECHNICAL" | "PROCESS" | "LEGAL";
  scope: "ORG" | "PRODUCT" | "BOTH";
  riskTags: string[];
  nistRefIds: string[];
  implementationLevel: "BASELINE" | "ENHANCED" | "HIGH_STAKES";
  implementationSteps: string[];
  evidenceArtifacts: string[];
  vendorGuidance?: Record<string, { service: string; description: string; steps: string[] }>;
}

export const controlsSeedData: ControlSeed[] = [
  // ---------------------------------------------------------------------------
  // ORG-scope Controls (CTL-GOV-001 through CTL-GOV-010)
  // ---------------------------------------------------------------------------
  {
    controlId: "CTL-GOV-001",
    name: "AI Governance Committee",
    description:
      "Establish a cross-functional AI Governance Committee responsible for setting organizational AI strategy, approving high-risk use cases, and ensuring accountability across the AI lifecycle.",
    type: "PROCESS",
    scope: "ORG",
    riskTags: ["oversight", "accountability"],
    nistRefIds: ["GOVERN-1.1"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Identify and appoint committee members from legal, engineering, risk, compliance, and business leadership.",
      "Define the committee charter including decision-making authority, meeting cadence, and escalation paths.",
      "Establish a formal intake process for new AI use cases requiring committee review.",
      "Publish meeting minutes, decisions, and action items in a shared governance repository.",
    ],
    evidenceArtifacts: [
      "Committee charter document with named members and roles",
      "Meeting minutes and decision logs",
      "AI use-case intake and approval records",
    ],
  },
  {
    controlId: "CTL-GOV-002",
    name: "AI Policy Document",
    description:
      "Create and maintain a comprehensive AI policy that articulates the organization's principles, acceptable-use boundaries, and compliance requirements for all AI systems.",
    type: "PROCESS",
    scope: "ORG",
    riskTags: ["oversight", "compliance"],
    nistRefIds: ["GOVERN-1.2"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Draft the AI policy covering purpose, scope, roles, acceptable use, data handling, and prohibited applications.",
      "Circulate the draft for review with legal, compliance, engineering, and executive stakeholders.",
      "Obtain formal sign-off from executive leadership and publish the policy organization-wide.",
      "Schedule annual reviews and establish a change-management process for policy updates.",
    ],
    evidenceArtifacts: [
      "Signed and versioned AI policy document",
      "Policy review and approval records",
      "Distribution and employee acknowledgment logs",
    ],
  },
  {
    controlId: "CTL-GOV-003",
    name: "AI Ethics Board",
    description:
      "Form an AI Ethics Board that provides independent review of AI systems for bias, fairness, and safety concerns, offering recommendations before deployment of sensitive applications.",
    type: "PROCESS",
    scope: "ORG",
    riskTags: ["bias", "fairness", "safety"],
    nistRefIds: ["GOVERN-1.3"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Recruit board members including external ethicists, domain experts, affected-community representatives, and internal leaders.",
      "Define the board's scope of authority, referral criteria, and review process for AI systems.",
      "Create a structured review template covering fairness, bias, societal impact, and safety dimensions.",
      "Publish periodic transparency reports summarizing the board's findings and recommendations.",
      "Integrate board recommendations into the AI development lifecycle as gating criteria for high-risk deployments.",
    ],
    evidenceArtifacts: [
      "Ethics board charter and membership roster",
      "Review reports and recommendation memos",
      "Transparency reports or public summaries",
      "Evidence of recommendations incorporated into deployment decisions",
    ],
  },
  {
    controlId: "CTL-GOV-004",
    name: "AI System Inventory",
    description:
      "Maintain a centralized inventory of all AI systems in use across the organization, including purpose, data sources, risk tier, owner, and deployment status.",
    type: "PROCESS",
    scope: "ORG",
    riskTags: ["auditability", "oversight"],
    nistRefIds: ["GOVERN-1.6"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Design an inventory schema capturing system name, description, owner, risk tier, data sources, deployment status, and vendor information.",
      "Conduct an initial census across all departments to identify existing AI systems and models.",
      "Require registration of new AI systems through the governance intake process before deployment.",
      "Review and update the inventory on a quarterly basis to reflect changes, retirements, and new additions.",
    ],
    evidenceArtifacts: [
      "AI system inventory register with all required fields populated",
      "Quarterly inventory review reports",
      "New-system registration records",
    ],
  },
  {
    controlId: "CTL-GOV-005",
    name: "Third-Party AI Vendor Due Diligence",
    description:
      "Perform structured due diligence on third-party AI vendors and services before procurement, assessing security posture, data handling practices, and alignment with organizational policies.",
    type: "PROCESS",
    scope: "ORG",
    riskTags: ["security", "privacy", "oversight"],
    nistRefIds: ["GOVERN-6.1"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Develop a vendor assessment questionnaire covering data residency, security certifications, model transparency, and incident-response capabilities.",
      "Require completion of the assessment for all new AI vendor engagements and contract renewals.",
      "Review vendor responses with legal, security, and privacy teams and assign a risk rating.",
      "Include AI-specific contractual clauses for data usage, model updates, SLAs, and audit rights.",
      "Re-assess vendors annually or upon significant changes to their services.",
    ],
    evidenceArtifacts: [
      "Completed vendor assessment questionnaires",
      "Vendor risk rating records and approval decisions",
      "Contracts with AI-specific clauses",
      "Annual re-assessment reports",
    ],
  },
  {
    controlId: "CTL-GOV-006",
    name: "AI Incident Response Plan",
    description:
      "Develop and maintain an incident response plan specifically addressing AI-related failures, safety events, adversarial attacks, and unintended harmful outputs.",
    type: "PROCESS",
    scope: "ORG",
    riskTags: ["safety", "security"],
    nistRefIds: ["GOVERN-1.5"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Define AI-specific incident categories such as model failure, data poisoning, adversarial attack, biased output, and privacy breach.",
      "Establish severity levels, escalation paths, and response timelines for each incident category.",
      "Assign incident response roles and ensure on-call coverage for production AI systems.",
      "Conduct tabletop exercises simulating AI incidents at least annually.",
      "Integrate AI incident reporting into the existing enterprise incident management system.",
    ],
    evidenceArtifacts: [
      "AI incident response plan document",
      "Incident severity matrix and escalation procedures",
      "Tabletop exercise reports and lessons learned",
      "Incident post-mortem records",
    ],
  },
  {
    controlId: "CTL-GOV-007",
    name: "Model Risk Owner Assignment",
    description:
      "Assign a named risk owner for every AI model or system who is accountable for its risk posture, compliance status, and lifecycle management.",
    type: "PROCESS",
    scope: "ORG",
    riskTags: ["accountability", "oversight"],
    nistRefIds: ["GOVERN-2.1"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Define the model risk owner role including responsibilities for risk assessment, monitoring, and compliance.",
      "Assign a risk owner to every AI system in the inventory, ensuring coverage for all risk tiers.",
      "Document risk owner assignments in the AI system inventory and communicate responsibilities formally.",
      "Require risk owners to provide quarterly attestations on the status of their assigned systems.",
    ],
    evidenceArtifacts: [
      "Risk owner role definition document",
      "AI inventory records showing assigned risk owners",
      "Quarterly risk owner attestation reports",
    ],
  },
  {
    controlId: "CTL-GOV-008",
    name: "Human Oversight for Automated Decisions",
    description:
      "Ensure meaningful human oversight is embedded in all AI-driven decision processes that significantly affect individuals, with authority to override automated outcomes.",
    type: "PROCESS",
    scope: "ORG",
    riskTags: ["oversight", "safety", "fairness"],
    nistRefIds: ["GOVERN-3.2", "MAP-3.5"],
    implementationLevel: "HIGH_STAKES",
    implementationSteps: [
      "Identify all AI systems making or materially influencing decisions that affect individuals' rights, benefits, or opportunities.",
      "Define human oversight requirements for each system including review thresholds, override authority, and escalation criteria.",
      "Implement technical controls that pause automated decisions for human review when confidence is low or stakes are high.",
      "Train human reviewers on the AI system's capabilities, limitations, and common failure modes.",
      "Log all human override decisions with rationale for audit purposes.",
    ],
    evidenceArtifacts: [
      "Human oversight policy and system-specific requirements",
      "Training records for human reviewers",
      "Override decision logs with rationale",
      "Periodic effectiveness reviews of human oversight processes",
    ],
  },
  {
    controlId: "CTL-GOV-009",
    name: "Regular Governance Review Cadence",
    description:
      "Establish a recurring review cadence for AI governance activities, ensuring policies, controls, and risk assessments are revisited and updated on a defined schedule.",
    type: "PROCESS",
    scope: "ORG",
    riskTags: ["oversight"],
    nistRefIds: ["GOVERN-3.1"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Define governance review frequency based on risk tier: quarterly for high-risk, semi-annually for medium, annually for low.",
      "Create a governance calendar with scheduled review dates for policies, risk assessments, and control effectiveness.",
      "Assign review owners for each governance artifact and distribute reminders ahead of review dates.",
      "Document review outcomes, findings, and any resulting action items with deadlines.",
    ],
    evidenceArtifacts: [
      "Governance review calendar and schedule",
      "Review completion reports with findings",
      "Action item tracking logs",
    ],
  },
  {
    controlId: "CTL-GOV-010",
    name: "Decommissioning & Sunset Policy",
    description:
      "Define a formal process for safely decommissioning AI systems that are no longer needed, performing poorly, or posing unacceptable risk, including data disposal and stakeholder notification.",
    type: "PROCESS",
    scope: "ORG",
    riskTags: ["safety", "accountability"],
    nistRefIds: ["GOVERN-1.7"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Establish criteria that trigger the decommissioning review process, such as performance degradation, regulatory change, or business discontinuation.",
      "Define the decommissioning workflow including stakeholder notification, data retention and disposal, model artifact archival, and documentation.",
      "Require risk owner sign-off before proceeding with decommissioning.",
      "Archive all model artifacts, documentation, and audit trails for the required retention period.",
      "Update the AI system inventory to reflect the decommissioned status.",
    ],
    evidenceArtifacts: [
      "Decommissioning policy document",
      "Decommissioning decision records and sign-offs",
      "Data disposal and archival certificates",
      "Updated AI system inventory entries",
    ],
  },

  // ---------------------------------------------------------------------------
  // BOTH-scope Controls (CTL-MAP-001 through CTL-MAN-008)
  // ---------------------------------------------------------------------------
  {
    controlId: "CTL-MAP-001",
    name: "AI Use-Case Risk Assessment",
    description:
      "Conduct a structured risk assessment for each AI use case before development begins, evaluating potential harms, likelihood, and severity across technical, ethical, and legal dimensions.",
    type: "PROCESS",
    scope: "BOTH",
    riskTags: ["auditability"],
    nistRefIds: ["MAP-1.1"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Create a risk assessment template covering intended use, affected populations, data sensitivity, failure modes, and regulatory requirements.",
      "Require completion of the risk assessment as a gating criterion before entering the development phase.",
      "Have the risk assessment reviewed and approved by the designated risk owner and governance committee for high-risk use cases.",
      "Store completed assessments in the governance repository linked to the AI system inventory entry.",
    ],
    evidenceArtifacts: [
      "Completed risk assessment forms for each AI use case",
      "Risk tier classification records",
      "Approval sign-offs from risk owners or governance committee",
    ],
  },
  {
    controlId: "CTL-MAP-002",
    name: "Stakeholder Impact Analysis",
    description:
      "Identify and analyze the impact of an AI system on all affected stakeholders, including end users, downstream consumers, and communities, to surface fairness and safety concerns early.",
    type: "PROCESS",
    scope: "BOTH",
    riskTags: ["fairness", "safety"],
    nistRefIds: ["MAP-2.1"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Enumerate all stakeholder groups affected by the AI system, including direct users, indirect subjects, and disadvantaged populations.",
      "Assess positive and negative impacts for each group across dimensions of fairness, safety, privacy, and autonomy.",
      "Engage representative stakeholders or proxies for feedback during the design phase.",
      "Document the analysis and incorporate findings into the system's risk treatment plan.",
      "Re-evaluate stakeholder impacts whenever significant changes are made to the system.",
    ],
    evidenceArtifacts: [
      "Stakeholder impact analysis report",
      "Stakeholder engagement records and feedback summaries",
      "Evidence of impact findings integrated into design decisions",
    ],
  },
  {
    controlId: "CTL-MAP-003",
    name: "Data Provenance Documentation",
    description:
      "Document the origin, lineage, transformations, and quality characteristics of all data used to train, fine-tune, or evaluate AI models, ensuring traceability and auditability.",
    type: "PROCESS",
    scope: "BOTH",
    riskTags: ["privacy", "auditability"],
    nistRefIds: ["MAP-2.3"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Create a data provenance template capturing source, collection method, consent basis, transformations applied, and known quality issues.",
      "Complete provenance documentation for all training, validation, and evaluation datasets before model development.",
      "Maintain version control for datasets and link each model version to the specific data versions used.",
      "Review data provenance records during model audits and governance reviews.",
    ],
    evidenceArtifacts: [
      "Data provenance records for each dataset",
      "Dataset version control logs",
      "Data quality assessment reports",
    ],
  },
  {
    controlId: "CTL-MAP-004",
    name: "Bias Impact Assessment",
    description:
      "Perform a comprehensive bias impact assessment examining how the AI system may produce disparate outcomes across protected groups, covering data, model, and deployment-level biases.",
    type: "PROCESS",
    scope: "BOTH",
    riskTags: ["bias", "fairness"],
    nistRefIds: ["MAP-2.2"],
    implementationLevel: "HIGH_STAKES",
    implementationSteps: [
      "Define the protected attributes and demographic groups relevant to the AI system's domain and jurisdiction.",
      "Analyze training data for representation gaps, label bias, and proxy variables correlated with protected attributes.",
      "Evaluate model outputs for disparate impact using appropriate fairness metrics such as demographic parity, equalized odds, and predictive parity.",
      "Document identified biases, their potential real-world impact, and planned mitigations.",
      "Re-run the bias impact assessment after any significant model retraining or data update.",
    ],
    evidenceArtifacts: [
      "Bias impact assessment report with quantitative findings",
      "Fairness metric evaluation results",
      "Mitigation plan for identified biases",
      "Re-assessment records after model updates",
    ],
  },
  {
    controlId: "CTL-MAP-005",
    name: "Regulatory Applicability Mapping",
    description:
      "Map each AI system to the applicable regulatory frameworks, laws, and standards in every jurisdiction where it operates, ensuring compliance obligations are identified and tracked.",
    type: "LEGAL",
    scope: "BOTH",
    riskTags: ["compliance"],
    nistRefIds: ["MAP-3.1"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Identify all jurisdictions where the AI system is deployed or where its outputs affect individuals.",
      "Map applicable regulations such as the EU AI Act, state privacy laws, sector-specific rules, and industry standards to the system.",
      "Document specific compliance requirements and obligations for each applicable regulation.",
      "Assign responsibility for ongoing regulatory monitoring and update the mapping when regulations change.",
    ],
    evidenceArtifacts: [
      "Regulatory applicability matrix per AI system",
      "Compliance obligation register",
      "Regulatory change monitoring logs",
    ],
  },
  {
    controlId: "CTL-MAP-006",
    name: "AI System Context Documentation",
    description:
      "Document the operational context of each AI system including its intended purpose, deployment environment, user base, limitations, and conditions under which the system should not be used.",
    type: "PROCESS",
    scope: "BOTH",
    riskTags: ["auditability"],
    nistRefIds: ["MAP-1.5"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Define a context documentation template covering intended use, out-of-scope uses, deployment environment, user personas, and known limitations.",
      "Complete context documentation during the design phase and update it as the system evolves.",
      "Make context documentation accessible to operators, reviewers, and auditors.",
      "Reference the context documentation in risk assessments and model cards.",
    ],
    evidenceArtifacts: [
      "AI system context document for each system",
      "Version history of context documentation updates",
      "Cross-references in risk assessments and model cards",
    ],
  },
  {
    controlId: "CTL-MEA-001",
    name: "Model Performance Metrics",
    description:
      "Define, collect, and monitor key performance metrics for each AI model in production, establishing baselines and thresholds that trigger alerts when degradation occurs.",
    type: "TECHNICAL",
    scope: "BOTH",
    riskTags: ["drift", "auditability"],
    nistRefIds: ["MEASURE-1.1"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Identify the primary performance metrics relevant to the model's task such as accuracy, precision, recall, F1, BLEU, or RMSE.",
      "Establish baseline values from validation data and define acceptable performance thresholds.",
      "Implement automated metric collection pipelines that run on a scheduled basis against production data.",
      "Configure alerting to notify the risk owner when metrics breach defined thresholds.",
    ],
    evidenceArtifacts: [
      "Performance metric definitions and baseline values",
      "Automated metric collection pipeline configuration",
      "Performance monitoring dashboards or reports",
      "Alert configuration and notification records",
    ],
  },
  {
    controlId: "CTL-MEA-002",
    name: "Fairness & Bias Metrics",
    description:
      "Implement quantitative fairness and bias metrics that are evaluated regularly in production, tracking disparate impact across protected groups over time.",
    type: "TECHNICAL",
    scope: "BOTH",
    riskTags: ["bias", "fairness"],
    nistRefIds: ["MEASURE-2.6"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Select fairness metrics appropriate to the use case such as demographic parity, equalized odds, calibration across groups, or individual fairness measures.",
      "Implement automated fairness metric computation pipelines that run on production data sliced by protected attributes.",
      "Define acceptable thresholds for each metric and configure alerting for threshold breaches.",
      "Publish fairness metric reports to stakeholders on a regular cadence.",
      "Trigger a bias impact assessment review when metrics indicate emerging disparities.",
    ],
    evidenceArtifacts: [
      "Fairness metric definitions and threshold documentation",
      "Automated fairness evaluation pipeline configuration",
      "Periodic fairness metric reports",
      "Alert and escalation records for threshold breaches",
    ],
  },
  {
    controlId: "CTL-MEA-003",
    name: "Drift Detection & Alerting",
    description:
      "Implement statistical drift detection methods to identify when input data distributions or model output patterns shift beyond acceptable bounds, triggering timely alerts and remediation.",
    type: "TECHNICAL",
    scope: "BOTH",
    riskTags: ["drift", "safety"],
    nistRefIds: ["MEASURE-2.5"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Define reference distributions for key input features and output predictions from the training or validation dataset.",
      "Implement drift detection algorithms such as PSI, KS test, or KL divergence on a scheduled basis.",
      "Configure alert thresholds and notification channels for detected drift events.",
      "Establish a remediation workflow that includes investigation, root-cause analysis, and potential model retraining.",
    ],
    evidenceArtifacts: [
      "Drift detection pipeline configuration and methodology documentation",
      "Reference distribution baselines",
      "Drift detection reports and alert logs",
      "Remediation action records for drift events",
    ],
  },
  {
    controlId: "CTL-MEA-004",
    name: "Red-Teaming / Adversarial Testing",
    description:
      "Conduct structured red-teaming exercises and adversarial testing against AI systems to identify vulnerabilities, safety failures, and exploitable weaknesses before and after deployment.",
    type: "TECHNICAL",
    scope: "BOTH",
    riskTags: ["security", "safety", "injection"],
    nistRefIds: ["MEASURE-2.7"],
    implementationLevel: "HIGH_STAKES",
    implementationSteps: [
      "Define the scope and objectives for each red-teaming exercise, covering prompt injection, jailbreaking, data extraction, and adversarial inputs.",
      "Assemble a red team with diverse expertise including security, ML, and domain knowledge.",
      "Execute structured attack scenarios and document all findings, including successful exploits and near-misses.",
      "Prioritize findings by severity and likelihood, and develop remediation plans for critical issues.",
      "Re-test after remediation to verify fixes are effective and schedule periodic red-teaming exercises.",
    ],
    evidenceArtifacts: [
      "Red-teaming exercise plan and scope document",
      "Findings report with severity ratings",
      "Remediation plan and verification test results",
      "Periodic red-teaming schedule and completion records",
    ],
  },
  {
    controlId: "CTL-MEA-005",
    name: "Explainability Assessment",
    description:
      "Evaluate and document the explainability of AI system decisions, ensuring that appropriate explanation methods are available for the system's risk level and stakeholder needs.",
    type: "PROCESS",
    scope: "BOTH",
    riskTags: ["auditability", "fairness"],
    nistRefIds: ["MEASURE-2.8"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Assess the explainability requirements based on the system's risk tier, regulatory obligations, and stakeholder needs.",
      "Select appropriate explainability methods such as SHAP, LIME, attention visualization, or counterfactual explanations.",
      "Implement and validate the chosen explanation methods, ensuring they provide meaningful and accurate explanations.",
      "Document the explainability approach, its limitations, and how explanations are surfaced to different audiences.",
    ],
    evidenceArtifacts: [
      "Explainability assessment report",
      "Documentation of selected explanation methods and their validation",
      "Sample explanations for representative decisions",
      "User-facing explanation design specifications",
    ],
  },
  {
    controlId: "CTL-MEA-006",
    name: "TEVV Plan",
    description:
      "Create a Test, Evaluation, Verification, and Validation plan that defines how the AI system will be rigorously tested across functional, safety, fairness, and performance dimensions before deployment.",
    type: "PROCESS",
    scope: "BOTH",
    riskTags: ["auditability"],
    nistRefIds: ["MEASURE-1.3"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Define the TEVV scope covering functional correctness, performance benchmarks, safety boundaries, fairness criteria, and security testing.",
      "Specify test cases, datasets, evaluation metrics, and acceptance criteria for each dimension.",
      "Assign TEVV responsibilities and integrate the plan into the development lifecycle as a pre-deployment gate.",
      "Execute the TEVV plan and document all results, including any deviations from acceptance criteria.",
    ],
    evidenceArtifacts: [
      "TEVV plan document with scope, criteria, and responsibilities",
      "Test case specifications and evaluation datasets",
      "TEVV execution results and acceptance sign-off",
    ],
  },
  {
    controlId: "CTL-MEA-007",
    name: "Third-Party Model Evaluation",
    description:
      "Evaluate third-party and foundation models for security risks, hallucination rates, and alignment with organizational requirements before integration into products.",
    type: "TECHNICAL",
    scope: "BOTH",
    riskTags: ["security", "hallucination"],
    nistRefIds: ["MEASURE-2.9"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Define evaluation criteria for third-party models covering accuracy, hallucination rate, security vulnerabilities, bias characteristics, and terms of use.",
      "Create a standardized evaluation benchmark suite relevant to the intended use case.",
      "Execute the evaluation and document results, comparing against internal thresholds and alternative models.",
      "Require evaluation sign-off from the risk owner before integrating the third-party model into production systems.",
      "Re-evaluate when the vendor releases significant model updates or version changes.",
    ],
    evidenceArtifacts: [
      "Third-party model evaluation criteria and benchmark suite",
      "Evaluation results report with comparison data",
      "Risk owner sign-off for model integration",
      "Re-evaluation records for model version updates",
    ],
  },
  {
    controlId: "CTL-MAN-001",
    name: "Risk Treatment Plan",
    description:
      "Develop and maintain a risk treatment plan for each AI system that documents identified risks, chosen treatment strategies, responsible owners, and timelines for mitigation.",
    type: "PROCESS",
    scope: "BOTH",
    riskTags: ["oversight"],
    nistRefIds: ["MANAGE-1.1"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "For each identified risk from the risk assessment, select a treatment strategy: mitigate, accept, transfer, or avoid.",
      "Document the treatment plan with specific actions, responsible owners, target completion dates, and success criteria.",
      "Track treatment plan progress and report status to the governance committee at each review cycle.",
      "Update the treatment plan as risks evolve or new risks emerge during the system lifecycle.",
    ],
    evidenceArtifacts: [
      "Risk treatment plan document per AI system",
      "Treatment progress tracking reports",
      "Governance committee review records of risk treatment status",
    ],
  },
  {
    controlId: "CTL-MAN-002",
    name: "Prompt Injection Guardrails",
    description:
      "Implement technical guardrails to detect and prevent prompt injection attacks that attempt to override system instructions or extract sensitive information from AI systems.",
    type: "TECHNICAL",
    scope: "BOTH",
    riskTags: ["injection", "security"],
    nistRefIds: ["MANAGE-2.2"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Implement input preprocessing to detect common prompt injection patterns such as instruction override attempts, role-play exploits, and delimiter manipulation.",
      "Deploy a layered defense with system-level instruction hardening, input classification, and output validation.",
      "Maintain and update a prompt injection pattern library based on emerging attack techniques.",
      "Test guardrails regularly using adversarial prompt injection test suites.",
    ],
    evidenceArtifacts: [
      "Prompt injection guardrail architecture documentation",
      "Prompt injection pattern library and update logs",
      "Adversarial test suite results",
      "Guardrail effectiveness monitoring reports",
    ],
  },
  {
    controlId: "CTL-MAN-003",
    name: "Output Filtering & Content Safety",
    description:
      "Implement output filtering mechanisms to detect and block harmful, toxic, or inappropriate content generated by AI systems before it reaches end users.",
    type: "TECHNICAL",
    scope: "BOTH",
    riskTags: ["hallucination", "safety"],
    nistRefIds: ["MANAGE-2.3"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Define content safety policies specifying categories of prohibited output such as hate speech, violence, self-harm, and misinformation.",
      "Implement automated content classifiers that evaluate model outputs against safety policies before delivery.",
      "Configure blocking, flagging, or fallback responses for outputs that violate safety policies.",
      "Monitor filter effectiveness metrics and tune thresholds to balance safety with usability.",
    ],
    evidenceArtifacts: [
      "Content safety policy document",
      "Output filter configuration and threshold settings",
      "Filter effectiveness metrics and tuning logs",
      "Blocked content review records",
    ],
  },
  {
    controlId: "CTL-MAN-004",
    name: "PII/PHI Data Handling Controls",
    description:
      "Implement technical controls to protect personally identifiable information and protected health information throughout the AI data pipeline, including collection, storage, processing, and model training.",
    type: "TECHNICAL",
    scope: "BOTH",
    riskTags: ["privacy"],
    nistRefIds: ["MANAGE-3.1"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Classify all data sources used by AI systems for the presence of PII and PHI.",
      "Implement data minimization practices, collecting only the data necessary for the intended purpose.",
      "Apply encryption at rest and in transit for all datasets containing PII or PHI.",
      "Implement access controls ensuring only authorized personnel and systems can access sensitive data.",
      "Establish data retention and deletion policies aligned with regulatory requirements.",
    ],
    evidenceArtifacts: [
      "Data classification records for AI datasets",
      "Encryption and access control configuration documentation",
      "Data retention policy and deletion logs",
      "Privacy impact assessment records",
    ],
  },
  {
    controlId: "CTL-MAN-005",
    name: "Model Rollback Procedure",
    description:
      "Establish a documented and tested procedure for quickly rolling back an AI model to a previous known-good version when critical issues are detected in production.",
    type: "TECHNICAL",
    scope: "BOTH",
    riskTags: ["safety", "drift"],
    nistRefIds: ["MANAGE-4.1"],
    implementationLevel: "HIGH_STAKES",
    implementationSteps: [
      "Maintain versioned archives of all production model artifacts including weights, configurations, and dependencies.",
      "Document the rollback procedure with step-by-step instructions, responsible roles, and estimated completion time.",
      "Implement automated or semi-automated rollback capabilities in the deployment pipeline.",
      "Test the rollback procedure at least quarterly through dry-run exercises.",
      "Define rollback trigger criteria and integrate them with monitoring alerts.",
    ],
    evidenceArtifacts: [
      "Model version archive and retention records",
      "Rollback procedure document with step-by-step instructions",
      "Rollback dry-run exercise reports",
      "Rollback trigger criteria and alert configuration",
    ],
  },
  {
    controlId: "CTL-MAN-006",
    name: "Continuous Monitoring Dashboard",
    description:
      "Deploy a centralized monitoring dashboard that provides real-time visibility into AI system health, performance metrics, drift indicators, and safety signals across the portfolio.",
    type: "TECHNICAL",
    scope: "BOTH",
    riskTags: ["drift", "oversight"],
    nistRefIds: ["MANAGE-2.4"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Define the key indicators to display including performance metrics, drift scores, error rates, latency, fairness metrics, and safety filter activations.",
      "Build or configure a dashboard platform that aggregates metrics from all production AI systems.",
      "Implement real-time or near-real-time data feeds from model serving infrastructure and monitoring pipelines.",
      "Configure role-based access so risk owners, operators, and governance teams can view relevant metrics.",
    ],
    evidenceArtifacts: [
      "Dashboard design specification and metric definitions",
      "Dashboard deployment and access configuration records",
      "Screenshots or exports of operational dashboards",
      "Data freshness and reliability monitoring logs",
    ],
  },
  {
    controlId: "CTL-MAN-007",
    name: "AI Incident Escalation Workflow",
    description:
      "Define and automate an escalation workflow for AI-related incidents, ensuring the right stakeholders are notified and engaged based on incident severity and type.",
    type: "PROCESS",
    scope: "BOTH",
    riskTags: ["safety", "security"],
    nistRefIds: ["MANAGE-4.2"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Define escalation tiers mapping incident severity levels to the appropriate responders including on-call engineers, risk owners, legal, and executive leadership.",
      "Configure automated notifications and escalation triggers in the incident management system.",
      "Establish communication templates and channels for each escalation tier.",
      "Conduct escalation drills to verify the workflow functions correctly and responders are prepared.",
      "Review and update the escalation workflow after each significant incident.",
    ],
    evidenceArtifacts: [
      "Escalation workflow documentation with tier definitions",
      "Automated notification and trigger configuration records",
      "Escalation drill reports",
      "Post-incident escalation effectiveness reviews",
    ],
  },
  {
    controlId: "CTL-MAN-008",
    name: "Audit Trail & Logging",
    description:
      "Implement comprehensive audit trail logging for AI system operations, capturing inputs, outputs, decisions, configuration changes, and access events in tamper-evident logs.",
    type: "TECHNICAL",
    scope: "BOTH",
    riskTags: ["auditability", "compliance"],
    nistRefIds: ["MANAGE-3.2"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Define the logging schema covering request/response payloads, timestamps, user identifiers, model versions, configuration changes, and access events.",
      "Implement logging at the API gateway, model serving layer, and data pipeline stages.",
      "Store logs in a tamper-evident, centralized logging system with appropriate retention periods.",
      "Ensure logs are searchable and exportable for audit and investigation purposes.",
    ],
    evidenceArtifacts: [
      "Logging schema and retention policy documentation",
      "Log infrastructure configuration records",
      "Sample audit trail exports demonstrating completeness",
      "Log integrity and tamper-evidence verification records",
    ],
  },

  // ---------------------------------------------------------------------------
  // PRODUCT-scope Controls (CTL-PROD-001 through CTL-PROD-020)
  // ---------------------------------------------------------------------------
  {
    controlId: "CTL-PROD-001",
    name: "Input Validation & Sanitization",
    description:
      "Implement input validation and sanitization for all data entering the AI system, rejecting malformed inputs and neutralizing potentially harmful payloads before they reach the model.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["injection", "security"],
    nistRefIds: ["MANAGE-2.2", "MEASURE-2.7"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Define input schemas specifying allowed formats, lengths, character sets, and value ranges for each API endpoint.",
      "Implement server-side validation that rejects inputs not conforming to the defined schemas.",
      "Apply sanitization routines to strip or escape special characters and known injection patterns.",
      "Log all rejected or sanitized inputs for security monitoring and tuning.",
    ],
    evidenceArtifacts: [
      "Input validation schema definitions",
      "Sanitization rule configuration",
      "Rejected input logs and analysis reports",
      "Validation test suite results",
    ],
    vendorGuidance: {
      aws: {
        service: "AWS WAF + API Gateway",
        description:
          "Use AWS WAF rules on API Gateway to enforce input validation, rate limiting, and request filtering before requests reach the AI backend.",
        steps: [
          "Configure API Gateway request validators with JSON schema definitions for all AI endpoints.",
          "Deploy AWS WAF with managed rule groups for common injection patterns.",
          "Create custom WAF rules for AI-specific input constraints such as maximum prompt length.",
          "Enable WAF logging to S3 or CloudWatch for rejected request analysis.",
        ],
      },
      azure: {
        service: "Azure API Management + Azure WAF",
        description:
          "Use Azure API Management policies and Azure WAF to validate and sanitize inputs before they reach the AI service.",
        steps: [
          "Configure API Management inbound policies for request validation including schema validation and size limits.",
          "Deploy Azure WAF on Application Gateway with OWASP rule sets.",
          "Create custom validation policies for AI-specific input constraints.",
          "Enable diagnostic logging for blocked and modified requests.",
        ],
      },
      openai: {
        service: "Custom middleware + OpenAI Moderation API",
        description:
          "Build a validation middleware layer that checks inputs against schemas and runs them through the Moderation API before forwarding to the completions endpoint.",
        steps: [
          "Implement a middleware service that validates input length, format, and character constraints before calling the OpenAI API.",
          "Call the OpenAI Moderation API on user inputs to flag harmful content before processing.",
          "Implement custom regex and pattern matching for domain-specific injection patterns.",
          "Log all validation failures and moderation flags for review.",
        ],
      },
      generic: {
        service: "Application-level validation framework",
        description:
          "Implement a validation layer in the application code that enforces input constraints, sanitizes payloads, and rejects malformed requests.",
        steps: [
          "Define JSON schemas or validation rules for all AI system input endpoints.",
          "Implement server-side validation middleware using a framework such as Joi, Pydantic, or Zod.",
          "Add sanitization for HTML, SQL, and prompt injection patterns.",
          "Write automated tests covering boundary values, malformed inputs, and known attack payloads.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-002",
    name: "Prompt Injection Defense Layer",
    description:
      "Deploy a dedicated defense layer that detects and blocks prompt injection attempts targeting LLM-based systems, using pattern matching, classification models, and system prompt hardening.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["injection", "security"],
    nistRefIds: ["MANAGE-2.2", "MEASURE-2.7"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Harden system prompts with explicit instruction boundaries and injection-resistant framing.",
      "Deploy a prompt injection classifier that evaluates user inputs before they are included in the LLM context.",
      "Implement output validation to detect when the model's response indicates a successful injection such as system prompt leakage.",
      "Maintain a continuously updated library of known injection patterns and test against them regularly.",
      "Configure fallback behavior for detected injection attempts, such as returning a safe default response.",
    ],
    evidenceArtifacts: [
      "Prompt injection defense architecture documentation",
      "Injection classifier accuracy and false-positive metrics",
      "Injection pattern library and update changelog",
      "Adversarial testing results and remediation records",
    ],
    vendorGuidance: {
      aws: {
        service: "Amazon Bedrock Guardrails",
        description:
          "Use Bedrock Guardrails to configure content filters and denied topic policies that detect and block prompt injection attempts at the platform level.",
        steps: [
          "Create a Bedrock Guardrail with content filter policies targeting prompt injection categories.",
          "Configure denied topics for instruction override and role-play exploitation patterns.",
          "Apply the guardrail to all Bedrock model invocations via the guardrailIdentifier parameter.",
          "Monitor guardrail activation metrics in CloudWatch and review blocked requests.",
          "Supplement with custom pre-processing Lambda for domain-specific injection patterns.",
        ],
      },
      azure: {
        service: "Azure AI Content Safety Prompt Shields",
        description:
          "Use Azure AI Content Safety Prompt Shields to detect and block both direct and indirect prompt injection attacks against LLM applications.",
        steps: [
          "Enable Prompt Shields in the Azure AI Content Safety resource for your deployment region.",
          "Integrate the Prompt Shields API into your application's request pipeline to evaluate user inputs and document content.",
          "Configure blocking thresholds for User Prompt attacks and Document attacks.",
          "Monitor detection results and tune thresholds based on false-positive analysis.",
          "Combine with Azure OpenAI content filtering for layered defense.",
        ],
      },
      openai: {
        service: "OpenAI Moderation API + custom defense layer",
        description:
          "Combine the OpenAI Moderation API with a custom prompt injection detection layer to screen inputs before they reach the completions API.",
        steps: [
          "Call the Moderation API on all user inputs to catch overtly harmful injection attempts.",
          "Build a custom classifier trained on prompt injection datasets to catch instruction-override patterns.",
          "Harden system prompts with delimiter tokens and explicit instruction boundaries.",
          "Implement output scanning to detect system prompt leakage or instruction echoing.",
          "Log all detection events and review false positives weekly.",
        ],
      },
      generic: {
        service: "Open-source prompt injection detection",
        description:
          "Deploy an open-source prompt injection detection solution such as rebuff, LLM Guard, or a custom classifier as a middleware layer.",
        steps: [
          "Evaluate and select an open-source prompt injection detection library or build a custom classifier.",
          "Deploy the detection layer as middleware between the client and the LLM endpoint.",
          "Configure detection sensitivity and define fallback responses for blocked requests.",
          "Regularly update detection patterns from community threat intelligence feeds.",
          "Run automated prompt injection test suites as part of CI/CD.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-003",
    name: "Output Filtering & Content Safety",
    description:
      "Apply automated content safety filters to AI model outputs to detect and block harmful, toxic, misleading, or policy-violating content before it is delivered to users.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["hallucination", "safety"],
    nistRefIds: ["MANAGE-2.3", "MEASURE-2.3"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Define output safety policies covering prohibited content categories relevant to the product context.",
      "Implement automated output classifiers that evaluate generated content against safety policies.",
      "Configure response handling for policy violations including blocking, redacting, or substituting safe alternatives.",
      "Monitor filter activation rates, false positives, and user impact to continuously tune thresholds.",
      "Review a sample of filtered outputs regularly to validate filter effectiveness.",
    ],
    evidenceArtifacts: [
      "Output safety policy document",
      "Filter configuration and threshold settings",
      "Filter activation rate metrics and trend reports",
      "Manual review records for filtered output samples",
    ],
    vendorGuidance: {
      aws: {
        service: "Amazon Bedrock Guardrails + Amazon Comprehend",
        description:
          "Use Bedrock Guardrails output filters to block harmful content and Amazon Comprehend for additional sentiment and toxicity analysis on model responses.",
        steps: [
          "Configure Bedrock Guardrails with output content filter strengths for hate, insults, sexual, violence, and misconduct categories.",
          "Enable sensitive information filters for PII in outputs.",
          "Integrate Amazon Comprehend toxicity detection as a secondary validation layer for critical use cases.",
          "Monitor guardrail output filter metrics in CloudWatch dashboards.",
          "Review blocked outputs periodically to tune filter sensitivity.",
        ],
      },
      azure: {
        service: "Azure AI Content Safety",
        description:
          "Use Azure AI Content Safety to analyze and filter AI model outputs across categories including hate, violence, sexual content, and self-harm.",
        steps: [
          "Provision an Azure AI Content Safety resource and configure severity thresholds for each content category.",
          "Integrate the Content Safety API into the response pipeline to evaluate all model outputs before delivery.",
          "Configure blocklist policies for domain-specific prohibited terms and phrases.",
          "Enable content safety logging and set up alerts for high-severity detections.",
          "Review flagged content samples monthly to refine classification thresholds.",
        ],
      },
      openai: {
        service: "OpenAI Moderation API",
        description:
          "Use the OpenAI Moderation API to evaluate model outputs for harmful content across multiple categories before returning responses to users.",
        steps: [
          "Call the Moderation API on all assistant responses before delivering them to the end user.",
          "Configure handling logic for each flagged category such as blocking, warning, or fallback messaging.",
          "Implement additional custom filters for domain-specific content policies not covered by the Moderation API.",
          "Track moderation flag rates and review flagged outputs to assess model behavior trends.",
        ],
      },
      generic: {
        service: "Open-source content safety classifiers",
        description:
          "Deploy open-source toxicity and content safety classifiers such as Perspective API, Detoxify, or LLM Guard to filter model outputs.",
        steps: [
          "Select and deploy a content safety classification model appropriate to the content types generated.",
          "Integrate the classifier into the response pipeline as a post-processing step.",
          "Define category-specific thresholds and response handling policies.",
          "Monitor classifier performance metrics and retrain or replace as needed.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-004",
    name: "RAG Retrieval Guardrails",
    description:
      "Implement guardrails around retrieval-augmented generation pipelines to ensure retrieved documents are relevant, authorized, and do not introduce private or harmful content into the model context.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["hallucination", "privacy"],
    nistRefIds: ["MANAGE-2.3", "MEASURE-2.5"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Implement relevance scoring thresholds to filter out low-relevance retrieved documents before they enter the model context.",
      "Apply access control checks to ensure the requesting user is authorized to view the retrieved content.",
      "Sanitize retrieved content for PII, PHI, or other sensitive data that should not be exposed in the response.",
      "Implement source attribution so the model's outputs can be traced back to specific retrieved documents.",
      "Monitor retrieval quality metrics including relevance scores, retrieval accuracy, and hallucination rates.",
    ],
    evidenceArtifacts: [
      "RAG guardrail architecture documentation",
      "Relevance threshold and access control configuration",
      "Retrieval quality metrics and monitoring reports",
      "Source attribution implementation evidence",
    ],
    vendorGuidance: {
      aws: {
        service: "Amazon Bedrock Knowledge Bases + Kendra",
        description:
          "Use Amazon Bedrock Knowledge Bases with managed RAG pipelines and Amazon Kendra for enterprise search with built-in access control.",
        steps: [
          "Configure Bedrock Knowledge Bases with a vector store and document ingestion pipeline with metadata filtering.",
          "Set relevance score thresholds for retrieved chunks in the retrieval configuration.",
          "Enable Kendra access control lists to enforce document-level authorization.",
          "Apply Bedrock Guardrails to the RAG pipeline for content filtering of retrieved context.",
        ],
      },
      azure: {
        service: "Azure AI Search + Azure OpenAI On Your Data",
        description:
          "Use Azure AI Search with semantic ranking and security trimming combined with Azure OpenAI On Your Data for secure RAG implementations.",
        steps: [
          "Configure Azure AI Search with semantic ranking and set minimum relevance score thresholds.",
          "Implement security trimming in search indexes to enforce per-user document access control.",
          "Use Azure OpenAI On Your Data feature with data source authentication for managed RAG.",
          "Enable Azure AI Content Safety on the RAG pipeline to filter retrieved content and generated responses.",
        ],
      },
      openai: {
        service: "OpenAI Assistants API with file search",
        description:
          "Use the OpenAI Assistants API file search tool with custom retrieval validation logic to implement guardrailed RAG.",
        steps: [
          "Upload documents to OpenAI vector stores with appropriate metadata for filtering.",
          "Configure the Assistants API file search tool with the vector store.",
          "Implement a middleware layer that validates retrieved content for PII and authorization before including it in the prompt.",
          "Add source attribution instructions in the system prompt to ensure traceable outputs.",
        ],
      },
      generic: {
        service: "Custom RAG pipeline with vector database",
        description:
          "Build a custom RAG pipeline using an open-source vector database and implement guardrails at each stage of the retrieval and generation process.",
        steps: [
          "Implement document chunking and embedding with metadata preservation for access control and filtering.",
          "Add relevance score thresholds and re-ranking to filter low-quality retrievals.",
          "Implement authorization middleware that checks user permissions against document metadata before inclusion.",
          "Build a PII scanning step for retrieved chunks and add source citation formatting.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-005",
    name: "Bias Testing Harness",
    description:
      "Implement an automated bias testing harness that systematically evaluates AI model outputs for demographic disparities and unfair outcomes across protected groups in the product context.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["bias", "fairness"],
    nistRefIds: ["MEASURE-2.6", "MAP-2.2"],
    implementationLevel: "HIGH_STAKES",
    implementationSteps: [
      "Define bias test cases covering relevant protected attributes such as race, gender, age, and disability for the product's domain.",
      "Create evaluation datasets with controlled demographic variations to isolate bias in model behavior.",
      "Implement automated test pipelines that run bias test suites against model endpoints and compute fairness metrics.",
      "Integrate bias tests into the CI/CD pipeline as a pre-deployment gate for model updates.",
      "Publish bias test results to stakeholders and trigger remediation workflows when thresholds are breached.",
    ],
    evidenceArtifacts: [
      "Bias test case definitions and evaluation datasets",
      "Automated bias test pipeline configuration",
      "Bias test results and fairness metric reports",
      "CI/CD integration evidence and gate pass/fail records",
    ],
    vendorGuidance: {
      aws: {
        service: "Amazon SageMaker Clarify",
        description:
          "Use SageMaker Clarify to detect bias in training data and model predictions, generating detailed bias reports with multiple fairness metrics.",
        steps: [
          "Configure SageMaker Clarify processing jobs with the relevant facets (protected attributes) and label column.",
          "Run pre-training bias analysis on datasets to detect representation imbalances and label disparities.",
          "Run post-training bias analysis to compute fairness metrics such as demographic parity difference and disparate impact.",
          "Integrate Clarify bias checks into the SageMaker Pipeline as a condition step before model registration.",
          "Export Clarify reports and visualize results in the SageMaker Studio bias dashboard.",
        ],
      },
      azure: {
        service: "Fairlearn + Azure Responsible AI Dashboard",
        description:
          "Use the Fairlearn library integrated with the Azure Responsible AI dashboard to assess and mitigate model bias across demographic groups.",
        steps: [
          "Install Fairlearn and compute fairness metrics (demographic parity, equalized odds) on model predictions sliced by sensitive features.",
          "Use Fairlearn mitigation algorithms such as ExponentiatedGradient or ThresholdOptimizer to reduce identified disparities.",
          "Deploy the Azure Responsible AI dashboard to visualize fairness metrics alongside performance and explainability.",
          "Integrate fairness assessments into Azure ML pipelines as a pre-registration validation step.",
          "Document baseline and post-mitigation fairness metrics for audit purposes.",
        ],
      },
      openai: {
        service: "OpenAI Evals framework",
        description:
          "Use the OpenAI Evals framework to build custom bias evaluation suites that test model outputs for demographic disparities and stereotyping.",
        steps: [
          "Create custom eval datasets with paired prompts that vary only by demographic indicators.",
          "Define eval metrics that compare response quality, sentiment, and helpfulness across demographic groups.",
          "Run evals programmatically using the Evals framework and capture results in structured reports.",
          "Automate eval execution as part of the prompt engineering and model selection workflow.",
          "Review eval results with the responsible AI team before deploying prompt or model changes.",
        ],
      },
      generic: {
        service: "Custom bias testing framework",
        description:
          "Build a custom bias testing harness using open-source fairness toolkits such as Fairlearn, AI Fairness 360, or What-If Tool.",
        steps: [
          "Select fairness metrics appropriate to the task type (classification, regression, generation) and regulatory context.",
          "Create counterfactual test datasets that isolate demographic attributes from other features.",
          "Implement automated test pipelines that compute fairness metrics and compare against defined thresholds.",
          "Integrate tests into the CI/CD pipeline and block deployments that exceed bias thresholds.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-006",
    name: "Model Card / System Documentation",
    description:
      "Produce a model card or AI system documentation sheet that transparently communicates the model's intended use, capabilities, limitations, performance characteristics, and ethical considerations.",
    type: "PROCESS",
    scope: "PRODUCT",
    riskTags: ["auditability"],
    nistRefIds: ["MAP-1.1", "GOVERN-1.4"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Adopt a model card template covering model details, intended use, out-of-scope uses, training data summary, performance metrics, fairness analysis, and limitations.",
      "Complete the model card during the development phase and update it with each significant model revision.",
      "Make the model card available to internal stakeholders, auditors, and where appropriate, external users.",
      "Link the model card to the AI system inventory entry and data provenance records.",
    ],
    evidenceArtifacts: [
      "Completed model card or system documentation",
      "Version history of model card updates",
      "Cross-references to inventory and data provenance records",
    ],
    vendorGuidance: {
      aws: {
        service: "SageMaker Model Cards",
        description:
          "Use the SageMaker Model Cards feature to create, manage, and export standardized model documentation within the SageMaker ecosystem.",
        steps: [
          "Create a Model Card in SageMaker Studio specifying model details, intended uses, and risk ratings.",
          "Populate the training, evaluation, and additional information sections with relevant metrics and context.",
          "Export the Model Card as a PDF for sharing with auditors and stakeholders.",
          "Update the Model Card whenever the model is retrained or its deployment context changes.",
        ],
      },
      azure: {
        service: "Azure ML Model Registration + Responsible AI Dashboard",
        description:
          "Use Azure ML model registration metadata and the Responsible AI dashboard to document model characteristics and generate transparency artifacts.",
        steps: [
          "Register the model in Azure ML with detailed metadata including description, tags, and properties.",
          "Generate a Responsible AI dashboard covering performance, fairness, and explainability.",
          "Export dashboard results as documentation artifacts for the model card.",
          "Maintain model card markdown files in the project repository linked to the registered model version.",
        ],
      },
      openai: {
        service: "Custom model card documentation",
        description:
          "Create model card documentation for OpenAI-based systems covering the specific model version, prompt engineering details, and system-level behavior characteristics.",
        steps: [
          "Document the OpenAI model version, fine-tuning details if applicable, and system prompt design.",
          "Record performance benchmarks from evaluation datasets relevant to the product use case.",
          "Document known limitations, failure modes, and guardrails applied to the system.",
          "Maintain the model card in version control alongside the application code.",
        ],
      },
      generic: {
        service: "Model card template (Mitchell et al.)",
        description:
          "Use the industry-standard model card framework from Mitchell et al. to create structured model documentation.",
        steps: [
          "Download and adapt a model card template to the organization's needs.",
          "Fill in all sections including model details, intended use, factors, metrics, evaluation data, training data, ethical considerations, and caveats.",
          "Publish the model card in the project repository and link it from the AI system inventory.",
          "Establish a review and update process triggered by model changes.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-007",
    name: "Data Sheet / Data Provenance",
    description:
      "Create a data sheet for each significant dataset used in the AI product, documenting its collection methodology, composition, preprocessing, intended uses, and known limitations.",
    type: "PROCESS",
    scope: "PRODUCT",
    riskTags: ["privacy", "auditability"],
    nistRefIds: ["MAP-2.3", "MEASURE-2.2"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Adopt a datasheet template covering motivation, composition, collection process, preprocessing, uses, distribution, and maintenance.",
      "Complete datasheets for all training, evaluation, and fine-tuning datasets used in the product.",
      "Include data quality metrics such as completeness, accuracy, representativeness, and known biases.",
      "Link datasheets to the model card and maintain them in version control alongside dataset versions.",
    ],
    evidenceArtifacts: [
      "Completed datasheets for all significant datasets",
      "Data quality metric reports",
      "Version control history for datasheets and datasets",
    ],
    vendorGuidance: {
      aws: {
        service: "AWS Glue Data Catalog + SageMaker Feature Store",
        description:
          "Use the AWS Glue Data Catalog for dataset metadata management and SageMaker Feature Store for versioned feature lineage documentation.",
        steps: [
          "Register datasets in the Glue Data Catalog with schema, description, and classification metadata.",
          "Use SageMaker Feature Store to track feature lineage, transformations, and versions.",
          "Export catalog and feature store metadata as provenance documentation artifacts.",
          "Link provenance records to model cards via SageMaker Lineage Tracking.",
        ],
      },
      azure: {
        service: "Azure ML Data Assets + Microsoft Purview",
        description:
          "Use Azure ML Data Assets for versioned dataset management and Microsoft Purview for data lineage and governance.",
        steps: [
          "Register datasets as Azure ML Data Assets with versioning, descriptions, and tags.",
          "Connect Microsoft Purview to scan and catalog data sources used in AI pipelines.",
          "Use Purview lineage tracking to document data flow from source through transformation to model training.",
          "Export lineage diagrams and metadata as datasheet documentation artifacts.",
        ],
      },
      openai: {
        service: "Custom data documentation",
        description:
          "Create structured data documentation for fine-tuning datasets and evaluation data used with OpenAI models.",
        steps: [
          "Document the source, collection methodology, and size of all fine-tuning and evaluation datasets.",
          "Record preprocessing steps, data filtering criteria, and quality assurance checks applied.",
          "Include demographic composition analysis where relevant to bias assessment.",
          "Store datasheets alongside fine-tuning scripts in version control.",
        ],
      },
      generic: {
        service: "Datasheets for Datasets (Gebru et al.)",
        description:
          "Use the Datasheets for Datasets framework to create standardized data documentation for all AI training and evaluation data.",
        steps: [
          "Adopt the Datasheets for Datasets template and customize it to the organization's data governance requirements.",
          "Complete datasheets covering motivation, composition, collection, preprocessing, uses, distribution, and maintenance.",
          "Store datasheets in a centralized documentation repository linked to the corresponding datasets.",
          "Update datasheets whenever datasets are modified, augmented, or re-collected.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-008",
    name: "Human-in-the-Loop Checkpoints",
    description:
      "Embed human-in-the-loop checkpoints at critical decision points in the AI product workflow where automated outputs must be reviewed and approved by a qualified human before taking effect.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["oversight", "safety"],
    nistRefIds: ["GOVERN-3.2", "MAP-3.5", "MANAGE-2.4"],
    implementationLevel: "HIGH_STAKES",
    implementationSteps: [
      "Identify critical decision points in the product workflow where AI outputs have significant impact on individuals or the business.",
      "Design review interfaces that present AI outputs alongside confidence scores, explanations, and relevant context for human reviewers.",
      "Implement queuing and routing logic to direct flagged decisions to qualified reviewers based on domain and severity.",
      "Log all human review decisions including approvals, rejections, and modifications with timestamps and rationale.",
      "Monitor human reviewer workload, response times, and override rates to ensure the process remains effective.",
    ],
    evidenceArtifacts: [
      "Human-in-the-loop checkpoint design documentation",
      "Review interface screenshots and workflow diagrams",
      "Human review decision logs with rationale",
      "Reviewer workload and override rate metrics",
    ],
    vendorGuidance: {
      aws: {
        service: "Amazon A2I (Augmented AI)",
        description:
          "Use Amazon Augmented AI to build human review workflows for AI predictions, with built-in reviewer interfaces and routing logic.",
        steps: [
          "Create an A2I human review workflow definition specifying activation conditions and reviewer team.",
          "Design a custom worker task template for the review interface showing model output, confidence, and context.",
          "Configure the flow definition with routing logic to direct reviews to the appropriate private workforce.",
          "Integrate A2I with the AI inference pipeline to trigger human review when confidence thresholds are not met.",
          "Monitor review metrics in the A2I console and export decision logs for audit.",
        ],
      },
      azure: {
        service: "Azure Logic Apps + Power Automate",
        description:
          "Use Azure Logic Apps or Power Automate to build human approval workflows that gate AI-driven actions pending reviewer sign-off.",
        steps: [
          "Design a Logic App workflow that intercepts AI decisions requiring human review based on configurable criteria.",
          "Create an approval step that routes the decision to a qualified reviewer via Teams, email, or a custom review portal.",
          "Implement timeout and escalation logic for reviews that are not completed within the required SLA.",
          "Log all approval decisions, modifications, and escalations to Azure Monitor for audit.",
        ],
      },
      openai: {
        service: "Custom human review queue",
        description:
          "Build a custom human review queue that intercepts OpenAI API responses and routes them for human approval before delivery to the end user.",
        steps: [
          "Implement a review queue service that receives AI responses and holds them pending human review.",
          "Build a reviewer interface displaying the prompt, response, confidence indicators, and action buttons.",
          "Define routing rules based on content category, confidence score, and user segment.",
          "Log all review decisions and integrate approved responses back into the application flow.",
        ],
      },
      generic: {
        service: "Custom human-in-the-loop framework",
        description:
          "Build a human-in-the-loop checkpoint system using a task queue, review interface, and decision logging infrastructure.",
        steps: [
          "Implement a task queue (e.g., Celery, Bull, or SQS) to hold AI decisions pending human review.",
          "Build a review dashboard that presents decision context, model output, and confidence information.",
          "Implement role-based routing so reviews go to appropriately qualified reviewers.",
          "Create comprehensive logging of all human decisions for audit and model improvement feedback loops.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-009",
    name: "Latency & Availability Monitoring",
    description:
      "Implement monitoring for AI system latency and availability, tracking response times, uptime, error rates, and throughput to ensure the system meets reliability requirements.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["drift", "reliability"],
    nistRefIds: ["MEASURE-2.4", "MANAGE-4.1"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Define SLIs and SLOs for latency (p50, p95, p99), availability (uptime percentage), error rate, and throughput.",
      "Instrument the AI service with metrics collection for all defined SLIs.",
      "Configure dashboards displaying real-time and historical reliability metrics.",
      "Set up alerting for SLO breaches with appropriate severity levels and notification channels.",
    ],
    evidenceArtifacts: [
      "SLI/SLO definitions document",
      "Monitoring dashboard screenshots or exports",
      "Alert configuration records",
      "Monthly reliability reports",
    ],
    vendorGuidance: {
      aws: {
        service: "Amazon CloudWatch + X-Ray",
        description:
          "Use CloudWatch for metrics, dashboards, and alerting, and X-Ray for distributed tracing across the AI service stack.",
        steps: [
          "Publish custom CloudWatch metrics for AI endpoint latency, error rates, and invocation counts.",
          "Create CloudWatch dashboards with widgets for p50/p95/p99 latency, availability, and throughput.",
          "Configure CloudWatch Alarms with SNS notifications for SLO breaches.",
          "Enable X-Ray tracing for end-to-end request latency profiling across the AI pipeline.",
        ],
      },
      azure: {
        service: "Azure Monitor + Application Insights",
        description:
          "Use Azure Monitor and Application Insights for end-to-end observability of AI service performance, availability, and latency.",
        steps: [
          "Enable Application Insights for the AI service and configure custom telemetry for inference latency and error rates.",
          "Create Azure Monitor workbooks or dashboards with key reliability metrics.",
          "Configure Azure Monitor alert rules for latency and availability threshold breaches.",
          "Use Application Insights distributed tracing to identify latency bottlenecks in the AI pipeline.",
        ],
      },
      openai: {
        service: "Custom monitoring + OpenAI usage dashboard",
        description:
          "Implement custom monitoring around OpenAI API calls to track latency, rate limits, and error rates alongside the OpenAI usage dashboard.",
        steps: [
          "Instrument all OpenAI API calls with timing metrics, status code tracking, and token usage logging.",
          "Build dashboards tracking p50/p95/p99 latency, rate limit hits, error rates, and cost per request.",
          "Configure alerts for elevated latency, error spikes, or rate limit saturation.",
          "Monitor the OpenAI status page and integrate outage notifications into incident management.",
        ],
      },
      generic: {
        service: "Prometheus + Grafana",
        description:
          "Use Prometheus for metrics collection and Grafana for visualization and alerting of AI service reliability metrics.",
        steps: [
          "Instrument the AI service with Prometheus client libraries exposing latency histograms, error counters, and throughput gauges.",
          "Configure Prometheus to scrape AI service metrics at appropriate intervals.",
          "Build Grafana dashboards with panels for latency percentiles, availability, and error rates.",
          "Configure Grafana alerting rules for SLO breaches with notification channels.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-010",
    name: "Accuracy & Performance Monitoring",
    description:
      "Continuously monitor AI model accuracy and task-specific performance metrics in production, comparing against established baselines to detect degradation early.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["drift", "reliability"],
    nistRefIds: ["MEASURE-1.1", "MEASURE-2.4"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Define task-specific accuracy and performance metrics appropriate to the model type and use case.",
      "Establish baseline values from validation or held-out test data before production deployment.",
      "Implement automated evaluation pipelines that compute metrics on production data samples or ground-truth labels.",
      "Configure alerts when performance metrics deviate beyond acceptable thresholds from the baseline.",
      "Schedule periodic manual evaluation reviews to validate automated metric accuracy.",
    ],
    evidenceArtifacts: [
      "Performance metric definitions and baseline values",
      "Automated evaluation pipeline configuration",
      "Production performance metric reports and trend analysis",
      "Alert configuration and triggered alert records",
    ],
    vendorGuidance: {
      aws: {
        service: "Amazon SageMaker Model Monitor",
        description:
          "Use SageMaker Model Monitor to automatically detect data and model quality drift in production endpoints.",
        steps: [
          "Configure a SageMaker Model Monitor schedule for the production endpoint.",
          "Set up model quality monitoring with baseline constraints and ground-truth labels when available.",
          "Configure violation alerts via CloudWatch Alarms for metric threshold breaches.",
          "Review Model Monitor reports in SageMaker Studio to track performance trends over time.",
        ],
      },
      azure: {
        service: "Azure ML Model Monitoring",
        description:
          "Use Azure ML's model monitoring capabilities to track data drift and prediction quality for deployed models.",
        steps: [
          "Enable model monitoring on the Azure ML managed online endpoint.",
          "Configure data drift and prediction drift monitors with baseline datasets and thresholds.",
          "Set up alert rules for detected drift or performance degradation.",
          "Review monitoring signals and dashboards in Azure ML Studio.",
        ],
      },
      openai: {
        service: "Custom evaluation pipeline",
        description:
          "Build a custom evaluation pipeline that periodically tests OpenAI model outputs against ground-truth datasets to track accuracy over time.",
        steps: [
          "Create a curated evaluation dataset with ground-truth labels or expected outputs.",
          "Schedule automated evaluation runs that send test prompts to the production model endpoint and score responses.",
          "Track evaluation metrics over time and compare across model versions and prompt iterations.",
          "Configure alerts for significant metric drops between evaluation runs.",
        ],
      },
      generic: {
        service: "Custom model performance monitoring",
        description:
          "Build a model performance monitoring system using evaluation scripts, ground-truth collection, and metric tracking.",
        steps: [
          "Implement a ground-truth collection mechanism through human labeling, user feedback, or downstream outcome tracking.",
          "Build evaluation scripts that compute accuracy and performance metrics on production-labeled data.",
          "Store metric time series in a monitoring database and visualize trends in dashboards.",
          "Configure threshold-based alerts for performance degradation.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-011",
    name: "PII Detection & Redaction Pipeline",
    description:
      "Implement an automated pipeline to detect and redact personally identifiable information from AI system inputs and outputs, preventing unintended PII exposure.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["privacy"],
    nistRefIds: ["MEASURE-2.2", "MANAGE-3.1"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Define the PII categories to detect based on regulatory requirements and data sensitivity, such as names, SSNs, emails, phone numbers, and addresses.",
      "Implement PII detection on both inbound requests and outbound responses using NER models or pattern matching.",
      "Configure redaction or masking strategies for each PII category, replacing detected entities with tokens or placeholders.",
      "Log PII detection events without logging the PII itself for monitoring and audit purposes.",
      "Test the pipeline against a PII evaluation dataset to measure detection recall and precision.",
    ],
    evidenceArtifacts: [
      "PII detection pipeline architecture and configuration",
      "PII category definitions and redaction strategy documentation",
      "Detection accuracy evaluation results",
      "PII detection event logs and monitoring reports",
    ],
    vendorGuidance: {
      aws: {
        service: "Amazon Comprehend PII Detection + Amazon Macie",
        description:
          "Use Amazon Comprehend for real-time PII detection and redaction in text, and Amazon Macie for PII discovery in stored data.",
        steps: [
          "Integrate Amazon Comprehend DetectPiiEntities API into the request and response pipeline.",
          "Configure PII entity type filters for the categories relevant to the use case.",
          "Use the Comprehend ContainsPiiEntities API for fast screening and the DetectPiiEntities API for detailed redaction.",
          "Enable Amazon Macie on S3 buckets storing AI training data and logs to detect PII at rest.",
          "Monitor PII detection metrics and review redaction accuracy periodically.",
        ],
      },
      azure: {
        service: "Azure AI Language PII Detection",
        description:
          "Use the Azure AI Language PII detection capability to identify and redact personal information in AI system inputs and outputs.",
        steps: [
          "Provision an Azure AI Language resource and integrate the PII detection API into the application pipeline.",
          "Configure the PII categories to detect and set the minimum confidence threshold.",
          "Use the redacted text output for downstream processing, replacing PII with entity type placeholders.",
          "Log detection metadata without the raw PII for audit and monitoring.",
          "Evaluate detection accuracy periodically against labeled PII test datasets.",
        ],
      },
      openai: {
        service: "Custom regex + spaCy NER pipeline",
        description:
          "Build a PII detection and redaction pipeline using regular expressions for structured PII and spaCy NER for unstructured PII, applied before and after OpenAI API calls.",
        steps: [
          "Implement regex patterns for structured PII such as SSNs, email addresses, phone numbers, and credit card numbers.",
          "Deploy a spaCy NER model trained for PII entity recognition to catch names, addresses, and organizations.",
          "Apply the detection pipeline as pre-processing on user inputs and post-processing on model outputs.",
          "Replace detected PII with configurable placeholder tokens and maintain a session-scoped mapping for re-identification if needed.",
        ],
      },
      generic: {
        service: "Open-source PII detection (Presidio / spaCy)",
        description:
          "Use Microsoft Presidio or spaCy-based NER models to build an open-source PII detection and redaction pipeline.",
        steps: [
          "Deploy Microsoft Presidio or a custom spaCy NER model as a PII detection microservice.",
          "Configure recognizers for the PII entity types required by the use case and jurisdiction.",
          "Integrate the detection service into the AI pipeline as middleware for both inputs and outputs.",
          "Evaluate detection performance on a labeled PII dataset and tune confidence thresholds.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-012",
    name: "Access Control & Authentication",
    description:
      "Implement robust access control and authentication for the AI product's APIs and interfaces, ensuring only authorized users and services can invoke the AI system.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["security"],
    nistRefIds: ["MEASURE-2.7", "MANAGE-2.2"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Implement authentication for all AI API endpoints using industry-standard protocols such as OAuth 2.0, API keys, or mTLS.",
      "Define role-based access control policies specifying which users and services can invoke specific AI capabilities.",
      "Implement authorization checks at the API gateway or application layer enforcing RBAC policies.",
      "Log all authentication and authorization events for security monitoring and audit.",
    ],
    evidenceArtifacts: [
      "Authentication and authorization architecture documentation",
      "RBAC policy definitions",
      "Access control configuration records",
      "Authentication and authorization event logs",
    ],
    vendorGuidance: {
      aws: {
        service: "AWS IAM + Amazon Cognito + API Gateway",
        description:
          "Use IAM policies for service-to-service access, Cognito for user authentication, and API Gateway authorizers for request-level access control.",
        steps: [
          "Configure IAM roles and policies for services invoking Bedrock or SageMaker endpoints.",
          "Set up Amazon Cognito user pools for end-user authentication with MFA enabled.",
          "Configure API Gateway with Cognito or Lambda authorizers to validate tokens on each request.",
          "Enable CloudTrail logging for all IAM and API Gateway access events.",
        ],
      },
      azure: {
        service: "Azure AD (Entra ID) + Azure API Management",
        description:
          "Use Azure AD for identity management and authentication, with Azure API Management policies for fine-grained access control.",
        steps: [
          "Register the AI application in Azure AD and configure OAuth 2.0 authentication flows.",
          "Define app roles in Azure AD for different levels of AI system access.",
          "Configure API Management policies to validate JWT tokens and enforce role-based access.",
          "Enable Azure AD sign-in logs and API Management diagnostic logs for security monitoring.",
        ],
      },
      openai: {
        service: "API key management + custom auth layer",
        description:
          "Implement a custom authentication and authorization layer in front of OpenAI API calls, managing API keys securely and enforcing user-level access policies.",
        steps: [
          "Store OpenAI API keys in a secrets manager and never expose them to client-side code.",
          "Implement a backend proxy service that authenticates users before forwarding requests to the OpenAI API.",
          "Define per-user or per-role access policies controlling which AI capabilities they can invoke.",
          "Log all authenticated requests and track usage per user for billing and audit purposes.",
        ],
      },
      generic: {
        service: "OAuth 2.0 + RBAC middleware",
        description:
          "Implement OAuth 2.0 authentication with role-based access control middleware to secure AI product endpoints.",
        steps: [
          "Set up an OAuth 2.0 identity provider or integrate with an existing one such as Auth0 or Keycloak.",
          "Define roles and permissions for AI system access and encode them in JWT claims or a policy engine.",
          "Implement RBAC middleware that validates tokens and checks permissions on each API request.",
          "Log all access events and configure alerting for unauthorized access attempts.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-013",
    name: "Request/Response Logging & Audit Trail",
    description:
      "Log all AI system requests and responses with sufficient detail to support auditing, debugging, and compliance investigations while respecting data privacy requirements.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["auditability", "compliance"],
    nistRefIds: ["MANAGE-3.2", "MEASURE-1.3"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Define the logging schema capturing request ID, timestamp, user identifier, input payload, output payload, model version, latency, and status.",
      "Implement logging at the API gateway or application layer for all AI system interactions.",
      "Apply PII redaction to logs where necessary to comply with privacy regulations.",
      "Store logs in a centralized, tamper-evident logging system with appropriate retention periods.",
      "Ensure logs are searchable and exportable for audit and compliance investigations.",
    ],
    evidenceArtifacts: [
      "Logging schema and retention policy documentation",
      "Log pipeline architecture and configuration",
      "Sample log exports demonstrating completeness and PII handling",
      "Log integrity verification records",
    ],
    vendorGuidance: {
      aws: {
        service: "Amazon CloudWatch Logs + S3 + Bedrock invocation logging",
        description:
          "Use Bedrock invocation logging for model-level audit trails, CloudWatch Logs for application logging, and S3 for long-term log archival.",
        steps: [
          "Enable Bedrock model invocation logging to capture prompts, completions, and metadata to S3 or CloudWatch.",
          "Configure application-level logging in CloudWatch Logs with structured JSON format.",
          "Set up S3 lifecycle policies for long-term log retention and archival.",
          "Use CloudWatch Logs Insights for querying and analyzing log data.",
        ],
      },
      azure: {
        service: "Azure Monitor Logs + Azure Blob Storage",
        description:
          "Use Azure Monitor diagnostic logging for Azure OpenAI and application logs, with Blob Storage for long-term retention.",
        steps: [
          "Enable diagnostic settings on the Azure OpenAI resource to log requests and responses to a Log Analytics workspace.",
          "Implement structured application logging using Azure Monitor and Application Insights.",
          "Configure data export rules to archive logs to Azure Blob Storage for long-term retention.",
          "Use KQL queries in Log Analytics for audit investigations and compliance reporting.",
        ],
      },
      openai: {
        service: "Custom logging middleware",
        description:
          "Build custom logging middleware that captures all OpenAI API interactions in a centralized logging system.",
        steps: [
          "Implement a logging wrapper around the OpenAI client library that captures request and response payloads with metadata.",
          "Apply PII redaction to logged payloads before storage.",
          "Send structured logs to a centralized logging service such as Datadog, Splunk, or ELK.",
          "Configure log retention policies aligned with compliance requirements.",
        ],
      },
      generic: {
        service: "ELK Stack / Datadog / Splunk",
        description:
          "Use a centralized logging platform to capture, store, and query all AI system request and response data.",
        steps: [
          "Implement structured logging in the AI service emitting JSON log records for all interactions.",
          "Forward logs to the centralized platform using agents or direct API ingestion.",
          "Apply log processing rules for PII redaction and field extraction.",
          "Create saved searches and dashboards for common audit queries.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-014",
    name: "Rate Limiting & Abuse Prevention",
    description:
      "Implement rate limiting and abuse prevention mechanisms to protect the AI system from misuse, denial-of-service attacks, and excessive consumption of resources.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["security", "safety"],
    nistRefIds: ["MEASURE-2.7", "MANAGE-2.2"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Define rate limits per user, per API key, and per endpoint based on expected usage patterns and capacity planning.",
      "Implement rate limiting at the API gateway or load balancer level with configurable windows and quotas.",
      "Add abuse detection heuristics that identify patterns such as rapid prompt iteration, automated scraping, or resource exhaustion attempts.",
      "Configure appropriate error responses for rate-limited requests with retry-after guidance.",
      "Monitor rate limit activation and abuse detection events for security analysis.",
    ],
    evidenceArtifacts: [
      "Rate limit configuration documentation",
      "Abuse detection heuristics and rules",
      "Rate limit activation and abuse detection event logs",
      "Capacity planning and rate limit tuning records",
    ],
    vendorGuidance: {
      aws: {
        service: "AWS WAF + API Gateway throttling",
        description:
          "Use API Gateway throttling for request rate limiting and AWS WAF rate-based rules for abuse prevention.",
        steps: [
          "Configure API Gateway usage plans with throttle limits and quota settings per API key.",
          "Create AWS WAF rate-based rules to block IPs exceeding request thresholds.",
          "Implement custom WAF rules to detect abuse patterns specific to AI endpoints.",
          "Monitor throttling and WAF metrics in CloudWatch and review blocked request patterns.",
        ],
      },
      azure: {
        service: "Azure API Management rate limiting",
        description:
          "Use Azure API Management rate-limit and quota policies to control request rates and prevent abuse.",
        steps: [
          "Configure rate-limit-by-key policies in API Management at the product and operation levels.",
          "Set up quota-by-key policies for daily or monthly usage caps per subscriber.",
          "Implement custom policies for AI-specific abuse patterns such as rapid prompt enumeration.",
          "Monitor rate limit metrics in API Management analytics and configure alerts for unusual patterns.",
        ],
      },
      openai: {
        service: "Custom rate limiter + OpenAI usage tracking",
        description:
          "Implement a custom rate limiting layer in the application backend that manages per-user request rates independently of OpenAI's own rate limits.",
        steps: [
          "Implement a rate limiter using a token bucket or sliding window algorithm in the application backend.",
          "Set per-user and per-organization rate limits based on subscription tier and usage policies.",
          "Track OpenAI API token and request usage per user to enforce cost-based quotas.",
          "Implement abuse detection for patterns such as automated prompt enumeration and resource exhaustion.",
        ],
      },
      generic: {
        service: "Application-level rate limiter",
        description:
          "Implement rate limiting using a library or service such as Redis-based rate limiting, NGINX rate limiting, or a dedicated rate limiting service.",
        steps: [
          "Choose a rate limiting strategy (token bucket, sliding window, fixed window) appropriate to the traffic pattern.",
          "Implement the rate limiter as middleware or at the reverse proxy layer.",
          "Configure per-user and per-endpoint limits with appropriate burst allowances.",
          "Log rate limit events and configure dashboards for monitoring abuse patterns.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-015",
    name: "Fallback & Graceful Degradation",
    description:
      "Implement fallback mechanisms and graceful degradation strategies so the AI product maintains basic functionality when the primary AI model is unavailable, degraded, or returning low-confidence results.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["reliability", "safety"],
    nistRefIds: ["MANAGE-2.4", "MEASURE-2.3"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Identify critical user journeys and define minimum acceptable functionality when the AI model is unavailable.",
      "Implement fallback strategies such as cached responses, simpler models, rule-based alternatives, or human routing.",
      "Configure circuit breakers that activate fallback behavior when error rates or latency exceed thresholds.",
      "Communicate degraded state to users transparently when fallback mechanisms are active.",
      "Test fallback behavior regularly through chaos engineering or fault injection exercises.",
    ],
    evidenceArtifacts: [
      "Fallback strategy documentation per critical user journey",
      "Circuit breaker configuration and threshold settings",
      "Fallback activation event logs",
      "Fault injection test results",
    ],
    vendorGuidance: {
      aws: {
        service: "AWS Lambda + Step Functions + Route 53 health checks",
        description:
          "Use Step Functions for orchestrating fallback logic, Lambda for alternative processing, and Route 53 health checks for failover routing.",
        steps: [
          "Implement a Step Functions workflow with choice states that route to fallback models or services on primary model failure.",
          "Deploy fallback Lambda functions with simpler models or rule-based logic.",
          "Configure Route 53 health checks to detect AI endpoint failures and route traffic to fallback endpoints.",
          "Test failover behavior by simulating primary model outages.",
        ],
      },
      azure: {
        service: "Azure Front Door + Azure Functions",
        description:
          "Use Azure Front Door for health-based routing and Azure Functions for fallback logic when the primary AI service is degraded.",
        steps: [
          "Configure Azure Front Door with health probes on the primary AI endpoint.",
          "Set up origin groups with fallback origins pointing to simpler or cached AI services.",
          "Implement Azure Functions for fallback processing with reduced AI capabilities.",
          "Test failover by disabling the primary AI endpoint and verifying front-door routing.",
        ],
      },
      openai: {
        service: "Multi-provider fallback + caching",
        description:
          "Implement a multi-provider fallback strategy that switches to alternative LLM providers or cached responses when OpenAI is unavailable.",
        steps: [
          "Implement a provider abstraction layer that can route requests to OpenAI, a self-hosted model, or a cache.",
          "Configure circuit breaker logic that detects OpenAI outages or elevated error rates and triggers failover.",
          "Maintain a response cache for common queries to serve during outages.",
          "Define and communicate degraded service messaging to users when fallback is active.",
        ],
      },
      generic: {
        service: "Circuit breaker pattern + fallback services",
        description:
          "Implement the circuit breaker pattern with fallback services to ensure graceful degradation during AI system failures.",
        steps: [
          "Implement a circuit breaker library such as resilience4j, Polly, or Hystrix around AI model calls.",
          "Configure circuit breaker thresholds for failure rate, slow call rate, and timeout.",
          "Implement fallback handlers that provide alternative responses, cached results, or human routing.",
          "Test circuit breaker behavior with fault injection and document recovery procedures.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-016",
    name: "A/B Testing & Canary Deployment",
    description:
      "Implement A/B testing and canary deployment capabilities for AI model updates, allowing controlled rollout to a subset of traffic before full deployment to detect issues early.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["drift", "safety"],
    nistRefIds: ["MEASURE-1.3", "MANAGE-4.1"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Implement traffic splitting infrastructure that can route configurable percentages of requests to different model versions.",
      "Define metrics to compare between model versions, including performance, safety, fairness, and user satisfaction indicators.",
      "Create automated analysis pipelines that evaluate canary metrics against the baseline and detect regressions.",
      "Define rollback criteria and automate rollback when canary metrics breach thresholds.",
      "Document the A/B testing and canary deployment process in the release management runbook.",
    ],
    evidenceArtifacts: [
      "A/B testing and canary deployment architecture documentation",
      "Traffic splitting configuration records",
      "Canary analysis reports for each model deployment",
      "Rollback event records and post-mortem reports",
    ],
    vendorGuidance: {
      aws: {
        service: "SageMaker Inference Components + CloudWatch",
        description:
          "Use SageMaker production variants or inference components to split traffic between model versions with CloudWatch metrics for canary analysis.",
        steps: [
          "Deploy the new model version as a SageMaker production variant with a configurable traffic weight.",
          "Start with a small traffic percentage (e.g., 5%) and monitor CloudWatch metrics comparing variants.",
          "Use CloudWatch Alarms to detect metric regressions and trigger automatic rollback via Lambda.",
          "Gradually increase traffic to the new variant after successful canary validation.",
        ],
      },
      azure: {
        service: "Azure ML Managed Endpoints traffic splitting",
        description:
          "Use Azure ML managed online endpoints to split traffic between model deployments for canary analysis.",
        steps: [
          "Deploy the new model version as a separate deployment under the same managed online endpoint.",
          "Configure traffic allocation to send a small percentage to the new deployment.",
          "Monitor deployment metrics in Azure Monitor and compare performance between deployments.",
          "Adjust traffic allocation incrementally or roll back based on metric analysis.",
        ],
      },
      openai: {
        service: "Custom traffic routing layer",
        description:
          "Build a custom traffic routing layer that splits requests between OpenAI model versions or prompt configurations for A/B testing.",
        steps: [
          "Implement a routing service that assigns users to experiment groups and routes requests to different model or prompt versions.",
          "Log experiment assignments and outcomes for statistical analysis.",
          "Compute and compare key metrics between groups using statistical significance testing.",
          "Implement automated promotion or rollback based on experiment results.",
        ],
      },
      generic: {
        service: "Feature flag service + deployment orchestration",
        description:
          "Use a feature flag service for traffic splitting and a deployment orchestration tool for canary rollouts.",
        steps: [
          "Integrate a feature flag service such as LaunchDarkly, Unleash, or Flagsmith to control traffic routing.",
          "Configure percentage-based rollout rules for new model versions.",
          "Implement metric collection and comparison pipelines for A/B analysis.",
          "Define automated rollback triggers based on metric degradation thresholds.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-017",
    name: "Consent & Opt-Out Mechanism",
    description:
      "Implement mechanisms for users to provide informed consent for AI processing and to opt out of AI-driven features, ensuring compliance with privacy regulations and user autonomy.",
    type: "LEGAL",
    scope: "PRODUCT",
    riskTags: ["privacy", "compliance"],
    nistRefIds: ["MEASURE-2.2", "GOVERN-1.4"],
    implementationLevel: "BASELINE",
    implementationSteps: [
      "Design clear consent flows that inform users about AI processing, data usage, and their rights before activation.",
      "Implement opt-out controls that allow users to disable AI-driven features while maintaining access to core product functionality.",
      "Store consent records with timestamps, versions, and the specific disclosures presented to the user.",
      "Ensure that opting out immediately ceases AI processing for the user's data and requests.",
    ],
    evidenceArtifacts: [
      "Consent flow UI designs and disclosure text",
      "Consent record storage and management system documentation",
      "Opt-out mechanism implementation evidence",
      "Compliance audit records showing consent management effectiveness",
    ],
    vendorGuidance: {
      aws: {
        service: "Amazon Cognito + DynamoDB + custom consent service",
        description:
          "Build a consent management service using Cognito for user identity and DynamoDB for storing consent records linked to user profiles.",
        steps: [
          "Extend Cognito user attributes or use a DynamoDB table to store consent status and opt-out preferences.",
          "Implement consent check middleware that evaluates user preferences before routing requests to AI services.",
          "Build consent management API endpoints for granting, revoking, and querying consent status.",
          "Log all consent changes with timestamps in an immutable audit trail.",
        ],
      },
      azure: {
        service: "Azure AD B2C + Cosmos DB + custom consent service",
        description:
          "Use Azure AD B2C for user identity and consent capture, with Cosmos DB for storing consent records.",
        steps: [
          "Configure Azure AD B2C custom policies to present AI consent disclosures during signup and feature activation.",
          "Store detailed consent records in Cosmos DB with user ID, consent version, timestamp, and scope.",
          "Implement consent-checking middleware in the application that respects user opt-out preferences.",
          "Provide a user-facing consent management page for reviewing and modifying consent preferences.",
        ],
      },
      openai: {
        service: "Custom consent management layer",
        description:
          "Build a consent management layer that gates access to OpenAI-powered features based on user consent status.",
        steps: [
          "Implement a consent management database table storing per-user consent for AI features.",
          "Add consent checks in the application layer before making any OpenAI API calls on behalf of a user.",
          "Build user-facing controls for viewing, granting, and revoking AI feature consent.",
          "Ensure that revoked consent immediately stops AI processing and queues data deletion if required.",
        ],
      },
      generic: {
        service: "Consent management platform",
        description:
          "Integrate with a consent management platform or build custom consent management to handle AI-specific consent and opt-out requirements.",
        steps: [
          "Evaluate consent management platforms such as OneTrust, Cookiebot, or build a custom solution.",
          "Design consent categories that cover AI processing, data usage for training, and automated decision-making.",
          "Implement server-side consent enforcement that blocks AI processing for users who have not consented or have opted out.",
          "Maintain an auditable consent record system with full change history.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-018",
    name: "Explainability Interface",
    description:
      "Provide an explainability interface that allows users and reviewers to understand why the AI system produced a specific output, supporting transparency and contestability of AI-driven decisions.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["auditability", "fairness"],
    nistRefIds: ["MEASURE-2.8", "MAP-3.5"],
    implementationLevel: "HIGH_STAKES",
    implementationSteps: [
      "Determine the appropriate level and type of explanation for the user audience, from high-level summaries to detailed feature attributions.",
      "Implement explanation generation using techniques such as SHAP values, LIME, attention weights, counterfactuals, or natural language reasoning traces.",
      "Design a user interface that presents explanations alongside AI outputs in an accessible and understandable format.",
      "Implement a feedback mechanism allowing users to flag explanations that are unclear or seem incorrect.",
      "Log generated explanations alongside their corresponding AI decisions for audit purposes.",
    ],
    evidenceArtifacts: [
      "Explainability interface design specifications",
      "Explanation method validation and accuracy documentation",
      "User interface screenshots showing explanations",
      "User feedback records on explanation quality",
    ],
    vendorGuidance: {
      aws: {
        service: "SageMaker Clarify + custom explanation UI",
        description:
          "Use SageMaker Clarify for generating feature attributions and build a custom UI to present explanations to users.",
        steps: [
          "Configure SageMaker Clarify for real-time or batch explainability on the deployed model.",
          "Generate SHAP-based feature attributions for individual predictions.",
          "Build a frontend component that displays feature importance, contributing factors, and confidence information.",
          "Store explanation artifacts alongside predictions for audit trail completeness.",
        ],
      },
      azure: {
        service: "Azure Responsible AI Dashboard + custom UI",
        description:
          "Use the Azure Responsible AI dashboard for generating explanations and build a custom interface for end-user consumption.",
        steps: [
          "Enable the interpretability component in the Azure Responsible AI dashboard for the deployed model.",
          "Generate global and local explanations using the InterpretML backend.",
          "Build a user-facing explanation panel that shows the key factors influencing each AI decision.",
          "Implement a feedback loop allowing users to rate explanation helpfulness.",
        ],
      },
      openai: {
        service: "Chain-of-thought prompting + custom UI",
        description:
          "Use chain-of-thought prompting to generate reasoning traces and build a custom interface that presents the model's reasoning alongside its output.",
        steps: [
          "Design system prompts that instruct the model to output structured reasoning steps alongside its answer.",
          "Parse the structured reasoning from the model response and present it in a dedicated explanation panel.",
          "Implement a user feedback mechanism for flagging unhelpful or incorrect reasoning.",
          "Log reasoning traces alongside outputs for audit and model improvement.",
        ],
      },
      generic: {
        service: "SHAP / LIME + custom explanation UI",
        description:
          "Use open-source explainability libraries such as SHAP or LIME to generate explanations and present them through a custom user interface.",
        steps: [
          "Select the appropriate explainability method based on the model type and explanation requirements.",
          "Implement explanation generation as a service that can be called alongside the prediction endpoint.",
          "Build a frontend component that visualizes feature attributions, counterfactuals, or reasoning traces.",
          "Validate explanations for faithfulness to the model's actual decision-making process.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-019",
    name: "Toxicity & Harmful Content Filter",
    description:
      "Deploy a dedicated toxicity and harmful content filter that screens AI outputs for hate speech, threats, self-harm content, and other dangerous material before delivery to users.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["safety", "hallucination"],
    nistRefIds: ["MANAGE-2.3", "MEASURE-2.3"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Define the taxonomy of harmful content categories to detect, including hate speech, threats, self-harm, violence, and misinformation.",
      "Deploy toxicity classification models that evaluate all AI outputs against the defined categories.",
      "Configure severity thresholds and response strategies for each category, from warning labels to hard blocks.",
      "Implement a human review queue for borderline content that falls near classification thresholds.",
      "Monitor filter accuracy, false-positive rates, and coverage to continuously improve detection quality.",
    ],
    evidenceArtifacts: [
      "Harmful content taxonomy and policy document",
      "Toxicity filter configuration and threshold settings",
      "Filter performance metrics and accuracy reports",
      "Human review queue records and outcomes",
    ],
    vendorGuidance: {
      aws: {
        service: "Amazon Bedrock Guardrails + Amazon Comprehend",
        description:
          "Use Bedrock Guardrails content filters for toxicity categories and Comprehend toxicity detection for additional coverage.",
        steps: [
          "Configure Bedrock Guardrails with content filter strengths for hate, insults, sexual, violence, and misconduct.",
          "Enable word and managed word filters for topic-specific blocked content.",
          "Integrate Amazon Comprehend toxicity detection for nuanced scoring across fine-grained categories.",
          "Monitor filter activation rates in CloudWatch and review blocked content samples.",
        ],
      },
      azure: {
        service: "Azure AI Content Safety",
        description:
          "Use Azure AI Content Safety for multi-category harmful content detection including hate, violence, sexual content, and self-harm.",
        steps: [
          "Configure Azure AI Content Safety with severity thresholds for each content category.",
          "Integrate the Content Safety text analysis API into the response pipeline.",
          "Set up custom blocklists for domain-specific harmful content patterns.",
          "Enable logging and alerting for high-severity content detections.",
        ],
      },
      openai: {
        service: "OpenAI Moderation API",
        description:
          "Use the OpenAI Moderation API to screen model outputs across categories including hate, threats, self-harm, sexual content, and violence.",
        steps: [
          "Call the Moderation API on all model outputs before returning them to users.",
          "Map moderation API category scores to the application's content policy thresholds.",
          "Implement blocking or replacement logic for outputs that exceed safety thresholds.",
          "Log moderation results and track toxicity rates over time for model behavior monitoring.",
        ],
      },
      generic: {
        service: "Perspective API / Detoxify / custom classifier",
        description:
          "Deploy open-source or public toxicity detection models such as Perspective API or Detoxify to filter harmful AI outputs.",
        steps: [
          "Evaluate toxicity detection options and select models covering the required harm categories.",
          "Deploy the selected classifier as a post-processing service in the AI response pipeline.",
          "Configure category-specific thresholds and response handling logic.",
          "Benchmark classifier accuracy on a curated test set and retrain or supplement as needed.",
        ],
      },
    },
  },
  {
    controlId: "CTL-PROD-020",
    name: "Model Version Control & Rollback",
    description:
      "Implement version control for all model artifacts, configurations, and prompts used in the AI product, with the ability to rapidly roll back to any previous version when issues are detected.",
    type: "TECHNICAL",
    scope: "PRODUCT",
    riskTags: ["safety", "drift"],
    nistRefIds: ["MANAGE-4.1", "MANAGE-2.4"],
    implementationLevel: "ENHANCED",
    implementationSteps: [
      "Version all model artifacts including weights, configurations, prompt templates, and guardrail settings in a model registry or version control system.",
      "Tag each production deployment with the specific versions of all components in use.",
      "Implement a rollback mechanism that can switch production to a previous version within the defined recovery time objective.",
      "Test the rollback procedure through regular drills and document recovery times.",
      "Maintain a changelog documenting what changed between each version and the rationale.",
    ],
    evidenceArtifacts: [
      "Model registry or version control records for all artifact versions",
      "Production deployment version tags and deployment records",
      "Rollback procedure documentation and drill reports",
      "Version changelog with change descriptions and rationale",
    ],
    vendorGuidance: {
      aws: {
        service: "SageMaker Model Registry + CodePipeline",
        description:
          "Use SageMaker Model Registry for versioning model artifacts and CodePipeline for automated deployment and rollback.",
        steps: [
          "Register all model versions in SageMaker Model Registry with metadata, approval status, and artifact locations.",
          "Use SageMaker Pipelines or CodePipeline to automate deployment from the model registry to production endpoints.",
          "Configure automatic rollback in CodeDeploy to revert to the previous model version on deployment failure.",
          "Implement a manual rollback procedure that updates the endpoint to a specific model registry version.",
          "Tag all deployments with the model registry version and log deployment events.",
        ],
      },
      azure: {
        service: "Azure ML Model Registry + Azure DevOps",
        description:
          "Use the Azure ML Model Registry for versioned model management and Azure DevOps for deployment pipelines with rollback support.",
        steps: [
          "Register all model versions in the Azure ML Model Registry with descriptions, tags, and lineage information.",
          "Build Azure DevOps or GitHub Actions pipelines that deploy registered models to managed online endpoints.",
          "Implement rollback stages in the pipeline that can revert to a previous model version.",
          "Use Azure ML endpoint traffic splitting to validate new versions before full rollout.",
          "Maintain deployment logs linking each production deployment to its model registry version.",
        ],
      },
      openai: {
        service: "Git-based prompt versioning + custom deployment",
        description:
          "Version control prompt templates, system instructions, and configuration in Git, with a custom deployment process for switching between versions.",
        steps: [
          "Store all prompt templates, system instructions, and model configuration in a Git repository with semantic versioning.",
          "Tag each production deployment with the Git commit hash or version tag of the active configuration.",
          "Implement a deployment service that can rapidly switch production to any tagged version of the configuration.",
          "When using fine-tuned models, maintain a registry of fine-tuned model IDs with associated training data versions.",
          "Test rollback by deploying a previous configuration version and verifying behavior.",
        ],
      },
      generic: {
        service: "MLflow / DVC + deployment automation",
        description:
          "Use MLflow or DVC for model artifact versioning and a deployment automation tool for controlled rollout and rollback.",
        steps: [
          "Set up MLflow or DVC to track all model artifacts, parameters, metrics, and configurations.",
          "Tag each production deployment with the corresponding model version identifier.",
          "Implement a deployment script or pipeline with rollback capability to any tracked version.",
          "Conduct quarterly rollback drills and document recovery procedures and timing.",
        ],
      },
    },
  },
];
