<template>
  <section class="grid gap-5 md:grid-cols-2">
    <article
      v-for="pair in axisPairs"
      :key="pair.title"
      class="border p-4 shadow-sm"
      :style="{ borderColor: pair.palette.border, backgroundColor: pair.palette.card }"
    >
      <div class="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 class="text-base font-semibold text-gray-950">
            {{ pair.title }}
          </h3>
          <p class="text-xs text-gray-500">
            {{ pair.horizontal.name }} / {{ pair.vertical.name }}
          </p>
        </div>
        <span
          class="rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide"
          :style="{ color: pair.palette.text, backgroundColor: pair.palette.badge }"
        >
          {{ pair.index + 1 }} / {{ axisPairs.length }}
        </span>
      </div>

      <div class="relative px-8 py-7">
        <span class="absolute left-1/2 top-0 -translate-x-1/2 text-center text-xs font-semibold text-gray-700">
          {{ pair.vertical.positiveLabel }}
        </span>
        <span class="absolute bottom-0 left-1/2 -translate-x-1/2 text-center text-xs font-semibold text-gray-700">
          {{ pair.vertical.negativeLabel }}
        </span>
        <span class="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-700 [writing-mode:vertical-rl] rotate-180">
          {{ pair.horizontal.negativeLabel }}
        </span>
        <span class="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-700 [writing-mode:vertical-rl]">
          {{ pair.horizontal.positiveLabel }}
        </span>

        <div
          class="relative aspect-square overflow-visible border-4 bg-white"
          :style="{ borderColor: pair.palette.borderStrong }"
        >
          <div class="grid h-full w-full grid-cols-10 grid-rows-10 border border-white">
            <template
              v-for="cell in cells"
              :key="cell"
            >
              <span
                class="border border-white"
                :style="{ backgroundColor: cellColor(cell, pair.index) }"
              />
            </template>
          </div>
          <div class="absolute left-1/2 top-0 h-full w-px bg-gray-500/60" />
          <div class="absolute left-0 top-1/2 h-px w-full bg-gray-500/60" />

          <span
            v-if="showUser"
            class="absolute z-30 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gray-950 shadow-md ring-2 ring-gray-950"
            :style="markerStyle(pair, userAxisScores)"
            title="Vy"
          />
          <span
            v-for="(match, matchIndex) in visibleMatches"
            :key="match.partyCode"
            class="group absolute z-20 h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 rounded border-2 border-white px-1 text-center text-[0.5rem] font-bold leading-5 text-white shadow-md transition hover:z-40 hover:scale-125"
            :style="partyMarkerStyle(pair, match, matchIndex)"
          >
            {{ partyLabel(match) }}
            <span class="absolute left-1/2 top-full mt-1 hidden min-w-24 -translate-x-1/2 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow group-hover:block">
              {{ match.partyName }}{{ showMatchPercentages ? ` ${match.percentage} %` : "" }}
            </span>
          </span>
        </div>
      </div>

      <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <span
          v-if="showUser"
          class="inline-flex items-center gap-1"
        >
          <span class="h-3 w-3 rounded-full bg-gray-950" /> Vy
        </span>
        <span
          v-for="(match, matchIndex) in visibleMatches"
          :key="match.partyCode"
          class="inline-flex items-center gap-1"
        >
          <party-logo
            :party-code="match.partyCode"
            class="h-5 w-8 rounded-sm border border-gray-200"
          />
          <span
            class="h-3 w-3 rounded-sm"
            :style="{ backgroundColor: colorFor(matchIndex) }"
          />
          {{ match.partyName }}
        </span>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import PartyLogo from "@frontend/components/PartyLogo.vue";
import { AxisScore, CalculatorAxis, PartyMatch } from "@frontend/stores/calculator2026";

