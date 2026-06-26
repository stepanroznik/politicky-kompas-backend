<template>
  <section
    v-if="result"
    class="mx-auto flex max-w-6xl flex-col gap-8 text-left"
  >
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-semibold text-gray-950">
        Váš politický profil
      </h1>
      <p class="text-gray-600">
        Výsledek je spočítaný z {{ result.answeredCount }} odpovědí. Shoda se stranami ignoruje přeskočené otázky a chybějící stranické odpovědi.
      </p>
    </div>

    <multi-axis-compass-3-d
      :axes="store.axes"
      :user-axis-scores="result.userAxisScores"
      :matches="result.matches"
    />

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem]">
      <div class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">
          Osy
        </h2>
        <div
          v-for="axis in sortedAxes"
          :key="axis.code"
          class="flex flex-col gap-1"
        >
          <div class="flex justify-between gap-3 text-sm">
            <span class="font-semibold">{{ axis.name }}</span>
            <span>{{ formatScore(axisValue(axis.code)) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200">
            <div class="absolute left-1/2 top-0 h-3 w-px bg-gray-500" />
            <div
              class="absolute top-0 h-3 bg-gray-900"
              :style="barStyle(axisValue(axis.code))"
            />
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>{{ axis.negativeLabel }}</span>
            <span>{{ axis.positiveLabel }}</span>
          </div>
        </div>
      </div>

      <aside class="flex flex-col gap-3">
        <h2 class="text-xl font-semibold">
          Shoda se stranami
        </h2>
        <div
          v-for="match in result.matches"
          :key="match.partyCode"
          class="border border-gray-300 bg-white p-3"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="font-semibold">{{ match.partyName }}</span>
            <span class="text-lg font-semibold">{{ match.percentage }} %</span>
          </div>
          <div class="mt-2 h-2 bg-gray-200">
            <div
              class="h-2 bg-gray-900"
              :style="{ width: `${match.percentage}%` }"
            />
          </div>
          <p class="mt-1 text-xs text-gray-500">
            Porovnáno {{ match.answeredCount }} odpovědí.
          </p>
        </div>
      </aside>
    </div>
  </section>
  <loading v-else-if="isLoading" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Loading from "@frontend/components/Loading.vue";
import MultiAxisCompass3D from "@frontend/components/MultiAxisCompass3D.vue";
import { useCalculator2026Store } from "@frontend/stores/calculator2026";

const router = useRouter();
const store = useCalculator2026Store();
const isLoading = ref(true);
const result = computed(() => store.result);
const sortedAxes = computed(() => [...store.axes].sort((a, b) => a.order - b.order));

onMounted(async () => {
    await store.load();
    isLoading.value = false;
    if (!store.result) {
        await router.push({ name: "Compass2026" });
    }
});

function axisValue(axisCode: string) {
    return result.value?.userAxisScores.find((score) => score.axisCode === axisCode)?.value ?? 0;
}

function formatScore(value: number) {
    return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}

function barStyle(value: number) {
    const width = Math.abs(value) * 50;
    if (value >= 0) {
        return { left: "50%", width: `${width}%` };
    }
    return { left: `${50 - width}%`, width: `${width}%` };
}
</script>
