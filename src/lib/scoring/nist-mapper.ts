import { ControlSelection } from "../rules-engine/types";

export interface NistMappingEntry {
  finding: string;
  nistRef: string;
  controlId: string;
  controlName: string;
  designation: string;
  evidence: string[];
  description: string;
  implementationSteps: string[];
  implementationLevel: string;
  controlType: string;
  /** When set, show per-control callout e.g. "AWS: Amazon SageMaker Model Monitor". */
  implementationVendor?: "aws" | "azure";
  implementationService?: string;
}

interface ControlWithRefs {
  controlId: string;
  name: string;
  description: string;
  implementationSteps: string[];
  implementationLevel: string;
  type: string;
  nistRefIds: string[];
  evidenceArtifacts: string[];
  implementationVendor?: "aws" | "azure";
  implementationService?: string;
}

export function mapToNist(
  selections: ControlSelection[],
  controls: ControlWithRefs[]
): NistMappingEntry[] {
  const entries: NistMappingEntry[] = [];
  const controlMap = new Map(controls.map((c) => [c.controlId, c]));

  for (const selection of selections) {
    const control = controlMap.get(selection.controlId);
    if (!control) continue;

    for (const nistRef of control.nistRefIds) {
      entries.push({
        finding: selection.reasoning[0] || `Control required: ${control.name}`,
        nistRef,
        controlId: control.controlId,
        controlName: control.name,
        designation: selection.designation,
        evidence: control.evidenceArtifacts,
        description: control.description,
        implementationSteps: control.implementationSteps,
        implementationLevel: control.implementationLevel,
        controlType: control.type,
        implementationVendor: control.implementationVendor,
        implementationService: control.implementationService,
      });
    }
  }

  return entries;
}
