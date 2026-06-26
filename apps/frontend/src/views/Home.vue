<template>
  <section class="mx-auto grid max-w-6xl grid-cols-1 gap-8 text-left lg:grid-cols-[1.1fr_0.9fr]">
    <div class="flex flex-col justify-center gap-6">
      <div class="flex flex-col gap-3">
        <h1 class="text-4xl font-semibold leading-tight text-gray-950 sm:text-5xl">
          Politický kompas 2026
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
          Spustit nový kompas
        </button>
        <button
          class="border border-gray-400 px-6 py-3 font-semibold text-gray-900 transition hover:border-gray-900"
          type="button"
          @click="$router.push('/2021')"
        >
          Původní kalkulačka 2021
        </button>
      </div>
    </div>
    <multi-axis-compass-3-d
      class="min-h-[22rem]"
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
        partyCode: "A",
        partyName: "Ukázka A",
        percentage: 78,
        answeredCount: 120,
        axisScores: previewUserScores.map((score) => ({
            ...score,
            value: Math.max(-1, Math.min(1, score.value + 0.12)),
        })),
    },
    {
        partyCode: "B",
        partyName: "Ukázka B",
        percentage: 71,
        answeredCount: 120,
        axisScores: previewUserScores.map((score) => ({
            ...score,
            value: Math.max(-1, Math.min(1, score.value - 0.18)),
        })),
    },
];
</script>
