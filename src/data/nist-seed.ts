export const nistSeedData = {
  functions: [
    {
      id: "GOVERN",
      name: "Govern",
      description:
        "Cultivate and implement a culture of risk management within organizations designing, developing, deploying, evaluating, or acquiring AI systems.",
      sortOrder: 1,
      categories: [
        {
          id: "GOVERN-1",
          name: "Policies",
          description:
            "Policies, processes, procedures, and practices across the organization related to the mapping, measuring, and managing of AI risks are in place, transparent, and implemented effectively.",
          subcategories: [
            {
              id: "GOVERN-1.1",
              description:
                "Legal and regulatory requirements involving AI are understood, managed, and documented.",
            },
            {
              id: "GOVERN-1.2",
              description:
                "Trustworthy AI characteristics are integrated into organizational policies, procedures, and processes.",
            },
            {
              id: "GOVERN-1.3",
              description:
                "Processes, procedures, and practices are in place to determine the appropriate level of risk tolerance for the organization.",
            },
            {
              id: "GOVERN-1.4",
              description:
                "The risk management process and its outcomes are established through transparent policies, procedures, and other controls, including documentation requirements.",
            },
            {
              id: "GOVERN-1.5",
              description:
                "Ongoing monitoring and periodic review of the risk management process and its outcomes are planned and organizational roles and responsibilities are clearly defined, including for determining risk tolerance.",
            },
            {
              id: "GOVERN-1.6",
              description:
                "Mechanisms are in place to inventory AI systems and are resourced to maintain an up-to-date record of deployed and retired AI systems.",
            },
            {
              id: "GOVERN-1.7",
              description:
                "Processes and procedures are in place for decommissioning and phasing out AI systems safely and in a manner that does not increase risks or harms.",
            },
          ],
        },
        {
          id: "GOVERN-2",
          name: "People",
          description:
            "Accountability structures are in place so that the appropriate teams and individuals are empowered, responsible, and trained for mapping, measuring, and managing AI risks.",
          subcategories: [
            {
              id: "GOVERN-2.1",
              description:
                "Roles and responsibilities and lines of communication related to mapping, measuring, and managing AI risks are documented and are clear to individuals and teams throughout the organization.",
            },
            {
              id: "GOVERN-2.2",
              description:
                "The organization's personnel and partners receive AI risk management training to enable them to perform their duties and responsibilities consistent with related policies, procedures, and agreements.",
            },
            {
              id: "GOVERN-2.3",
              description:
                "Executive leadership of the organization takes responsibility for decisions about risks associated with AI system development and deployment.",
            },
          ],
        },
        {
          id: "GOVERN-3",
          name: "Diversity",
          description:
            "Workforce diversity, equity, inclusion, and accessibility processes are prioritized in the mapping, measuring, and managing of AI risks throughout the lifecycle.",
          subcategories: [
            {
              id: "GOVERN-3.1",
              description:
                "Decision-making related to mapping, measuring, and managing AI risks throughout the lifecycle is informed by a diverse team with demographic diversity and broad domain expertise.",
            },
            {
              id: "GOVERN-3.2",
              description:
                "Policies and procedures are in place to define and differentiate roles and responsibilities for human-AI configurations and oversight of AI systems.",
            },
          ],
        },
        {
          id: "GOVERN-4",
          name: "Culture",
          description:
            "Organizational teams are committed to a culture that considers and communicates AI risk.",
          subcategories: [
            {
              id: "GOVERN-4.1",
              description:
                "Organizational policies and practices are in place to foster a critical thinking and safety-first mindset in the design, development, and deployment of AI systems, including red-teaming exercises.",
            },
            {
              id: "GOVERN-4.2",
              description:
                "Organizational teams document and conduct impact assessments that include the direct, indirect, and cumulative effects of AI systems on individuals, communities, and the environment.",
            },
            {
              id: "GOVERN-4.3",
              description:
                "Organizational practices are in place to enable AI testing, identification of incidents, and information sharing across the organization.",
            },
          ],
        },
        {
          id: "GOVERN-5",
          name: "Engagement",
          description:
            "Processes are in place for robust engagement with relevant AI actors.",
          subcategories: [
            {
              id: "GOVERN-5.1",
              description:
                "Organizational policies and practices are in place to collect, consider, prioritize, and integrate feedback from those external to the team that developed or deployed the AI system.",
            },
            {
              id: "GOVERN-5.2",
              description:
                "Mechanisms are established to enable AI actors to regularly incorporate adjudicated feedback from relevant external stakeholders into system design and implementation.",
            },
          ],
        },
        {
          id: "GOVERN-6",
          name: "Third-party",
          description:
            "Policies and procedures are in place to address AI risks and benefits arising from third-party software and data and other supply chain issues.",
          subcategories: [
            {
              id: "GOVERN-6.1",
              description:
                "Policies and procedures are in place that address AI risks associated with third-party entities, including risks related to third-party data, software, and hardware.",
            },
            {
              id: "GOVERN-6.2",
              description:
                "Contingency processes are in place for addressing third-party AI system failures or incidents, including performance degradation, security breaches, and supply chain disruptions.",
            },
          ],
        },
      ],
    },
    {
      id: "MAP",
      name: "Map",
      description:
        "Establish the context to frame risks related to an AI system, including understanding the intended purposes, uses, and impacts.",
      sortOrder: 2,
      categories: [
        {
          id: "MAP-1",
          name: "Context",
          description:
            "Context is established and understood to inform risk identification and assessment for the AI system.",
          subcategories: [
            {
              id: "MAP-1.1",
              description:
                "Intended purposes, potentially beneficial uses, context of use, and deployment setting of the AI system are documented and clearly defined.",
            },
            {
              id: "MAP-1.2",
              description:
                "Interdisciplinary AI actors, competencies, skills, and capacities for establishing context reflect demographic diversity and broad domain expertise, and their participation is documented.",
            },
            {
              id: "MAP-1.3",
              description:
                "The business value or context of business use has been clearly defined and documented, including the AI system's alignment with the organization's mission and strategic goals.",
            },
            {
              id: "MAP-1.4",
              description:
                "The business value that the AI system is expected to deliver is documented and assessed relative to the costs and risks of deploying the system.",
            },
            {
              id: "MAP-1.5",
              description:
                "Organizational risk tolerances are determined and documented, and the AI system's risk levels are assessed against those tolerances.",
            },
            {
              id: "MAP-1.6",
              description:
                "System requirements, including those addressing socio-technical considerations and trustworthy AI characteristics, are defined and documented within the AI system design.",
            },
          ],
        },
        {
          id: "MAP-2",
          name: "Classification",
          description:
            "Categorization of the AI system is performed to understand the type of AI system and the tasks it is designed to perform.",
          subcategories: [
            {
              id: "MAP-2.1",
              description:
                "The specific task, methods, and data used by the AI system are defined and documented, including whether the system learns or is static.",
            },
            {
              id: "MAP-2.2",
              description:
                "Information about the knowledge limits of the AI system, how its outputs are utilized, and the assumptions underlying its design are documented.",
            },
            {
              id: "MAP-2.3",
              description:
                "Scientific integrity and TEVV (Test, Evaluation, Verification, and Validation) considerations are identified and documented, including those related to experimental design, data collection, and outcome reporting.",
            },
          ],
        },
        {
          id: "MAP-3",
          name: "Impact",
          description:
            "AI capabilities, targeted usage, goals, and expected benefits and costs compared with appropriate benchmarks are understood.",
          subcategories: [
            {
              id: "MAP-3.1",
              description:
                "Potential benefits of the AI system to individuals, communities, organizations, and society are estimated and documented.",
            },
            {
              id: "MAP-3.2",
              description:
                "Potential costs, including non-monetary costs such as harms to individuals, communities, and the environment, are estimated and documented.",
            },
            {
              id: "MAP-3.3",
              description:
                "The scope and boundaries of the AI system's intended application are clearly defined, including constraints on use cases and geographic or demographic applicability.",
            },
            {
              id: "MAP-3.4",
              description:
                "Adequacy of the operator's and user's proficiency relative to the complexity of the AI system is assessed and documented.",
            },
            {
              id: "MAP-3.5",
              description:
                "Processes for human oversight are defined and documented, including the ability for human operators to contest, override, or deactivate AI system outputs.",
            },
          ],
        },
        {
          id: "MAP-4",
          name: "Risks",
          description:
            "Risks and benefits are mapped for all components of the AI system including third-party software and data.",
          subcategories: [
            {
              id: "MAP-4.1",
              description:
                "Approaches for identifying AI risks are applied to each trustworthy characteristic, and risks across the lifecycle are documented.",
            },
            {
              id: "MAP-4.2",
              description:
                "Internal risk controls for the identified AI risks are documented and assessed for adequacy, including technical, procedural, and organizational safeguards.",
            },
          ],
        },
        {
          id: "MAP-5",
          name: "Likelihood",
          description:
            "Likelihood and magnitude of each identified risk are estimated, including the potential for cascading and systemic impacts.",
          subcategories: [
            {
              id: "MAP-5.1",
              description:
                "Likelihood and potential impact of each identified risk, including risks from third parties, are characterized and documented.",
            },
            {
              id: "MAP-5.2",
              description:
                "Practices and personnel for assessing likelihood and impact of AI risks are in place, and results are integrated into risk management decision-making.",
            },
          ],
        },
      ],
    },
    {
      id: "MEASURE",
      name: "Measure",
      description:
        "Employ quantitative, qualitative, or mixed-method tools, techniques, and methodologies to analyze, assess, benchmark, and monitor AI risk and related impacts.",
      sortOrder: 3,
      categories: [
        {
          id: "MEASURE-1",
          name: "Approach",
          description:
            "Appropriate methods and metrics are identified and applied to measure AI risks and trustworthiness.",
          subcategories: [
            {
              id: "MEASURE-1.1",
              description:
                "Approaches and metrics for measurement of AI risks are established, including rigorous testing methodologies and performance benchmarks.",
            },
            {
              id: "MEASURE-1.2",
              description:
                "Appropriateness of AI risk measurements is assessed relative to applicable standards, guidelines, and best practices, and measurement approaches are updated accordingly.",
            },
            {
              id: "MEASURE-1.3",
              description:
                "Internal and external TEVV mechanisms, including independent evaluation processes, are in place and applied to the AI system at defined intervals throughout its lifecycle.",
            },
          ],
        },
        {
          id: "MEASURE-2",
          name: "Trustworthiness",
          description:
            "AI systems are evaluated for trustworthy characteristics on an ongoing basis.",
          subcategories: [
            {
              id: "MEASURE-2.1",
              description:
                "Evaluation results for each trustworthy AI characteristic are documented and compared against established benchmarks and goals.",
            },
            {
              id: "MEASURE-2.2",
              description:
                "Privacy risk of the AI system is examined and documented, including the system's handling of personally identifiable information and data minimization practices.",
            },
            {
              id: "MEASURE-2.3",
              description:
                "Safety of the AI system is evaluated and documented, including fail-safe mechanisms and the potential for physical, psychological, or financial harm to individuals.",
            },
            {
              id: "MEASURE-2.4",
              description:
                "Validity and reliability of the AI system outputs are evaluated and documented, including accuracy, consistency, and generalizability across expected operating conditions.",
            },
            {
              id: "MEASURE-2.5",
              description:
                "The AI system is evaluated for robustness against adversarial inputs, data drift, and unexpected operating conditions, and results are documented.",
            },
            {
              id: "MEASURE-2.6",
              description:
                "Fairness and bias in the AI system are evaluated and documented, including analysis of differential performance across demographic groups and mitigation of identified disparities.",
            },
            {
              id: "MEASURE-2.7",
              description:
                "Security and resilience of the AI system are evaluated and documented, including resistance to attacks, unauthorized access, and the system's ability to recover from compromises.",
            },
            {
              id: "MEASURE-2.8",
              description:
                "Explainability and interpretability of the AI system are evaluated and documented, including the degree to which outputs and decision processes can be understood by relevant stakeholders.",
            },
            {
              id: "MEASURE-2.9",
              description:
                "AI-specific risks that may be difficult to detect or measure, such as hallucinations, confabulation, emergent behaviors, and data poisoning, are identified and assessed.",
            },
            {
              id: "MEASURE-2.10",
              description:
                "Environmental impact of the AI system, including energy consumption, carbon footprint, and resource utilization during training and operation, is assessed and documented.",
            },
            {
              id: "MEASURE-2.11",
              description:
                "Potential homogenization effects and downstream impacts of the AI system on ecosystems, markets, and information diversity are assessed and documented.",
            },
            {
              id: "MEASURE-2.12",
              description:
                "Computational and data resources required for development, training, and ongoing operation of the AI system are assessed and documented for sustainability and proportionality.",
            },
            {
              id: "MEASURE-2.13",
              description:
                "Effectiveness of existing risk mitigation measures is evaluated and documented, with findings used to inform updated controls and risk treatment plans.",
            },
          ],
        },
        {
          id: "MEASURE-3",
          name: "Tracking",
          description:
            "Mechanisms for tracking identified AI risks over time are in place.",
          subcategories: [
            {
              id: "MEASURE-3.1",
              description:
                "AI risks and associated metrics are monitored and tracked across the AI system lifecycle, with dashboards or reporting mechanisms for ongoing visibility.",
            },
            {
              id: "MEASURE-3.2",
              description:
                "Feedback from internal and external sources, including end users and affected communities, is integrated into risk measurements and assessment processes.",
            },
            {
              id: "MEASURE-3.3",
              description:
                "Risk assessments are regularly updated to incorporate new information, stakeholder input, and changes in the operational environment or regulatory landscape.",
            },
          ],
        },
        {
          id: "MEASURE-4",
          name: "Management",
          description:
            "Measurement results and feedback from relevant AI actors and affected communities are used to manage AI risks.",
          subcategories: [
            {
              id: "MEASURE-4.1",
              description:
                "Measurement approaches for deployed AI systems are monitored and validated to confirm they remain effective and applicable to the current operating context.",
            },
            {
              id: "MEASURE-4.2",
              description:
                "Measurement outcomes and results are used to inform and improve AI risk management decisions, policies, and practices across the organization.",
            },
            {
              id: "MEASURE-4.3",
              description:
                "Feedback on AI system performance and risks is collected from end users and affected communities after deployment, and results are integrated into ongoing risk management.",
            },
          ],
        },
      ],
    },
    {
      id: "MANAGE",
      name: "Manage",
      description:
        "Allocate risk resources to mapped and measured risks on a regular basis and as defined by the Govern function.",
      sortOrder: 4,
      categories: [
        {
          id: "MANAGE-1",
          name: "Risk Treatment",
          description:
            "AI risks based on assessments and other analytical output from the Map and Measure functions are prioritized, responded to, and managed.",
          subcategories: [
            {
              id: "MANAGE-1.1",
              description:
                "A determination is made as to whether the AI system achieves its intended purpose and whether its benefits outweigh its risks, informing go/no-go deployment decisions.",
            },
            {
              id: "MANAGE-1.2",
              description:
                "Treatment of identified AI risks is prioritized based on assessed impact, likelihood, available resources, and the organization's risk tolerance.",
            },
            {
              id: "MANAGE-1.3",
              description:
                "Responses to identified high-priority AI risks are developed, documented, and implemented, including risk mitigation plans with responsible parties and timelines.",
            },
            {
              id: "MANAGE-1.4",
              description:
                "Residual risks, including those that are accepted or transferred, are documented with clear rationale and are reviewed and monitored on an ongoing basis.",
            },
          ],
        },
        {
          id: "MANAGE-2",
          name: "Risk Controls",
          description:
            "Strategies to maximize AI benefits and minimize negative impacts are planned, prepared, implemented, documented, and informed by input from relevant AI actors.",
          subcategories: [
            {
              id: "MANAGE-2.1",
              description:
                "Resources are allocated for managing identified AI risks, and viable non-AI alternatives or fallback mechanisms are evaluated and maintained.",
            },
            {
              id: "MANAGE-2.2",
              description:
                "Mechanisms are in place to sustain the value of deployed AI systems and manage risks from model or data drift, concept drift, and degraded performance over time.",
            },
            {
              id: "MANAGE-2.3",
              description:
                "Procedures and controls for responding to previously unknown or emergent AI risks are established, including escalation protocols and rapid response capabilities.",
            },
            {
              id: "MANAGE-2.4",
              description:
                "Mechanisms are in place to allow human operators to bypass, override, or safely deactivate AI systems when necessary to mitigate imminent risks or harms.",
            },
          ],
        },
        {
          id: "MANAGE-3",
          name: "Third-party",
          description:
            "AI risks and benefits from third-party resources are regularly monitored, and risk controls are applied and documented.",
          subcategories: [
            {
              id: "MANAGE-3.1",
              description:
                "AI risks from third-party entities, including vendors, partners, and data providers, are regularly monitored, and appropriate risk controls are in place and documented.",
            },
            {
              id: "MANAGE-3.2",
              description:
                "Pre-trained models and third-party AI components are monitored for performance, security, and alignment with organizational values and risk tolerances.",
            },
          ],
        },
        {
          id: "MANAGE-4",
          name: "Monitoring",
          description:
            "Risk treatments, including response and recovery, and communication plans for the identified and measured AI risks are documented and monitored regularly.",
          subcategories: [
            {
              id: "MANAGE-4.1",
              description:
                "Post-deployment AI system monitoring plans are in place, including incident detection, escalation procedures, and defined response and recovery actions.",
            },
            {
              id: "MANAGE-4.2",
              description:
                "Processes for continual improvement of AI risk management are established, leveraging lessons learned, measurement outcomes, and evolving best practices.",
            },
            {
              id: "MANAGE-4.3",
              description:
                "Incidents and errors related to AI systems are tracked, communicated to relevant stakeholders, and analyzed to prevent recurrence and improve system performance.",
            },
          ],
        },
      ],
    },
  ],
};
