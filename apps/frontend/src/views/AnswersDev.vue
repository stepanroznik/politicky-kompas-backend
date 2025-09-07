<template>
    <div
        v-if="questions?.length && parties?.length"
        class="h-24"
    >
        <div>{{ questions[index].title }}</div>
        <span
            v-for="party in parties"
            :key="party.id"
        >
            <span class="inline-flex flex-col">
                {{ party.abbreviation }}
                <input
                    type="number"
                    max="5"
                    min="1"
                    class="w-16"
                    :value="answers.find((a) => a.QuestionId === currentQuestion!.id && a.PartyId === party.id)?.agreeLevel"
                    @change="changeAgreeLevel(party.id, ($event.target as any).value)"
                >
            </span>
        </span>
    </div>
    <a
        href="#"
        @click.prevent="index--"
    >
        Předchozí
    </a>
    <a
        href="#"
        @click.prevent="sendAnswers"
    >
        Odeslat
    </a>
    <a
        href="#"
        @click.prevent="index++"
    >
        Další
    </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IPartyWithOrientation, apiGet, apiPost } from '../api/index';
import { IQuestion, IAnswer } from '@/interfaces/question-answer.interfaces';

export default defineComponent({
    name: 'Answers',
    data() {
        return {
            index: 0,
            parties: [] as IPartyWithOrientation[],
            questions: [] as IQuestion[],
            answers: [] as IAnswer[],
            newAnswers: [] as IAnswer[],
            modifiedAnswers: [] as IAnswer[],
        };
    },
    computed: {
        currentQuestion(): IQuestion | undefined {
            return this.questions[this.index];
        }
    },
    async created() {
        this.parties = await apiGet({ url: 'parties' });
        this.questions = await apiGet({ url: 'questions' });
        this.answers = await apiGet({ url: 'answers' });
    },
    methods: {
        changeAgreeLevel(partyId: string, value: string) {
            const currentQuestion = this.currentQuestion;
            if (!currentQuestion) return;

            const existingAnswer = this.answers.find(a => a.QuestionId === currentQuestion.id && a.PartyId === partyId);

            const existingNewAnswerIndex = this.newAnswers.findIndex(a => a.QuestionId === currentQuestion.id && a.PartyId === partyId);
            if (existingNewAnswerIndex !== -1) this.newAnswers.splice(existingNewAnswerIndex, 1);
            const existingModifiedAnswerIndex = this.modifiedAnswers.findIndex(a => a.QuestionId === currentQuestion.id && a.PartyId === partyId);
            if (existingModifiedAnswerIndex !== -1) this.modifiedAnswers.splice(existingModifiedAnswerIndex, 1);

            if (value) {
                const newAnswer: IAnswer = { PartyId: partyId, QuestionId: currentQuestion.id, agreeLevel: parseInt(value) };
                if (existingAnswer) this.modifiedAnswers.push(newAnswer);
                else this.newAnswers.push(newAnswer);
            }
        },
        async sendAnswers() {
            console.log('sending these:', this.newAnswers);
            apiPost({url: 'answers', body: this.newAnswers});
            this.modifiedAnswers.forEach(a => {
                apiPost({url: `answers/${a.QuestionId}/${a.PartyId}`, body: a, method: 'PUT'});
            });
            this.newAnswers = [];
            this.modifiedAnswers = [];
            this.answers = await apiGet({ url: 'answers' });
        }
    },
});
</script>
