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
          v-if="hasResult"
          class="border border-gray-900 px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
          type="button"
          @click="$router.push('/kompas/vysledek')"
        >
          Zobrazit můj výsledek
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
      v-if="hasPartyProfiles"
      class="w-full self-center overflow-visible"
      :axes="store.axes"
      :user-axis-scores="[]"
      :matches="partyProfiles"
      :show-user="false"
      size="compact"
    />
    <div
      v-else
      class="flex min-h-[24rem] items-center justify-center self-center border border-gray-200 bg-white text-sm text-gray-500 lg:min-h-[30rem]"
    >
      Načítání mapy stran...
    </div>
  </section>

  <section
    v-if="hasPartyProfiles"
    class="mx-auto mt-8 max-w-6xl text-left"
  >
    <div class="mb-4 flex flex-col gap-1">
      <h2 class="text-2xl font-semibold text-gray-950">
        Strany na dvourozměrných kompasech
      </h2>
      <p class="max-w-3xl text-sm text-gray-600">
        Stejné stranické odpovědi jsou rozdělené do čtyř přehlednějších kompasů podle dvojic os.
      </p>
    </div>
    <multi-axis-compass-2-d
      :axes="store.axes"
      :user-axis-scores="[]"
      :matches="partyProfiles"
      :show-user="false"
      :show-match-percentages="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { apiGet } from "@frontend/api";
import MultiAxisCompass2D from "@frontend/components/MultiAxisCompass2D.vue";
import MultiAxisCompass3D from "@frontend/components/MultiAxisCompass3D.vue";
import { PartyMatch, useCalculator2026Store } from "@frontend/stores/calculator2026";
import { buildPartyProfiles, QuestionWithRatings } from "@frontend/utils/partyProfiles";

const store = useCalculator2026Store();
const partyProfiles = ref<PartyMatch[]>([]);

const hasResult = computed(() => Boolean(store.result));
const hasPartyProfiles = computed(() => store.axes.length > 0 && partyProfiles.value.length > 0);

onMounted(async () => {
    try {
        await store.load();
        const response = await apiGet({ url: `calculators/${store.slug}/party-answers` });
        partyProfiles.value = buildPartyProfiles(
            store.axes,
            response.parties ?? [],
            (response.questions ?? []) as QuestionWithRatings[],
        );
    } catch (error) {
        console.error(error);
    }
});
</script>
