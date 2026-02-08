"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import type { ProductAssessment } from "@/lib/types";
import { PageHeader } from "@/app/components/PageHeader";

const emptyMap = {
  contextAndStakeholders: "",
  taskAndMethods: "",
  knowledgeLimitsAndOversight: "",
  tevvConsiderations: "",
  evidence: "",
};
const emptyMeasure = {
  performanceMetrics: "",
  testingAndValidation: "",
  monitoringAndOngoingEval: "",
  evidence: "",
};
const emptyManage = {
  resourceAllocation: "",
  incidentResponse: "",
  reviewAndAdjustment: "",
  evidence: "",
};

function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
      />
    </div>
  );
}

function PlaybookSection({
  title,
  methods,
  templates,
  tools,
}: {
  title: string;
  methods: string;
  templates: string;
  tools: string;
}) {
  const hasAny = methods || templates || tools;
  if (!hasAny) return null;
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-4 mb-4 text-sm">
      <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">{title} (org playbook)</h4>
      {methods && (
        <p className="mb-1">
          <span className="text-zinc-500 dark:text-zinc-400">Methods:</span> {methods}
        </p>
      )}
      {templates && (
        <p className="mb-1">
          <span className="text-zinc-500 dark:text-zinc-400">Templates:</span> {templates}
        </p>
      )}
      {tools && (
        <p>
          <span className="text-zinc-500 dark:text-zinc-400">Tools:</span> {tools}
        </p>
      )}
    </div>
  );
}

export default function ProductAssessmentPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const projectId = params.projectId as string;
  const router = useRouter();
  const {
    getOrganization,
    getProductAssessment,
    getOrganizationAssessment,
    saveProductAssessment,
  } = useData();

  const org = getOrganization(orgId);
  const assessment = getProductAssessment(projectId);
  const orgAssessment = getOrganizationAssessment(orgId);

  const [map, setMap] = useState(emptyMap);
  const [measure, setMeasure] = useState(emptyMeasure);
  const [manage, setManage] = useState(emptyManage);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (assessment) {
      setMap(assessment.map);
      setMeasure(assessment.measure);
      setManage(assessment.manage);
    }
  }, [assessment?.id]);

  function handleSave() {
    saveProductAssessment(projectId, { map, measure, manage });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!org || !assessment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title="Not found" backHref={`/organizations/${orgId}`} />
        <p className="text-zinc-500 mt-4">This project or organization may have been removed.</p>
      </div>
    );
  }

  const playbook = orgAssessment?.playbook;

  return (
    <>
      <PageHeader
        title={assessment.name}
        backHref={`/organizations/${orgId}`}
        backLabel={org.name}
      />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Execute Map, Measure, and Manage using your organization&apos;s playbook. Add
          project-specific details and evidence below.
        </p>

        {/* Map */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            Map – context, stakeholders, and risks
          </h2>
          {playbook && (
            <PlaybookSection
              title="Map"
              methods={playbook.map.methods}
              templates={playbook.map.templates}
              tools={playbook.map.tools}
            />
          )}
          <TextArea
            id="mapContext"
            label="Context and stakeholders (project-specific)"
            value={map.contextAndStakeholders}
            onChange={(v) => setMap((m) => ({ ...m, contextAndStakeholders: v }))}
            placeholder="Describe this AI system's context, intended use, and key stakeholders."
          />
          <TextArea
            id="mapTask"
            label="Task and methods (project-specific)"
            value={map.taskAndMethods}
            onChange={(v) => setMap((m) => ({ ...m, taskAndMethods: v }))}
            placeholder="Task(s) and methods this AI system supports (e.g. classification, recommendation)."
          />
          <TextArea
            id="mapLimits"
            label="Knowledge limits and human oversight (project-specific)"
            value={map.knowledgeLimitsAndOversight}
            onChange={(v) => setMap((m) => ({ ...m, knowledgeLimitsAndOversight: v }))}
            placeholder="Document knowledge limits and how humans oversee and use outputs."
          />
          <TextArea
            id="mapTevv"
            label="TEVV considerations (project-specific)"
            value={map.tevvConsiderations}
            onChange={(v) => setMap((m) => ({ ...m, tevvConsiderations: v }))}
            placeholder="Testing, evaluation, validation, verification approach for this system."
          />
          <TextArea
            id="mapEvidence"
            label="Evidence (links, docs, artifacts)"
            value={map.evidence}
            onChange={(v) => setMap((m) => ({ ...m, evidence: v }))}
            placeholder="Evidence supporting the Map step (e.g. links to docs, risk register)."
            rows={2}
          />
        </section>

        {/* Measure */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            Measure – testing, evaluation, monitoring
          </h2>
          {playbook && (
            <PlaybookSection
              title="Measure"
              methods={playbook.measure.methods}
              templates={playbook.measure.templates}
              tools={playbook.measure.tools}
            />
          )}
          <TextArea
            id="measureMetrics"
            label="Performance metrics (project-specific)"
            value={measure.performanceMetrics}
            onChange={(v) => setMeasure((m) => ({ ...m, performanceMetrics: v }))}
            placeholder="Metrics used to evaluate this system (accuracy, fairness, etc.)."
          />
          <TextArea
            id="measureTesting"
            label="Testing and validation (project-specific)"
            value={measure.testingAndValidation}
            onChange={(v) => setMeasure((m) => ({ ...m, testingAndValidation: v }))}
            placeholder="Testing and validation results for this system."
          />
          <TextArea
            id="measureMonitoring"
            label="Monitoring and ongoing evaluation (project-specific)"
            value={measure.monitoringAndOngoingEval}
            onChange={(v) => setMeasure((m) => ({ ...m, monitoringAndOngoingEval: v }))}
            placeholder="How this system is monitored in production and how often it is re-evaluated."
          />
          <TextArea
            id="measureEvidence"
            label="Evidence (links, reports, dashboards)"
            value={measure.evidence}
            onChange={(v) => setMeasure((m) => ({ ...m, evidence: v }))}
            placeholder="Evidence supporting the Measure step (e.g. test reports, monitoring links)."
            rows={2}
          />
        </section>

        {/* Manage */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            Manage – allocation, response, adjustment
          </h2>
          {playbook && (
            <PlaybookSection
              title="Manage"
              methods={playbook.manage.methods}
              templates={playbook.manage.templates}
              tools={playbook.manage.tools}
            />
          )}
          <TextArea
            id="manageAllocation"
            label="Resource allocation (project-specific)"
            value={manage.resourceAllocation}
            onChange={(v) => setManage((m) => ({ ...m, resourceAllocation: v }))}
            placeholder="How resources are allocated for risk management for this system."
          />
          <TextArea
            id="manageIncident"
            label="Incident response (project-specific)"
            value={manage.incidentResponse}
            onChange={(v) => setManage((m) => ({ ...m, incidentResponse: v }))}
            placeholder="Incident response process and any incidents or near-misses for this system."
          />
          <TextArea
            id="manageReview"
            label="Review and adjustment (project-specific)"
            value={manage.reviewAndAdjustment}
            onChange={(v) => setManage((m) => ({ ...m, reviewAndAdjustment: v }))}
            placeholder="How and when this system is reviewed and how adjustments are made."
          />
          <TextArea
            id="manageEvidence"
            label="Evidence (incident logs, review records)"
            value={manage.evidence}
            onChange={(v) => setManage((m) => ({ ...m, evidence: v }))}
            placeholder="Evidence supporting the Manage step (e.g. incident log, review notes)."
            rows={2}
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
