import { create } from "zustand";
import type { SectionTracking, SectionKey } from "./types";
import { IMPLEMENTATION_SECTION_KEYS } from "./types";

interface ImplementationState {
  currentStep: number;
  totalSteps: number;
  sections: SectionTracking[];
  implementationId: string | null;

  setCurrentStep: (step: number) => void;
  setSections: (sections: SectionTracking[]) => void;
  setSectionData: (stepIndex: number, data: Partial<SectionTracking>) => void;
  setImplementationId: (id: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

function createDefaultSections(): SectionTracking[] {
  return IMPLEMENTATION_SECTION_KEYS.map((key) => ({
    key,
    status: "NOT_STARTED" as const,
    dueDate: null,
    owner: "",
    notes: "",
    data: {},
  }));
}

export const useImplementationStore = create<ImplementationState>((set, get) => ({
  currentStep: 1,
  totalSteps: 8,
  sections: createDefaultSections(),
  implementationId: null,

  setCurrentStep: (step) => set({ currentStep: step }),

  setSections: (sections) => set({ sections }),

  setSectionData: (stepIndex, data) =>
    set((state) => {
      const updated = [...state.sections];
      updated[stepIndex] = { ...updated[stepIndex], ...data };
      return { sections: updated };
    }),

  setImplementationId: (id) => set({ implementationId: id }),

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps) set({ currentStep: currentStep + 1 });
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) set({ currentStep: currentStep - 1 });
  },

  reset: () =>
    set({
      currentStep: 1,
      sections: createDefaultSections(),
      implementationId: null,
    }),
}));
