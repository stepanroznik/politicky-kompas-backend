<template>
  <span
    class="inline-flex items-center justify-center overflow-hidden bg-white"
    :title="partyCode"
  >
    <img
      v-if="logoUrl"
      class="h-full w-full object-contain"
      :src="logoUrl"
      :alt="partyCode"
      loading="lazy"
    >
    <span
      v-else
      class="text-xs font-semibold text-gray-700"
    >
      {{ fallbackLabel }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import anoLogo from "@frontend/assets/parties/2026/ANO.svg";
import spoluLogo from "@frontend/assets/parties/2026/SPOLU.png";
import stanLogo from "@frontend/assets/parties/2026/STAN.svg";
import piratiLogo from "@frontend/assets/parties/2026/PIRATI.svg";
import spdLogo from "@frontend/assets/parties/2026/SPD.svg";
import motoristeLogo from "@frontend/assets/parties/2026/MOTORISTE.svg";
import staciloLogo from "@frontend/assets/parties/2026/STACILO.svg";

const props = defineProps({
    partyCode: {
        type: String,
        required: true,
    },
});

const logos: Record<string, string> = {
    ANO: anoLogo,
    SPOLU: spoluLogo,
    STAN: stanLogo,
    PIRATI: piratiLogo,
    SPD: spdLogo,
    MOTORISTE: motoristeLogo,
    STACILO: staciloLogo,
};

const logoUrl = computed(() => logos[props.partyCode] ?? "");
const fallbackLabel = computed(() => props.partyCode.slice(0, 3));
</script>