const props = defineProps({
    axes: {
        type: Array as PropType<CalculatorAxis[]>,
        required: true,
    },
    userAxisScores: {
        type: Array as PropType<AxisScore[]>,
        required: true,
    },
    matches: {
        type: Array as PropType<PartyMatch[]>,
        required: true,
    },
    showUser: {
        type: Boolean,
        default: true,
    },
    showMatchPercentages: {
        type: Boolean,
        default: true,
    },
});

const partyColors = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#0891b2", "#ea580c", "#4b5563"];
const pairPalettes = [
    {
        card: "#f8fbff",
        badge: "#dbeafe",
        border: "#bfdbfe",
        borderStrong: "#60a5fa",
        text: "#1d4ed8",
        cells: ["#fee2e2", "#fef3c7", "#dbeafe", "#dcfce7"],
    },
    {
        card: "#fffaf5",
        badge: "#ffedd5",
        border: "#fed7aa",
        borderStrong: "#fb923c",
        text: "#c2410c",
        cells: ["#ffe4e6", "#ffedd5", "#e0f2fe", "#dcfce7"],
    },
    {
        card: "#fbfff7",
        badge: "#dcfce7",
        border: "#bbf7d0",
        borderStrong: "#22c55e",
        text: "#15803d",
        cells: ["#fee2e2", "#fef9c3", "#dcfce7", "#d9f99d"],
    },
    {
        card: "#fcfaff",
        badge: "#f3e8ff",
        border: "#e9d5ff",
        borderStrong: "#a855f7",
        text: "#7e22ce",
        cells: ["#fce7f3", "#ede9fe", "#dbeafe", "#dcfce7"],
    },
];
const cells = Array.from({ length: 100 }, (_, index) => index);

const axisPairs = computed(() => {
    const axes = [...props.axes].sort((a, b) => a.order - b.order);
    const titles = ["Zahraniční politika", "Ekonomika", "Společnost", "Instituce a svobody"];
    return [0, 2, 4, 6]
        .map((start, index) => ({
            index,
            title: titles[index] ?? `Kompas ${index + 1}`,
            horizontal: axes[start],
            vertical: axes[start + 1],
            palette: pairPalettes[index],
        }))
        .filter((pair) => pair.horizontal && pair.vertical);
});

const visibleMatches = computed(() => props.matches);

function scoreValue(scores: AxisScore[], axisCode: string) {
    return scores.find((score) => score.axisCode === axisCode)?.value ?? 0;
}

function clamp(value: number) {
    return Math.max(-1, Math.min(1, value));
}

function markerStyle(pair: { horizontal: CalculatorAxis; vertical: CalculatorAxis }, scores: AxisScore[]) {
    const x = ((clamp(scoreValue(scores, pair.horizontal.code)) + 1) / 2) * 100;
    const y = (1 - (clamp(scoreValue(scores, pair.vertical.code)) + 1) / 2) * 100;
    return {
        left: `${x}%`,
        top: `${y}%`,
    };
}

function partyMarkerStyle(pair: { horizontal: CalculatorAxis; vertical: CalculatorAxis }, match: PartyMatch, index: number) {
    return {
        ...markerStyle(pair, match.axisScores),
        backgroundColor: colorFor(index),
        zIndex: `${20 + index}`,
    };
}

function colorFor(index: number) {
    return partyColors[index % partyColors.length];
}

function partyLabel(match: PartyMatch) {
    const labels: Record<string, string> = {
        ANO: "ANO",
        SPOLU: "SP",
        STAN: "ST",
        PIRATI: "PI",
        SPD: "SPD",
        MOTORISTE: "MO",
        STACILO: "STA",
    };
    return labels[match.partyCode] ?? match.partyName.trim().slice(0, 3).toUpperCase();
}

function cellColor(cell: number, pairIndex: number) {
    const x = cell % 10;
    const y = Math.floor(cell / 10);
    const palette = pairPalettes[pairIndex]?.cells ?? pairPalettes[0].cells;
    if (x < 5 && y < 5) return palette[0];
    if (x >= 5 && y < 5) return palette[1];
    if (x < 5 && y >= 5) return palette[2];
    return palette[3];
}
</script>
