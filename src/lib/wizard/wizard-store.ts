import { create } from "zustand";

interface WizardState {
  currentStep: number;
  totalSteps: number;
  answers: Record<string, unknown>;
  setCurrentStep: (step: number) => void;
  setTotalSteps: (total: number) => void;
  setStepAnswers: (step: number, data: Record<string, unknown>) => void;
  setAllAnswers: (answers: Record<string, unknown>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  currentStep: 1,
  totalSteps: 9,
  answers: {},

  setCurrentStep: (step) => set({ currentStep: step }),
  setTotalSteps: (total) => set({ totalSteps: total }),

  setStepAnswers: (step, data) =>
    set((state) => ({
      answers: { ...state.answers, [`step${step}`]: data },
    })),

  setAllAnswers: (answers) => set({ answers }),

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps) set({ currentStep: currentStep + 1 });
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) set({ currentStep: currentStep - 1 });
  },

  reset: () => set({ currentStep: 1, answers: {} }),
}));
