<template>
    <div v-if="questions?.length">
        <div
            class="question lg:border rounded lg:border-gray-300 p-2 sm:p-4 mb-4 sm:mb-8 h-52 2xs:h-44 xs:h-36 lg:h-32 overflow-y-auto"
        >
            <h2 class="text-base xs:text-lg font-medium py-2">
                {{ currentQuestion.title }}
            </h2>
            <div class="text-sm xs:text-base flex flex-row items-stretch">
                <span class="bg-gray-300 rounded-sm w-2 mr-2 my-1" />
                <h3 class="flex-1 text-left">
                    {{ currentQuestion.subtitle }}
                </h3>
            </div>
        </div>
        <div
            :key="currentQuestionIndex"
            class="answers flex flex-col sm:max-w-2xl m-auto"
        >
            <button
                class="border-2 border-solid active:outline-none answer col-al5 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150"
                :class="isCurrentQuestionAnswered && currentQuestionAnswer == 5 ? 'border-dashed border-gray-500' : 'border-transparent'"
                type="button"
                @click="answerQuestion(5)"
            >
                Rozhodně souhlasím
            </button>
            <button
                class="border-2 border-solid active:outline-none answer col-al4 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150"
                :class="isCurrentQuestionAnswered && currentQuestionAnswer == 4 ? 'border-dashed border-gray-500' : 'border-transparent'"
                type="button"
                @click="answerQuestion(4)"
            >
                Spíše souhlasím
            </button>

            <button
                class="flex-1 border-2 border-solid active:outline-none answer col-al3 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150"
                :class="isCurrentQuestionAnswered && currentQuestionAnswer == 3 ? 'border-dashed border-gray-500' : 'border-transparent'"
                type="button"
                @click="answerQuestion(3)"
            >
                Neutrální
            </button>

            <button
                class="border-2 border-solid active:outline-none answer col-al2 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150"
                :class="isCurrentQuestionAnswered && currentQuestionAnswer == 2 ? 'border-dashed border-gray-500' : 'border-transparent'"
                type="button"
                @click="answerQuestion(2)"
            >
                Spíše nesouhlasím
            </button>
            <button
                class="border-2 border-solid active:outline-none answer col-al1 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150"
                :class="isCurrentQuestionAnswered && currentQuestionAnswer == 1 ? 'border-dashed border-gray-500' : 'border-transparent'"
                type="button"
                @click="answerQuestion(1)"
            >
                Rozhodně nesouhlasím
            </button>
            <button
                class="flex-1 w-1/2 sm:w-1/3 self-end border-2 border-solid active:outline-none answer col-al0 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150"
                :class="isCurrentQuestionAnswered && currentQuestionAnswer == 0 ? 'border-dashed border-gray-500' : 'border-transparent'"
                type="button"
                @click="answerQuestion(0)"
            >
                Nevím
            </button>
        </div>
        <div class="py-4 sm:mt-4">
            <div
                :key="currentQuestionIndex"
                class="xs:p-2 grid grid-cols-3 sm:max-w-2xl mx-auto"
            >
                <span class="text-sm text-gray-300">
                    <button
                        class="p-1 border border-transparent active:outline-none rounded"
                        :class="{ 'hover:border-gray-400 text-gray-600': !isCurrentQuestionFirst }"
                        :disabled="isCurrentQuestionFirst"
                        @click="goToPreviousQuestion"
                    >
                        &lt; předchozí
                    </button>
                </span>
                <span class="p-1 text-lg text-gray-700"> Otázka {{ currentQuestionIndex + 1 }} z {{ isCurrentQuestionPrimary
                    ? primaryQuestionsCount : questions.length }} </span>
                <span class="text-sm text-gray-300">
                    <button
                        v-if="!isCurrentQuestionLast"
                        class="p-1 border border-transparent active:outline-none rounded"
                        :class="{ 'hover:border-gray-400 text-gray-600': isCurrentQuestionAnswered && !isCurrentQuestionLast }"
                        :disabled="!isCurrentQuestionAnswered"
                        @click="goToNextQuestion"
                    >
                        další &gt;
                    </button>
                </span>
            </div>
            <div class="w-full rounded h-6 p-1 border border-gray-300">
                <div
                    class="progress-bar rounded-sm h-full bg-gray-300"
                    :style="{ width: 100 / ((isCurrentQuestionPrimary ? primaryQuestionsCount : questions.length) / (currentQuestionIndex + 1)) + '%' }"
                />
            </div>
        </div>
        <modal
            :show="showModal"
            :message="`Zvládnete ještě ${questions.length - primaryQuestionsCount} otázek?`"
            :text="`Můžete test ihned ukončit nebo vyplnit posledních ${questions.length - primaryQuestionsCount} otázek a dostat tak přesnější výsledek.`"
            button-yes="Ano, zvládnu!"
            button-no="Ne, zobrazit výsledek"
            @close="decideToContinue($event)"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, PropType } from "vue";
