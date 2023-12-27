import type { Answer } from '../../answer/entities/answer.entity';

interface IUserAnswer {
    QuestionId: string;
    agreeLevel: number;
}

export const getPartyAgreePercentage = (
    partyAnswers: Answer[],
    userAnswers: IUserAnswer[],
): number => {
    const differences: number[] = [];

    partyAnswers.forEach((partyAnswer) => {
        const userAnswer = userAnswers.find(
            (a) => a.QuestionId === partyAnswer.Question.id,
        );
        if (userAnswer && userAnswer.agreeLevel !== 0) {
            const disagreeLevel = Math.abs(
                +partyAnswer.agreeLevel - userAnswer.agreeLevel,
            );
            differences.push(disagreeLevel);
        }
    });

    if (!differences.length) return 0;

    const disagreeTotal =
        differences.reduce((a, b) => a + b, 0) / differences.length;
    const AgreePercentage = Math.round((100 - disagreeTotal * 25) * 100) / 100;
    return AgreePercentage;
};
