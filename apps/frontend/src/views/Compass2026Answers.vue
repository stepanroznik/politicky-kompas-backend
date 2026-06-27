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
                  <button
                    v-if="hasEvidenceDetail(ratingFor(question, party.code))"
                    type="button"
                    class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-gray-500 transition hover:border-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    :aria-label="`Zobrazit zdroj odpovědi strany ${party.name}`"
                    @click="openEvidence(question, party, ratingFor(question, party.code))"
                  >
                    ℹ
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div
        v-if="selectedEvidence"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-dialog-title"
      >
        <button
          type="button"
          class="absolute inset-0 bg-gray-950/45"
          aria-label="Zavřít detail zdroje"
          @click="closeEvidence"
        />
        <section class="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-gray-300 bg-white p-5 shadow-xl">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {{ selectedEvidence.party.name }}
              </p>
              <h2
                id="evidence-dialog-title"
                class="mt-1 text-2xl font-semibold text-gray-950"
              >
                Zdroj odpovědi
              </h2>
            </div>
            <button
              type="button"
              class="border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:border-gray-500 hover:text-gray-950"
              @click="closeEvidence"
            >
              Zavřít
            </button>
          </div>

          <div class="mt-5 space-y-4 text-sm text-gray-800">
            <div>
              <p class="font-semibold text-gray-950">
                Otázka
              </p>
              <p class="mt-1 leading-relaxed">
                {{ selectedEvidence.question.text }}
              </p>
            </div>

            <dl class="grid gap-3 border-y border-gray-200 py-4 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Odpověď
                </dt>
                <dd class="mt-1 font-semibold text-gray-950">
                  {{ answerLabel(selectedEvidence.rating.rating) }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Doložení
                </dt>
                <dd class="mt-1 font-semibold text-gray-950">
                  {{ fullStatusLabel(selectedEvidence.rating.evidenceStatus) }}
                </dd>
              </div>
            </dl>

            <div v-if="selectedEvidence.rating.evidenceTitle">
              <p class="font-semibold text-gray-950">
                Název zdroje
              </p>
              <p class="mt-1">
                {{ selectedEvidence.rating.evidenceTitle }}
              </p>
            </div>

            <div v-if="selectedEvidence.rating.evidenceNote">
              <p class="font-semibold text-gray-950">
                Poznámka
              </p>
              <p class="mt-1 whitespace-pre-line leading-relaxed">
                {{ selectedEvidence.rating.evidenceNote }}
              </p>
            </div>

            <a
              v-if="selectedEvidence.rating.evidenceUrl"
              :href="selectedEvidence.rating.evidenceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex border border-gray-950 bg-gray-950 px-4 py-2 font-semibold text-white transition hover:bg-white hover:text-gray-950"
            >
              Otevřít zdroj
            </a>
            <p
              v-else
              class="text-gray-600"
            >
              U této odpovědi zatím není veřejný odkaz. Je označená jako odhad nebo čeká na lepší doložení.
            </p>
          </div>
        </section>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Loading from "@frontend/components/Loading.vue";
import { apiGet } from "@frontend/api";
import { CalculatorParty, CalculatorQuestion, useCalculator2026Store } from "@frontend/stores/calculator2026";

interface PartyRating {
    questionId: string;
    partyCode: string;
    rating: number | null;
    evidenceStatus: string;
    evidenceUrl?: string | null;
    evidenceTitle?: string | null;
    evidenceNote?: string | null;
}

interface QuestionWithRatings extends CalculatorQuestion {
    ratings: PartyRating[];
}

interface EvidenceSelection {
    question: QuestionWithRatings;
    party: CalculatorParty;
    rating: PartyRating;
}

const store = useCalculator2026Store();
const isLoading = ref(true);
const parties = ref<CalculatorParty[]>([]);
const questions = ref<QuestionWithRatings[]>([]);
const selectedEvidence = ref<EvidenceSelection | null>(null);
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
    if (status === "assumption" || status.includes("assumed")) return "odhad";
    if (status === "official_program_direct") return "program";
    if (status === "official_program_inference") return "program";
    if (status === "official_position_direct") return "postoj";
    if (status === "official_position_inference") return "postoj";
    if (status.includes("weak")) return "slabší zdroj";
    if (status.includes("review")) return "ke kontrole";
    if (status.includes("missing")) return "nedoloženo";
    return "";
}

function fullStatusLabel(status?: string) {
    if (!status) return "Není uvedeno";
    return {
        assumption: "Odhad bez veřejného zdroje",
        official_program_direct: "Přímý oficiální programový zdroj",
        official_program_inference: "Nepřímý oficiální programový zdroj",
        official_position_direct: "Přímý oficiální postoj",
        official_position_inference: "Nepřímý oficiální postoj",
        needs_review: "Ke kontrole",
        missing: "Nedoloženo",
    }[status] ?? (statusLabel(status) || status);
}

function isUncertainEvidence(status?: string) {
    if (!status) return false;
    return status === "assumption"
        || status.includes("assumed")
        || status.includes("weak")
        || status.includes("review")
        || status.includes("missing");
}

function hasEvidenceDetail(rating?: PartyRating) {
    return Boolean(
        rating?.evidenceTitle
        || rating?.evidenceNote
        || rating?.evidenceUrl
        || rating?.evidenceStatus,
    );
}

function openEvidence(
    question: QuestionWithRatings,
    party: CalculatorParty,
    rating?: PartyRating,
) {
    if (!rating) return;
    selectedEvidence.value = { question, party, rating };
}

function closeEvidence() {
    selectedEvidence.value = null;
}

function answerClass(rating?: PartyRating) {
    if (!rating?.rating) return "border-gray-200 bg-gray-50 text-gray-500";
    const base = {
        1: "border-red-200 bg-red-50 text-red-900",
        2: "border-orange-200 bg-orange-50 text-orange-900",
        3: "border-lime-200 bg-lime-50 text-lime-900",
        4: "border-green-200 bg-green-50 text-green-900",
    }[rating.rating] ?? "border-gray-200 bg-gray-50 text-gray-500";
    return isUncertainEvidence(rating.evidenceStatus) ? `${base} ring-1 ring-gray-400` : base;
}
</script>
