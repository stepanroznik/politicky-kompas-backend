import { defineStore } from "pinia";
import { apiGet, apiPost } from "@frontend/api";

export interface CalculatorAxis {
    code: string;
    name: string;
    negativeLabel: string;
    positiveLabel: string;
    order: number;
}

export interface CalculatorParty {
    code: string;
    name: string;
    sourceColumn: string;
    color?: string | null;
}

export interface CalculatorQuestion {
    id: string;
    axisCode: string;
    order: number;
    dimensionOrder: number;
    facet: string;
    originalText: string;
    text: string;
    description?: string | null;
    reversed: boolean;
    reviewStatus: string;
    reviewNote?: string | null;
}

export interface CalculatorAnswer {
    questionId: string;
    value: number | null;
}

export interface AxisScore {
    axisCode: string;
    value: number;
    answeredCount: number;
}

export interface PartyMatch {
    partyCode: string;
    partyName: string;
    percentage: number;
    answeredCount: number;
    axisScores: AxisScore[];
}

export interface CalculatorResult {
    userAxisScores: AxisScore[];
    matches: PartyMatch[];
    answeredCount: number;
}

function generateFingerprint() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useCalculator2026Store = defineStore("calculator-2026", {
    state: () => ({
        slug: "2026",
        name: "",
        description: "",
        axes: [] as CalculatorAxis[],
        parties: [] as CalculatorParty[],
        questions: [] as CalculatorQuestion[],
        answers: [] as CalculatorAnswer[],
        result: null as CalculatorResult | null,
        fingerprint: generateFingerprint(),
        isLoaded: false,
    }),
    actions: {
        async load() {
            if (this.isLoaded && this.questions.length) return;
            const [calculator, questions] = await Promise.all([
                apiGet({ url: `calculators/${this.slug}` }),
                apiGet({ url: `calculators/${this.slug}/questions` }),
            ]);
            this.name = calculator.name;
            this.description = calculator.description;
            this.axes = calculator.axes ?? [];
            this.parties = calculator.parties ?? [];
            this.questions = questions ?? [];
            this.isLoaded = true;
        },
        answerQuestion(questionId: string, value: number | null) {
            const existing = this.answers.find((answer) => answer.questionId === questionId);
            if (existing) existing.value = value;
            else this.answers.push({ questionId, value });
        },
        getAnswer(questionId: string) {
            return this.answers.find((answer) => answer.questionId === questionId);
        },
        reset() {
            this.answers = [];
            this.result = null;
            this.fingerprint = generateFingerprint();
        },
        async submit() {
            const result = await apiPost({
                url: `calculators/${this.slug}/results`,
                body: {
                    answers: this.answers,
                    fingerprint: this.fingerprint,
                },
            });
            this.result = result;
            return result;
        },
    },
    persist: true,
});
