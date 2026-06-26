export interface ScoringQuestion {
    id: string;
    axisCode: string;
    reversed: boolean;
}

export interface ScoringParty {
    code: string;
    name: string;
    ratings: Array<{
        questionId: string;
        rating: number | null | undefined;
    }>;
}

export interface ScoringAnswer {
    questionId: string;
    value?: number | null;
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

export interface CalculatorScoreResult {
    userAxisScores: AxisScore[];
    matches: PartyMatch[];
    answeredCount: number;
}

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

function buildAxisScores(
    values: Array<{ axisCode: string; value: number }>,
): AxisScore[] {
    const grouped = new Map<string, number[]>();
    for (const item of values) {
        const axisValues = grouped.get(item.axisCode) ?? [];
        axisValues.push(item.value);
        grouped.set(item.axisCode, axisValues);
    }

    return [...grouped.entries()].map(([axisCode, axisValues]) => ({
        axisCode,
        value: round(average(axisValues)),
        answeredCount: axisValues.length,
    }));
}

export function scoreCalculatorResult(
    questions: ScoringQuestion[],
    parties: ScoringParty[],
    answers: ScoringAnswer[],
): CalculatorScoreResult {
    const questionById = new Map(questions.map((question) => [question.id, question]));
    const userAnswerByQuestion = new Map<string, number>();

    for (const answer of answers) {
        if (!answer.questionId || answer.value === null || answer.value === undefined) {
            continue;
        }
        if (answer.value < 1 || answer.value > 4) continue;
        if (!questionById.has(answer.questionId)) continue;
        userAnswerByQuestion.set(answer.questionId, answer.value);
    }

    const userAxisValues = [...userAnswerByQuestion.entries()].map(
        ([questionId, value]) => {
            const question = questionById.get(questionId)!;
            return {
                axisCode: question.axisCode,
                value: axisValue(value, question.reversed),
            };
        },
    );

    const matches = parties.map((party) => {
        const partyAxisValues: Array<{ axisCode: string; value: number }> = [];
        const distances: number[] = [];

        for (const rating of party.ratings) {
            if (rating.rating === null || rating.rating === undefined) continue;
            const userAnswer = userAnswerByQuestion.get(rating.questionId);
            if (userAnswer === undefined) continue;
            const question = questionById.get(rating.questionId);
            if (!question) continue;

            distances.push(Math.abs(userAnswer - rating.rating) / 3);
            partyAxisValues.push({
                axisCode: question.axisCode,
                value: axisValue(rating.rating, question.reversed),
            });
        }

        const agreement = distances.length ? (1 - average(distances)) * 100 : 0;
        return {
            partyCode: party.code,
            partyName: party.name,
            percentage: round(agreement),
            answeredCount: distances.length,
            axisScores: buildAxisScores(partyAxisValues),
        };
    });

    return {
        userAxisScores: buildAxisScores(userAxisValues),
        matches: matches.sort((first, second) => second.percentage - first.percentage),
        answeredCount: userAnswerByQuestion.size,
    };
}
