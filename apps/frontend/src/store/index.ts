import { IPartyWithOrientation } from "@/api";
import { IAnswerWithQuestion, IQuestion } from "@/interfaces/question-answer.interfaces";
import { defineStore } from "pinia";
import "pinia-plugin-persistedstate";


export const useQuizStore = defineStore("quiz", {
    state: () => ({
        answers: [] as IAnswerWithQuestion[],
        parties: [] as IPartyWithOrientation[],
        quizCompleted: false,
    }),
    actions: {
        // if a question has been answered before, the new answer replaces the previous one, otherwise another answer is added to the state.answers object
        answerQuestion(Question: Partial<IQuestion>, agreeLevel: number) {
            const answerIndex: number = this.answers.findIndex((x) => x.Question.id === Question.id);
            if (answerIndex === -1) this.answers.push({ Question: Question as IQuestion, agreeLevel });
            else this.answers[answerIndex].agreeLevel = agreeLevel;
        },
        setParties(parties: IPartyWithOrientation[]) {
            this.parties = parties;
        },
        completeQuiz() {
            this.quizCompleted = true;
        },
    },
    persist: true,
});

export default useQuizStore;
