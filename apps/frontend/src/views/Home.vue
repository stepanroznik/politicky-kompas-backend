<template>
  <section class="mx-auto grid max-w-6xl grid-cols-1 gap-8 overflow-visible text-left lg:grid-cols-[1fr_0.95fr]">
    <div class="flex min-h-[30rem] max-w-2xl flex-col justify-center gap-6 py-10 pr-0 lg:pr-6">
      <div class="flex flex-col gap-3">
        <h1 class="text-4xl font-semibold leading-tight text-gray-950 sm:text-5xl">
          Politický kompas
        </h1>
        <p class="max-w-2xl text-lg text-gray-700">
          Víceosá politická kalkulačka porovnává vaše odpovědi se stranami v bezpečnosti, ekonomice, kultuře, institucích i osobních svobodách.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          class="bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-black"
          type="button"
          @click="$router.push('/kompas')"
        >
          Spustit test
        </button>
        <button
          class="border border-gray-400 px-6 py-3 font-semibold text-gray-900 transition hover:border-gray-900"
          type="button"
          @click="$router.push('/kompasy')"
        >
          Další kalkulačky
        </button>
      </div>
      <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
        <router-link
          class="border-b border-gray-400 hover:border-gray-900"
          to="/odpovedi-stran"
        >
          Odpovědi stran
        </router-link>
        <router-link
          class="border-b border-gray-400 hover:border-gray-900"
          to="/o-kalkulacce"
        >
          O kalkulačce
        </router-link>
      </div>
    </div>
    <multi-axis-compass-3-d
      class="min-h-[24rem] w-full self-center overflow-visible lg:min-h-[32rem]"
      :axes="previewAxes"
      :user-axis-scores="previewUserScores"
      :matches="previewMatches"
    />
  </section>
</template>

<script setup lang="ts">
import MultiAxisCompass3D from "@frontend/components/MultiAxisCompass3D.vue";
import { AxisScore, CalculatorAxis, PartyMatch } from "@frontend/stores/calculator2026";

const previewAxes: CalculatorAxis[] = [
    {
        code: "geopolitics_nato",
        name: "NATO",
        negativeLabel: "Neutralita",
        positiveLabel: "Spojenci",
        order: 1,
    },
    {
        code: "geopolitics_eu",
        name: "EU",
        negativeLabel: "Suverenita",
        positiveLabel: "Integrace",
        order: 2,
    },
    {
        code: "economy_state",
        name: "Stát",
        negativeLabel: "Menší stát",
        positiveLabel: "Silnější stát",
        order: 3,
    },
    {
        code: "economy_market",
        name: "Trh",
        negativeLabel: "Regulace",
        positiveLabel: "Volný trh",
        order: 4,
    },
    {
        code: "culture_morality",
        name: "Morálka",
        negativeLabel: "Konzervativní",
        positiveLabel: "Liberální",
        order: 5,
    },
    {
        code: "culture_identity",
        name: "Identita",
        negativeLabel: "Národní",
        positiveLabel: "Otevřená",
        order: 6,
    },
    {
        code: "institutions",
        name: "Instituce",
        negativeLabel: "Přímá kontrola",
        positiveLabel: "Brzdy",
        order: 7,
    },
    {
        code: "authority_freedom",
        name: "Svobody",
        negativeLabel: "Autorita",
        positiveLabel: "Svoboda",
        order: 8,
    },
];

const previewUserScores: AxisScore[] = [
    { axisCode: "geopolitics_nato", value: 0.55, answeredCount: 12 },
    { axisCode: "geopolitics_eu", value: 0.34, answeredCount: 12 },
    { axisCode: "economy_state", value: -0.18, answeredCount: 12 },
    { axisCode: "economy_market", value: 0.42, answeredCount: 12 },
    { axisCode: "culture_morality", value: 0.24, answeredCount: 12 },
    { axisCode: "culture_identity", value: 0.38, answeredCount: 12 },
    { axisCode: "institutions", value: 0.62, answeredCount: 12 },
    { axisCode: "authority_freedom", value: 0.18, answeredCount: 12 },
];

const previewMatches: PartyMatch[] = [
    {
        partyCode: "ANO",
        partyName: "ANO 2011",
        percentage: 78,
        answeredCount: 120,
        axisScores: previewUserScores.map((score) => ({
            ...score,
            value: Math.max(-1, Math.min(1, score.value + 0.12)),
        })),
    },
    {
        partyCode: "SPOLU",
        partyName: "SPOLU",
        percentage: 71,
        answeredCount: 120,
        axisScores: previewUserScores.map((score) => ({
            ...score,
            value: Math.max(-1, Math.min(1, score.value - 0.18)),
        })),
    },
    {
        partyCode: "STAN",
        partyName: "STAN",
        percentage: 68,
        answeredCount: 120,
        axisScores: previewUserScores.map((score, index) => ({
            ...score,
            value: Math.max(-1, Math.min(1, score.value + (index % 2 === 0 ? -0.28 : 0.08))),
        })),
    },
    {
        partyCode: "PIRATI",
        partyName: "Piráti",
        percentage: 64,
        answeredCount: 120,
        axisScores: previewUserScores.map((score, index) => ({
            ...score,
            value: Math.max(-1, Math.min(1, score.value + (index % 3 === 0 ? 0.2 : -0.08))),
        })),
    },
    {
        partyCode: "SPD",
        partyName: "SPD",
        percentage: 61,
        answeredCount: 120,
        axisScores: previewUserScores.map((score, index) => ({
            ...score,
            value: Math.max(-1, Math.min(1, score.value + (index % 2 === 0 ? -0.42 : -0.12))),
        })),
    },
    {
        partyCode: "MOTORISTE",
        partyName: "Motoristé",
        percentage: 58,
        answeredCount: 120,
        axisScores: previewUserScores.map((score, index) => ({
            ...score,
            value: Math.max(-1, Math.min(1, score.value + (index % 2 === 0 ? 0.05 : -0.34))),
        })),
    },
    {
        partyCode: "STACILO",
        partyName: "Stačilo!",
        percentage: 54,
        answeredCount: 120,
        axisScores: previewUserScores.map((score, index) => ({
            ...score,
            value: Math.max(-1, Math.min(1, score.value + (index % 2 === 0 ? -0.36 : 0.24))),
        })),
    },
];
</script>
