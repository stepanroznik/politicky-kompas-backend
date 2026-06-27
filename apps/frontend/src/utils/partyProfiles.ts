import {
    AxisScore,
    CalculatorAxis,
    CalculatorParty,
    CalculatorQuestion,
    PartyMatch,
} from "@frontend/stores/calculator2026";

export interface PartyRating {
    questionId: string;
    partyCode: string;
    rating: number | null;
}

export interface QuestionWithRatings extends CalculatorQuestion {
    ratings: PartyRating[];
}

const electionOrder2025 = ["ANO", "SPOLU", "STAN", "PIRATI", "SPD", "MOTORISTE", "STACILO"];

function normalizeScale(value: number) {
    return ((value - 1) / 3) * 2 - 1;
}

function axisValue(value: number, reversed: boolean) {
    return normalizeScale(value) * (reversed ? -1 : 1);
}

function average(values: number[]) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number) {
    return Math.round(value * 100) / 100;
}

export function partyOrder(code: string) {
    const index = electionOrder2025.indexOf(code);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function buildPartyProfiles(
    axes: CalculatorAxis[],
    parties: CalculatorParty[],
    questions: QuestionWithRatings[],
): PartyMatch[] {
    const axisCodes = new Set(axes.map((axis) => axis.code));
    const axisValuesByParty = new Map<string, Map<string, number[]>>();

    for (const question of questions) {
        if (!axisCodes.has(question.axisCode)) continue;
        for (const rating of question.ratings ?? []) {
            if (rating.rating === null || rating.rating === undefined) continue;
            if (rating.rating < 1 || rating.rating > 4) continue;

            const byAxis = axisValuesByParty.get(rating.partyCode) ?? new Map<string, number[]>();
            const values = byAxis.get(question.axisCode) ?? [];
            values.push(axisValue(rating.rating, question.reversed));
            byAxis.set(question.axisCode, values);
            axisValuesByParty.set(rating.partyCode, byAxis);
        }
    }

    return [...parties]
        .sort((a, b) => partyOrder(a.code) - partyOrder(b.code))
        .map((party) => {
            const byAxis = axisValuesByParty.get(party.code) ?? new Map<string, number[]>();
            const axisScores: AxisScore[] = [...axes]
                .sort((a, b) => a.order - b.order)
                .map((axis) => {
                    const values = byAxis.get(axis.code) ?? [];
                    return {
                        axisCode: axis.code,
                        value: round(average(values)),
                        answeredCount: values.length,
                    };
                });
            const answeredCount = axisScores.reduce((sum, score) => sum + score.answeredCount, 0);

            return {
                partyCode: party.code,
                partyName: party.name,
                percentage: 0,
                answeredCount,
                axisScores,
            };
        });
}
