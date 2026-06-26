import { IPartyWithOrientation, apiPost } from "@frontend/api";
import { IAnswerWithQuestion, IQuestion } from "@frontend/interfaces/question-answer.interfaces";
import { defineStore } from "pinia";
import "pinia-plugin-persistedstate";

export interface IPartyResult {
    partyId: string;
    percentage: number;
}

function generateFingerprint() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    const randomSuffix = Math.random().toString(16).slice(2);
    return `${Date.now()}-${randomSuffix}`;
}

function getAnswerQuestionId(answer: IAnswerWithQuestion) {
    return answer.QuestionId ?? answer.Question?.id;
}

export const useQuizStore = defineStore("quiz", {
    state: () => ({
        answers: [] as IAnswerWithQuestion[],
        parties: [] as IPartyWithOrientation[],
        results: [] as IPartyResult[],
        quizCompleted: false,
        fingerprint: generateFingerprint(),
    }),
    actions: {
        // if a question has been answered before, the new answer replaces the previous one, otherwise another answer is added to the state.answers object
        answerQuestion(Question: Partial<IQuestion>, agreeLevel: number) {
            if (!Question?.id) return;
            const answerIndex = this.answers.findIndex(
                (answer) => getAnswerQuestionId(answer) === Question.id,
            );
            if (answerIndex === -1) {
                this.answers.push({
                    Question: Question as IQuestion,
                    QuestionId: Question.id,
                    agreeLevel,
                } as IAnswerWithQuestion);
            }
            else {
                this.answers[answerIndex].agreeLevel = agreeLevel;
                this.answers[answerIndex].QuestionId = Question.id;
            }
        },
        setParties(parties: IPartyWithOrientation[]) {
            this.parties = parties;
        },
        setResults(results: IPartyResult[]) {
            this.results = results;
        },
        resetProgress() {
            this.answers = [];
            this.results = [];
            this.quizCompleted = false;
        },
        ensureFingerprint() {
            if (!this.fingerprint) this.fingerprint = generateFingerprint();
            return this.fingerprint;
        },
        async submitResults() {
            const fingerprint = this.ensureFingerprint();
            const payloadAnswers = this.answers
                .map((answer) => ({
                    QuestionId: answer.QuestionId ?? answer.Question?.id,
                    agreeLevel: answer.agreeLevel,
                }))
                .filter((answer) => Boolean(answer.QuestionId));

            if (!payloadAnswers.length) {
                this.results = [];
                return this.results;
            }

            const response = await apiPost({
                url: "results",
                body: {
                    answers: payloadAnswers,
                    fingerprint,
                    gender: "other",
                },
            });

            if (!Array.isArray(response)) {
                throw new Error("Invalid results response.");
            }

            this.results = response
                .filter((item: unknown): item is IPartyResult => {
                    if (!item || typeof item !== "object") return false;
                    const candidate = item as Partial<IPartyResult>;
                    return (
                        typeof candidate.partyId === "string" &&
                        typeof candidate.percentage === "number"
                    );
                })
                .map((item) => ({
                    partyId: item.partyId,
                    percentage: item.percentage,
                }));

            return this.results;
        },
        completeQuiz() {
            this.quizCompleted = true;
        },
    },
    persist: true,
});

export default useQuizStore;
