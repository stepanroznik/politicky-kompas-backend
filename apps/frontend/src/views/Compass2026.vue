<template>
  <section class="mx-auto max-w-3xl text-left">
    <loading v-if="isLoading" />
    <div
      v-else-if="currentQuestion"
      class="flex flex-col gap-6"
    >
      <div class="flex items-center justify-between text-sm text-gray-600">
        <span>{{ currentIndex + 1 }} / {{ store.questions.length }}</span>
        <span>{{ currentAxis?.name }}</span>
      </div>
      <div class="h-2 overflow-hidden bg-gray-200">
        <div
          class="h-full bg-gray-900 transition-all"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <h1 class="text-2xl font-semibold leading-snug text-gray-950">
        {{ currentQuestion.text }}
      </h1>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          v-for="option in answerOptions"
          :key="option.label"
          class="border border-gray-400 px-4 py-3 text-left font-semibold transition hover:border-gray-900 disabled:opacity-60"
          :class="selectedValue === option.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'"
          type="button"
          :disabled="isSubmitting"
          @click="answer(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="flex items-center justify-between">
        <button
          class="border border-gray-400 px-4 py-2 text-sm transition hover:border-gray-900 disabled:opacity-40"
          type="button"
          :disabled="currentIndex === 0 || isSubmitting"
          @click="previous"
        >
          Předchozí
        </button>
        <button
          class="bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
          type="button"
          :disabled="!currentAnswer || isSubmitting"
          @click="next"
        >
          {{ isLastQuestion ? "Zobrazit výsledek" : "Další" }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Loading from "@frontend/components/Loading.vue";
import { useCalculator2026Store } from "@frontend/stores/calculator2026";

const router = useRouter();
const store = useCalculator2026Store();
const currentIndex = ref(0);
const isLoading = ref(true);
const isSubmitting = ref(false);

const answerOptions = [
    { label: "Rozhodně nesouhlasím", value: 1 },
    { label: "Spíše nesouhlasím", value: 2 },
    { label: "Spíše souhlasím", value: 3 },
    { label: "Rozhodně souhlasím", value: 4 },
    { label: "Nevím / přeskočit", value: null },
] as const;

const currentQuestion = computed(() => store.questions[currentIndex.value]);
const currentAxis = computed(() =>
    store.axes.find((axis) => axis.code === currentQuestion.value?.axisCode),
);
const currentAnswer = computed(() =>
    currentQuestion.value ? store.getAnswer(currentQuestion.value.id) : undefined,
);
const selectedValue = computed(() => currentAnswer.value?.value);
const isLastQuestion = computed(
    () => currentIndex.value + 1 >= store.questions.length,
);
const progress = computed(() =>
    store.questions.length
        ? Math.round(((currentIndex.value + 1) / store.questions.length) * 100)
        : 0,
);

onMounted(async () => {
    await store.load();
    isLoading.value = false;
});

function answer(value: number | null) {
    if (!currentQuestion.value) return;
    store.answerQuestion(currentQuestion.value.id, value);
}

function previous() {
    if (currentIndex.value > 0) currentIndex.value -= 1;
}

async function next() {
    if (!isLastQuestion.value) {
        currentIndex.value += 1;
        return;
    }
    isSubmitting.value = true;
    try {
        await store.submit();
        await router.push({ name: "Compass2026Result" });
    } finally {
        isSubmitting.value = false;
    }
}
</script>
