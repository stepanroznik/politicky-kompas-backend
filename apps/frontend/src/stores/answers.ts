import { defineStore } from 'pinia';

interface Answer {
    id: number;
    answer: string;
}

export const useAnswersStore = defineStore('answers', {
    state: () => ({
        answers: [] as Answer[],
    }),
    
    getters: {
        getAnswerById: (state) => (questionId: number) => {
            return state.answers.find((answer) => answer.id === questionId);
        },
        isQuestionAnswered: (state) => (questionId: number) => {
            return state.answers.some((answer) => answer.id === questionId);
        },
    },
    
    actions: {
        answerQuestion(questionId: number, answer: string) {
            const answerIndex = this.answers.findIndex((x) => x.id === questionId);
            if (answerIndex === -1) {
                this.answers.push({ id: questionId, answer });
            } else {
                this.answers[answerIndex].answer = answer;
            }
        },
    },
});
