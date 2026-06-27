<template>
  <section class="mx-auto max-w-3xl text-center">
    <loading v-if="isLoading" />
    <div
      v-else-if="currentQuestion"
      class="flex flex-col gap-5"
    >
      <div class="question flex min-h-[14rem] flex-col justify-center rounded border border-gray-300 p-3 sm:min-h-[13rem] sm:p-5">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
          <span>Otázka {{ currentIndex + 1 }} z {{ progressTotal }}</span>
          <span class="font-semibold">{{ currentAxis?.name }}</span>
        </div>
        <h1 class="text-xl font-semibold leading-snug text-gray-950 sm:text-2xl">
          {{ currentQuestion.text }}
        </h1>
        <p
          v-if="currentQuestion.description"
          class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600"
        >
          {{ currentQuestion.description }}
        </p>
        <p
          v-if="isMainQuestion(currentQuestion.id)"
          class="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Hlavní otázka
        </p>
      </div>

      <div
        :key="currentQuestion.id"
        class="answers mx-auto flex w-full max-w-2xl flex-col"
      >
        <button
          v-for="option in answerOptions"
          :key="option.label"
          class="answer mb-1 rounded border-2 border-solid px-6 py-2 text-sm font-semibold uppercase text-white transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
          :class="[option.className, isSelected(option.value) ? 'border-dashed border-gray-700' : 'border-transparent']"
          type="button"
          :disabled="isSubmitting"
          @click="answer(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <div class="py-2 sm:mt-2">
        <div class="mx-auto grid max-w-2xl grid-cols-3 items-center">
          <span class="text-left text-sm text-gray-300">
            <button
              class="rounded border border-transparent p-1 disabled:cursor-not-allowed disabled:opacity-50"
              :class="{ 'text-gray-600 hover:border-gray-400': currentIndex > 0 && !isSubmitting }"
              type="button"
              :disabled="currentIndex === 0 || isSubmitting"
              @click="previous"
            >
              &lt; předchozí
            </button>
          </span>
          <span class="p-1 text-base text-gray-700">
            {{ answeredCount }} odpovědí
          </span>
          <span class="text-right text-sm text-gray-300">
            <button
              class="rounded border border-transparent p-1 disabled:cursor-not-allowed disabled:opacity-50"
              :class="{ 'text-gray-600 hover:border-gray-400': hasCurrentAnswer && !isSubmitting }"
              type="button"
              :disabled="!hasCurrentAnswer || isSubmitting"
              @click="next"
            >
              {{ isLastQuestion ? "výsledek" : "další >" }}
            </button>
          </span>
        </div>
        <div class="mt-2 h-6 w-full rounded border border-gray-300 p-1">
          <div
            class="progress-bar h-full rounded-sm bg-gray-300"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <modal
        :show="showCheckpointModal"
        :message="checkpointMessage"
        :text="checkpointText"
        button-yes="Pokračovat"
        button-no="Ne, zobrazit výsledek"
        @close="decideToContinue($event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Loading from "@frontend/components/Loading.vue";
import Modal from "@frontend/components/Modal.vue";
import { CalculatorQuestion, useCalculator2026Store } from "@frontend/stores/calculator2026";

const router = useRouter();
const route = useRoute();
const store = useCalculator2026Store();
const currentIndex = ref(0);
const isLoading = ref(true);
const isSubmitting = ref(false);
const showCheckpointModal = ref(false);

const roughCheckpoint = 24;
const standardCheckpoint = 64;

const answerOptions = [
    { label: "Rozhodně souhlasím", value: 4, className: "col-al4" },
    { label: "Spíše souhlasím", value: 3, className: "col-al3" },
    { label: "Spíše nesouhlasím", value: 2, className: "col-al2" },
    { label: "Rozhodně nesouhlasím", value: 1, className: "col-al1" },
    { label: "Nevím / přeskočit", value: null, className: "col-al0 self-end w-1/2 sm:w-1/3" },
] as const;

const orderedQuestions = computed(() => {
    const sortedAxes = [...store.axes].sort((a, b) => a.order - b.order);
    const byAxis = sortedAxes.map((axis, index) =>
        balanceQuestionDirection(
            store.questions
                .filter((question) => question.axisCode === axis.code)
                .sort((a, b) => a.dimensionOrder - b.dimensionOrder),
            index + 1,
        ),
    );
    const ordered: CalculatorQuestion[] = [];
    const maxAxisQuestions = Math.max(...byAxis.map((questions) => questions.length), 0);

    for (let round = 0; round < maxAxisQuestions; round += 1) {
        for (const axisQuestions of byAxis) {
            const question = axisQuestions[round];
            if (question) ordered.push(question);
        }
    }

    return ordered;
});

