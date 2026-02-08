"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/app/components/PageHeader";

const defaultGovern = {
  legalRegulatoryAwareness: "",
  policiesAndProcedures: "",
  riskTolerance: "",
  documentationAndTransparency: "",
  monitoringAndReview: "",
  aiSystemInventory: "",
  rolesAndResponsibilities: "",
  training: "",
  leadershipAccountability: "",
  diversityAndInclusion: "",
  humanAIConfigurations: "",
  riskCulture: "",
};

const defaultPlaybook = {
  map: { methods: "", templates: "", tools: "" },
  measure: { methods: "", templates: "", tools: "" },
  manage: { methods: "", templates: "", tools: "" },
};

function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
      />
    </div>
  );
}

export default function OrganizationAssessmentPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const router = useRouter();
  const { getOrganization, getOrganizationAssessment, saveOrganizationAssessment } = useData();

  const org = getOrganization(orgId);
  const existing = getOrganizationAssessment(orgId);

  const [govern, setGovern] = useState(defaultGovern);
  const [playbook, setPlaybook] = useState(defaultPlaybook);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existing) {
      setGovern(existing.govern);
      setPlaybook(existing.playbook);
    }
  }, [existing?.id]);

  function handleSave() {
    saveOrganizationAssessment(orgId, { govern, playbook });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!org) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title="Organization not found" backHref="/" />
        <p className="text-zinc-500 mt-4">This organization may have been removed.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Organization assessment (Govern)"
        backHref={`/organizations/${orgId}`}
        backLabel={org.name}
      />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Define your organization&apos;s governance and the common methods, templates, and tools
          that all AI projects will use for Map, Measure, and Manage.
        </p>

        {/* Govern */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            Govern – policies and practices
          </h2>
          <TextArea
            id="legal"
            label="Legal and regulatory awareness (GOVERN 1.1)"
            value={govern.legalRegulatoryAwareness}
            onChange={(v) => setGovern((g) => ({ ...g, legalRegulatoryAwareness: v }))}
            placeholder="How does the organization understand and document applicable legal/regulatory requirements for AI?"
          />
          <TextArea
            id="policies"
            label="Policies and procedures (GOVERN 1.2)"
            value={govern.policiesAndProcedures}
            onChange={(v) => setGovern((g) => ({ ...g, policiesAndProcedures: v }))}
            placeholder="Policies for AI risk management, standards, and scope."
          />
          <TextArea
            id="riskTolerance"
            label="Risk tolerance (GOVERN 1.3)"
            value={govern.riskTolerance}
            onChange={(v) => setGovern((g) => ({ ...g, riskTolerance: v }))}
            placeholder="How does the organization determine and document risk tolerance and scales?"
          />
          <TextArea
            id="documentation"
            label="Documentation and transparency (GOVERN 1.4)"
            value={govern.documentationAndTransparency}
            onChange={(v) => setGovern((g) => ({ ...g, documentationAndTransparency: v }))}
            placeholder="Documentation policies for AI systems and risk management outcomes."
          />
          <TextArea
            id="monitoring"
            label="Monitoring and periodic review (GOVERN 1.5)"
            value={govern.monitoringAndReview}
            onChange={(v) => setGovern((g) => ({ ...g, monitoringAndReview: v }))}
            placeholder="Plans for ongoing monitoring and review frequency."
          />
          <TextArea
            id="inventory"
            label="AI system inventory (GOVERN 1.6)"
            value={govern.aiSystemInventory}
            onChange={(v) => setGovern((g) => ({ ...g, aiSystemInventory: v }))}
            placeholder="Mechanisms to inventory AI systems and resource by risk priority."
          />
          <TextArea
            id="roles"
            label="Roles and responsibilities (GOVERN 2.1)"
            value={govern.rolesAndResponsibilities}
            onChange={(v) => setGovern((g) => ({ ...g, rolesAndResponsibilities: v }))}
            placeholder="Documented roles and lines of communication for Map, Measure, Manage."
          />
          <TextArea
            id="training"
            label="Training (GOVERN 2.2)"
            value={govern.training}
            onChange={(v) => setGovern((g) => ({ ...g, training: v }))}
            placeholder="AI risk management training for personnel and partners."
          />
          <TextArea
            id="leadership"
            label="Leadership accountability (GOVERN 2.3)"
            value={govern.leadershipAccountability}
            onChange={(v) => setGovern((g) => ({ ...g, leadershipAccountability: v }))}
            placeholder="Executive responsibility for AI risk decisions."
          />
          <TextArea
            id="diversity"
            label="Diverse teams (GOVERN 3.1)"
            value={govern.diversityAndInclusion}
            onChange={(v) => setGovern((g) => ({ ...g, diversityAndInclusion: v }))}
            placeholder="How decision-making is informed by diverse perspectives."
          />
          <TextArea
            id="humanAI"
            label="Human–AI configurations (GOVERN 3.2)"
            value={govern.humanAIConfigurations}
            onChange={(v) => setGovern((g) => ({ ...g, humanAIConfigurations: v }))}
            placeholder="Roles and oversight for human-AI configurations."
          />
          <TextArea
            id="riskCulture"
            label="Risk culture (GOVERN 4.1)"
            value={govern.riskCulture}
            onChange={(v) => setGovern((g) => ({ ...g, riskCulture: v }))}
            placeholder="Critical thinking and safety-first mindset in design, development, deployment."
          />
        </section>

        {/* Playbook: methods, templates, tools for Map, Measure, Manage */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-2 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            Playbook – common methods, templates, and tools
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Define how your organization will perform Map, Measure, and Manage. All AI project
            assessments will use this playbook and add project-specific details and evidence.
          </p>

          <h3 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Map</h3>
          <TextArea
            id="mapMethods"
            label="Methods (e.g. risk-mapping approach)"
            value={playbook.map.methods}
            onChange={(v) =>
              setPlaybook((p) => ({ ...p, map: { ...p.map, methods: v } }))
            }
            placeholder="How will the organization map context, stakeholders, and risks?"
          />
          <TextArea
            id="mapTemplates"
            label="Templates"
            value={playbook.map.templates}
            onChange={(v) =>
              setPlaybook((p) => ({ ...p, map: { ...p.map, templates: v } }))
            }
            placeholder="Templates for mapping (e.g. context doc, risk register)."
          />
          <TextArea
            id="mapTools"
            label="Tools"
            value={playbook.map.tools}
            onChange={(v) =>
              setPlaybook((p) => ({ ...p, map: { ...p.map, tools: v } }))
            }
            placeholder="Tools used for mapping (e.g. spreadsheets, risk tools)."
          />

          <h3 className="font-medium mb-2 mt-6 text-zinc-800 dark:text-zinc-200">Measure</h3>
          <TextArea
            id="measureMethods"
            label="Methods (e.g. testing and evaluation approach)"
            value={playbook.measure.methods}
            onChange={(v) =>
              setPlaybook((p) => ({ ...p, measure: { ...p.measure, methods: v } }))
            }
            placeholder="How will the organization measure performance, safety, and trustworthiness?"
          />
          <TextArea
            id="measureTemplates"
            label="Templates"
            value={playbook.measure.templates}
            onChange={(v) =>
              setPlaybook((p) => ({ ...p, measure: { ...p.measure, templates: v } }))
            }
            placeholder="Templates for testing, validation, monitoring."
          />
          <TextArea
            id="measureTools"
            label="Tools"
            value={playbook.measure.tools}
            onChange={(v) =>
              setPlaybook((p) => ({ ...p, measure: { ...p.measure, tools: v } }))
            }
            placeholder="Tools for measurement (e.g. evaluation frameworks, dashboards)."
          />

          <h3 className="font-medium mb-2 mt-6 text-zinc-800 dark:text-zinc-200">Manage</h3>
          <TextArea
            id="manageMethods"
            label="Methods (e.g. incident response, prioritization)"
            value={playbook.manage.methods}
            onChange={(v) =>
              setPlaybook((p) => ({ ...p, manage: { ...p.manage, methods: v } }))
            }
            placeholder="How will the organization allocate resources, respond to incidents, and adjust?"
          />
          <TextArea
            id="manageTemplates"
            label="Templates"
            value={playbook.manage.templates}
            onChange={(v) =>
              setPlaybook((p) => ({ ...p, manage: { ...p.manage, templates: v } }))
            }
            placeholder="Templates for managing risks (e.g. incident log, review checklist)."
          />
          <TextArea
            id="manageTools"
            label="Tools"
            value={playbook.manage.tools}
            onChange={(v) =>
              setPlaybook((p) => ({ ...p, manage: { ...p.manage, tools: v } }))
            }
            placeholder="Tools for risk management and response."
          />
        </section>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Save assessment
          </button>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400">Saved.</span>
          )}
          <button
            type="button"
            onClick={() => router.push(`/organizations/${orgId}`)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium"
          >
            Back to organization
          </button>
        </div>
      </main>
    </>
  );
}
