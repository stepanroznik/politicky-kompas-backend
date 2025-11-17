export interface ComparableAnswer {
    agreeLevel: number | string;
    QuestionId?: string;
    questionId?: string;
    Question?: { id?: string } | null;
}

const normalizeAgreeLevel = (
    value: ComparableAnswer['agreeLevel'],
): number | null => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return null;
    return numeric;
};

const extractQuestionId = (answer: ComparableAnswer): string | undefined =>
    answer.QuestionId ?? answer.questionId ?? answer.Question?.id ?? undefined;

export const getPartyAgreePercentage = (
    partyAnswers: ComparableAnswer[],
    userAnswers: ComparableAnswer[],
): number => {
    if (!partyAnswers.length || !userAnswers.length) return 0;

    const userAnswerMap = new Map<string, number>();
    for (const userAnswer of userAnswers) {
        const questionId = extractQuestionId(userAnswer);
        const agreeLevel = normalizeAgreeLevel(userAnswer.agreeLevel);
        if (!questionId || agreeLevel === null || agreeLevel === 0) continue;
        userAnswerMap.set(questionId, agreeLevel);
    }

    if (!userAnswerMap.size) return 0;

    const differences: number[] = [];
    for (const partyAnswer of partyAnswers) {
        const questionId = extractQuestionId(partyAnswer);
        if (!questionId) continue;

        const userAgreeLevel = userAnswerMap.get(questionId);
        if (userAgreeLevel === undefined) continue;

        const partyAgreeLevel = normalizeAgreeLevel(partyAnswer.agreeLevel);
        if (partyAgreeLevel === null) continue;

        const disagreeLevel = Math.abs(partyAgreeLevel - userAgreeLevel);
        differences.push(disagreeLevel);
    }

    if (!differences.length) return 0;

    const disagreeTotal =
        differences.reduce((a, b) => a + b, 0) / differences.length;
    const agreePercentage = Math.round((100 - disagreeTotal * 25) * 100) / 100;
    return agreePercentage;
};