import Modal from "./Modal.vue";
import { useRouter, useRoute } from "vue-router";
import useQuizStore from "@/store";
import { IQuestion } from "@/interfaces/question-answer.interfaces";

const props = defineProps({
    questions: {
        type: Array as PropType<IQuestion[]>,
        required: true
    }
});

const router = useRouter();
const route = useRoute();
const store = useQuizStore();

const currentQuestionIndex = ref(0);
const showModal = ref(false);

const isCurrentQuestionFirst = computed(() => currentQuestionIndex.value === 0);
const isCurrentQuestionLast = computed(() => currentQuestionIndex.value + 1 >= props.questions.length);
const currentQuestion = computed(() => props.questions[currentQuestionIndex.value]);
const isCurrentQuestionAnswered = computed(() => !!store.answers.find((x) => x.Question.id === currentQuestion.value.id)?.agreeLevel);
const currentQuestionAnswer = computed(() => {
    if (isCurrentQuestionAnswered.value) return store.answers.find((x) => x.Question.id === currentQuestion.value.id)?.agreeLevel;
    return false;
});
const primaryQuestionsCount = computed(() => props.questions.filter((q) => q.isPrimary).length);
const isCurrentQuestionPrimary = computed(() => primaryQuestionsCount.value > currentQuestionIndex.value);

onMounted(async () => {
    const q = parseInt(route.query.q as string);
    if (q > 0 && q <= props.questions.length) {
        if (store.answers.length >= q - 1) {
            currentQuestionIndex.value = q - 1;
            return;
        }
    }
    await setCurrentQuestionQuery();
});

async function setCurrentQuestionQuery() {
    await router.push({ query: { q: currentQuestionIndex.value + 1 } });
}

async function goToPreviousQuestion() {
    if (!isCurrentQuestionFirst.value) {
        currentQuestionIndex.value -= 1;
        await setCurrentQuestionQuery();
    }
}

async function goToNextQuestion() {
    if (isCurrentQuestionAnswered.value && !isCurrentQuestionLast.value) {
        currentQuestionIndex.value += 1;
        await setCurrentQuestionQuery();
        return;
    }
    if (isCurrentQuestionLast.value) {
        store.completeQuiz();
        await router.push({ name: "Result" });
    }
}

async function answerQuestion(agreeLevel: number) {
    if (isCurrentQuestionFirst.value) {
        store.answers = [];
        store.quizCompleted = false;
    }
    store.answerQuestion({ id: currentQuestion.value.id, position: currentQuestion.value.position }, agreeLevel);
    if (primaryQuestionsCount.value - 1 === currentQuestionIndex.value) {
        return (showModal.value = true);
    }
    await goToNextQuestion();
}

async function decideToContinue(decision: boolean) {
    if (decision) {
        await goToNextQuestion();
    } else {
        store.completeQuiz();
        await router.push({ name: "Result" });
    }
    showModal.value = false;
}
</script>

<style scoped>
.progress-bar {
    transition: width 0.5s;
}

.answer {
    @apply opacity-85;
}

.col-al1 {
    background-color: hsl(5, 80%, 60%);
}

.col-al1:hover {
    background-color: hsl(5, 80%, 50%);
}

.col-al1:active {
    background-color: hsl(5, 80%, 45%);
}

.col-al2 {
    background-color: hsl(20, 80%, 60%);
}

.col-al2:hover {
    background-color: hsl(20, 80%, 50%);
}

.col-al2:active {
    background-color: hsl(20, 80%, 45%);
}

.col-al3 {
    background-color: hsl(52.5, 80%, 50%);
}

.col-al3:hover {
    background-color: hsl(52.5, 80%, 42.5%);
}

.col-al3:active {
    background-color: hsl(52.5, 80%, 35%);
}

.col-al4 {
    background-color: hsl(80, 80%, 45%);
}

.col-al4:hover {
    background-color: hsl(80, 80%, 40%);
}

.col-al4:active {
    background-color: hsl(80, 80%, 35%);
}

.col-al5 {
    background-color: hsl(100, 80%, 45%);
}

.col-al5:hover {
    background-color: hsl(100, 80%, 40%);
}

.col-al5:active {
    background-color: hsl(100, 80%, 35%);
}

.col-al0 {
    background-color: hsl(0, 0%, 60%);
}

.col-al0:hover {
    background-color: hsl(0, 0%, 50%);
}

.col-al0:active {
    background-color: hsl(0, 0%, 45%);
}
</style>
