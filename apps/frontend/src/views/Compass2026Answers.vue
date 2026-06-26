<template>
  <section class="mx-auto max-w-7xl text-left">
    <loading v-if="isLoading" />
    <template v-else>
      <div class="mb-6">
        <h1 class="text-3xl font-semibold text-gray-950">
          Odpovědi stran
        </h1>
        <p class="mt-2 max-w-3xl text-gray-600">
          Přehled ukazuje stranické odpovědi použité v aktuální kalkulačce. Odhadnuté a slabě doložené odpovědi jsou označené, aby bylo jasné, kde je potřeba další kontrola.
        </p>
      </div>

      <div class="overflow-x-auto border border-gray-300 bg-white">
        <table class="min-w-full border-collapse text-sm">
          <thead class="bg-gray-100 text-left">
            <tr>
              <th class="sticky left-0 z-10 min-w-80 border-b border-gray-300 bg-gray-100 p-3">
                Otázka
              </th>
              <th
                v-for="party in parties"
                :key="party.code"
                class="min-w-32 border-b border-gray-300 p-3 text-center"
              >
                {{ party.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="group in groupedQuestions"
              :key="group.axis.code"
            >
              <tr>
                <td
                  class="sticky left-0 z-10 border-y border-gray-300 bg-gray-50 p-3 font-semibold text-gray-900"
                  :colspan="parties.length + 1"
                >
                  {{ group.axis.name }}
                </td>
              </tr>
              <tr
                v-for="question in group.questions"
                :key="question.id"
                class="align-top"
              >
                <td class="sticky left-0 z-10 max-w-xl border-b border-gray-200 bg-white p-3">
                  <p class="font-medium text-gray-950">
                    {{ question.text }}
                  </p>
                  <p
                    v-if="question.reviewStatus !== 'original'"
                    class="mt-1 text-xs text-gray-500"
                  >
                    Upravené znění otázky, původní formulace je zachovaná v datech.
                  </p>
                </td>
                <td
                  v-for="party in parties"
                  :key="party.code"
                  class="border-b border-gray-200 p-2 text-center"
                >
                  <div
                    class="mx-auto flex min-h-16 max-w-36 flex-col items-center justify-center gap-1 border px-2 py-2"
                    :class="answerClass(ratingFor(question, party.code))"
                  >
                    <span class="font-semibold">
                      {{ answerLabel(ratingFor(question, party.code)?.rating) }}
                    </span>
                    <span
                      v-if="statusLabel(ratingFor(question, party.code)?.evidenceStatus)"
                      class="text-[0.65rem] uppercase tracking-wide text-gray-600"
                    >
                      {{ statusLabel(ratingFor(question, party.code)?.evidenceStatus) }}
                    </span>
                  </div>
                  <p
                    v-if="ratingFor(question, party.code)?.evidenceNote"
                    class="mt-1 line-clamp-3 text-left text-xs text-gray-500"
                  >
                    {{ ratingFor(question, party.code)?.evidenceNote }}
                  </p>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Loading from "@frontend/components/Loading.vue";
import { apiGet } from "@frontend/api";
import { CalculatorAxis, CalculatorParty, CalculatorQuestion, useCalculator2026Store } from "@frontend/stores/calculator2026";

interface PartyRating {
    questionId: string;
    partyCode: string;
    rating: number | null;
    evidenceStatus: string;
    evidenceNote?: string | null;
}

interface QuestionWithRatings extends CalculatorQuestion {
    ratings: PartyRating[];
}

const store = useCalculator2026Store();
const isLoading = ref(true);
const parties = ref<CalculatorParty[]>([]);
const questions = ref<QuestionWithRatings[]>([]);
const electionOrder2025 = ["ANO", "SPOLU", "STAN", "PIRATI", "SPD", "MOTORISTE", "STACILO"];

const groupedQuestions = computed(() =>
    [...store.axes]
        .sort((a, b) => a.order - b.order)
        .map((axis) => ({
            axis,
            questions: questions.value.filter((question) => question.axisCode === axis.code),
        }))
        .filter((group) => group.questions.length),
);

onMounted(async () => {
    await store.load();
    const response = await apiGet({ url: `calculators/${store.slug}/party-answers` });
    parties.value = [...(response.parties ?? [])].sort(
        (a, b) => partyOrder(a.code) - partyOrder(b.code),
    );
    questions.value = response.questions ?? [];
    isLoading.value = false;
});

function ratingFor(question: QuestionWithRatings, partyCode: string) {
    return question.ratings.find((rating) => rating.partyCode === partyCode);
}

function partyOrder(code: string) {
    const index = electionOrder2025.indexOf(code);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function answerLabel(value?: number | null) {
    if (!value) return "Neví / není doloženo";
    return {
        1: "Nesouhlasí",
        2: "Spíše nesouhlasí",
        3: "Spíše souhlasí",
        4: "Souhlasí",
    }[value] ?? "Neví / není doloženo";
}

function statusLabel(status?: string) {
    if (!status) return "";
    if (status.includes("assumed")) return "odhad";
    if (status.includes("weak")) return "slabý zdroj";
    if (status.includes("review")) return "ke kontrole";
    return "";
}

function answerClass(rating?: PartyRating) {
    if (!rating?.rating) return "border-gray-200 bg-gray-50 text-gray-500";
    const base = {
        1: "border-red-200 bg-red-50 text-red-900",
        2: "border-orange-200 bg-orange-50 text-orange-900",
        3: "border-lime-200 bg-lime-50 text-lime-900",
        4: "border-green-200 bg-green-50 text-green-900",
    }[rating.rating] ?? "border-gray-200 bg-gray-50 text-gray-500";
    return statusLabel(rating.evidenceStatus) ? `${base} ring-1 ring-gray-400` : base;
}
</script>
