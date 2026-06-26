import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { scoreCalculatorResult } from './calculator-2026.scoring';

describe('calculator 2026 scoring', () => {
    const questions = [
        { id: 'q1', axisCode: 'axis-a', reversed: false },
        { id: 'q2', axisCode: 'axis-a', reversed: true },
        { id: 'q3', axisCode: 'axis-b', reversed: false },
    ];

    it('scores exact matches as 100 percent', () => {
        const result = scoreCalculatorResult(
            questions,
            [
                {
                    code: 'A',
                    name: 'Party A',
                    ratings: [
                        { questionId: 'q1', rating: 4 },
                        { questionId: 'q2', rating: 1 },
                    ],
                },
            ],
            [
                { questionId: 'q1', value: 4 },
                { questionId: 'q2', value: 1 },
            ],
        );

        expect(result.matches[0].percentage).toBe(100);
        expect(result.matches[0].answeredCount).toBe(2);
    });

    it('ignores skipped answers and missing party ratings', () => {
        const result = scoreCalculatorResult(
            questions,
            [
                {
                    code: 'A',
                    name: 'Party A',
                    ratings: [
                        { questionId: 'q1', rating: 4 },
                        { questionId: 'q2', rating: null },
                        { questionId: 'q3', rating: 1 },
                    ],
                },
            ],
            [
                { questionId: 'q1', value: 4 },
                { questionId: 'q2', value: null },
            ],
        );

        expect(result.answeredCount).toBe(1);
        expect(result.matches[0].answeredCount).toBe(1);
        expect(result.matches[0].percentage).toBe(100);
    });

    it('applies reversed polarity to axis values only', () => {
        const result = scoreCalculatorResult(
            questions,
            [],
            [
                { questionId: 'q1', value: 4 },
                { questionId: 'q2', value: 4 },
            ],
        );

        expect(result.userAxisScores).toEqual([
            { axisCode: 'axis-a', value: 0, answeredCount: 2 },
        ]);
    });

    it('validates the committed seed shape', () => {
        const seedPath = join(
            __dirname,
            'seed/calculator-2026.seed.json',
        );
        const seed = JSON.parse(readFileSync(seedPath, 'utf8'));

        expect(seed.questions).toHaveLength(120);
        expect(seed.axes).toHaveLength(8);
        expect(seed.parties).toHaveLength(7);
        expect(seed.ratings).toHaveLength(840);
        expect(
            seed.questions.filter(
                (question: { description?: string | null }) =>
                    Boolean(question.description?.trim()),
            ).length,
        ).toBeGreaterThanOrEqual(80);
        expect(
            seed.ratings.every(
                (rating: { rating: number | null }) =>
                    rating.rating === null ||
                    (rating.rating >= 1 && rating.rating <= 4),
            ),
        ).toBe(true);
    });
});