const currentQuestion = computed(() => orderedQuestions.value[currentIndex.value]);
const currentAxis = computed(() =>
    store.axes.find((axis) => axis.code === currentQuestion.value?.axisCode),
);
const currentAnswer = computed(() =>
    currentQuestion.value ? store.getAnswer(currentQuestion.value.id) : undefined,
);
const hasCurrentAnswer = computed(() => currentAnswer.value !== undefined);
const isLastQuestion = computed(
    () => currentIndex.value + 1 >= orderedQuestions.value.length,
);
const progressTotal = computed(() =>
    currentIndex.value < roughCheckpoint
        ? roughCheckpoint
        : currentIndex.value < standardCheckpoint
            ? standardCheckpoint
            : orderedQuestions.value.length,
);
const progress = computed(() =>
    orderedQuestions.value.length
        ? Math.min(100, Math.round(((currentIndex.value + 1) / progressTotal.value) * 100))
        : 0,
);
const answeredCount = computed(() => store.answers.filter((answer) => answer.value !== null).length);
const checkpointMessage = computed(() =>
    currentIndex.value + 1 === roughCheckpoint
        ? "Máte základní výsledek. Pokračovat?"
        : "Máte solidní výsledek. Chcete ho ještě zpřesnit?",
);
const checkpointText = computed(() =>
    currentIndex.value + 1 === roughCheckpoint
        ? `Po ${roughCheckpoint} otázkách už lze výsledek spočítat, ale pořád je to spíš orientační odhad. Dalších ${standardCheckpoint - roughCheckpoint} otázek výrazně zpřesní jednotlivé osy.`
        : `Po ${standardCheckpoint} otázkách je výsledek už poměrně stabilní. Zbývajících ${orderedQuestions.value.length - standardCheckpoint} otázek slouží k nejpřesnějšímu porovnání se stranami.`,
);

onMounted(async () => {
    await store.load();
    const q = Number.parseInt(route.query.q as string, 10);
    if (q > 0 && q <= orderedQuestions.value.length) currentIndex.value = q - 1;
    isLoading.value = false;
    await setQuestionQuery();
});

function isMainQuestion(questionId: string) {
    return orderedQuestions.value
        .slice(0, roughCheckpoint)
        .some((question) => question.id === questionId);
}

function balanceQuestionDirection(questions: CalculatorQuestion[], axisOrder: number) {
    const byDirection: Record<"reversed" | "normal", CalculatorQuestion[]> = {
        reversed: questions.filter((question) => question.reversed),
        normal: questions.filter((question) => !question.reversed),
    };
    const firstKey: "normal" | "reversed" = axisOrder % 2 === 0 ? "normal" : "reversed";
    const secondKey = firstKey === "normal" ? "reversed" : "normal";
    const ordered: CalculatorQuestion[] = [];
    const maxCount = Math.max(byDirection.reversed.length, byDirection.normal.length);

    for (let index = 0; index < maxCount; index += 1) {
        const first = byDirection[firstKey][index];
        const second = byDirection[secondKey][index];
        if (first) ordered.push(first);
        if (second) ordered.push(second);
    }

    return ordered;
}

function isSelected(value: number | null) {
    return hasCurrentAnswer.value && currentAnswer.value?.value === value;
}

function answer(value: number | null) {
    if (!currentQuestion.value || isSubmitting.value) return;
    if (currentIndex.value === 0) store.reset();
    store.answerQuestion(currentQuestion.value.id, value);
    if ([roughCheckpoint, standardCheckpoint].includes(currentIndex.value + 1)) {
        showCheckpointModal.value = true;
        return;
    }
    void next();
}

async function previous() {
    if (currentIndex.value === 0 || isSubmitting.value) return;
    currentIndex.value -= 1;
    await setQuestionQuery();
}

async function next() {
    if (isSubmitting.value || !hasCurrentAnswer.value) return;
    if (!isLastQuestion.value) {
        currentIndex.value += 1;
        await setQuestionQuery();
        return;
    }
    await finishQuiz();
}

async function decideToContinue(decision: boolean) {
    showCheckpointModal.value = false;
    if (decision) {
        currentIndex.value += 1;
        await setQuestionQuery();
        return;
    }
    await finishQuiz();
}

async function setQuestionQuery() {
    await router.replace({ query: { q: currentIndex.value + 1 } });
}

async function finishQuiz() {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    try {
        await store.submit();
        await router.push({ name: "Compass2026Result" });
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<style scoped>
.progress-bar {
    transition: width 0.5s;
}

.answer {
    opacity: 0.9;
}

.col-al1 {
    background-color: hsl(5, 80%, 60%);
}

.col-al1:hover {
    background-color: hsl(5, 80%, 50%);
}

.col-al2 {
    background-color: hsl(20, 80%, 60%);
}

.col-al2:hover {
    background-color: hsl(20, 80%, 50%);
}

.col-al3 {
    background-color: hsl(80, 80%, 45%);
}

.col-al3:hover {
    background-color: hsl(80, 80%, 40%);
}

.col-al4 {
    background-color: hsl(100, 80%, 45%);
}

.col-al4:hover {
    background-color: hsl(100, 80%, 40%);
}

.col-al0 {
    background-color: hsl(0, 0%, 60%);
}

.col-al0:hover {
    background-color: hsl(0, 0%, 50%);
}
</style>
