import { describe, expect, it } from 'vitest';

import { ComparableAnswer, getPartyAgreePercentage } from './calculations';

describe('getPartyAgreePercentage', () => {
    it('returns 100 when answers match', () => {
        const party: ComparableAnswer[] = [
            { QuestionId: 'q1', agreeLevel: 5 },
            { QuestionId: 'q2', agreeLevel: 3 },
        ];
        const user: ComparableAnswer[] = [
            { QuestionId: 'q1', agreeLevel: 5 },
            { QuestionId: 'q2', agreeLevel: 3 },
        ];

        expect(getPartyAgreePercentage(party, user)).toBe(100);
    });

    it('returns 0 when answers are opposite', () => {
        const party: ComparableAnswer[] = [
            { Question: { id: 'q1' }, agreeLevel: 1 },
            { Question: { id: 'q2' }, agreeLevel: 1 },
        ];
        const user: ComparableAnswer[] = [
            { Question: { id: 'q1' }, agreeLevel: 5 },
            { Question: { id: 'q2' }, agreeLevel: 5 },
        ];

        expect(getPartyAgreePercentage(party, user)).toBe(0);
    });

    it('ignores unanswered questions', () => {
        const party: ComparableAnswer[] = [
            { QuestionId: 'q1', agreeLevel: 5 },
            { QuestionId: 'q2', agreeLevel: 2 },
        ];
        const user: ComparableAnswer[] = [
            { QuestionId: 'q1', agreeLevel: 5 },
            { QuestionId: 'q2', agreeLevel: 0 },
        ];

        expect(getPartyAgreePercentage(party, user)).toBe(100);
    });

    it('handles questionId casing differences', () => {
        const party: ComparableAnswer[] = [{ questionId: 'q1', agreeLevel: 4 }];
        const user: ComparableAnswer[] = [{ QuestionId: 'q1', agreeLevel: 2 }];

        expect(getPartyAgreePercentage(party, user)).toBe(50);
    });
});
