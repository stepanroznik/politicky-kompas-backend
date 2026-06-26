<template>
  <navigation />
  <div
    v-if="isBetaRoute"
    class="mx-auto mt-4 max-w-5xl border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900"
  >
    <strong class="font-semibold">Beta verze.</strong>
    Tento obecný politický kompas je zatím ve veřejné zkušební verzi. Otázky, odpovědi stran i vizualizace ještě mohou projít úpravami.
  </div>
  <div class="text-center max-w-5xl m-auto mt-6 sm:mt-12 px-2">
    <router-view />
  </div>
  <img
    class="sr-only"
    alt="main page politicky-kompas politicky kompas"
    :src="compass"
  >
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { PartyModel } from './api';
import compass from './assets/compass.png';
import Navigation from './components/Navigation.vue';

const route = useRoute();
const betaPaths = [
    '/obecny-kompas',
    '/kompas',
    '/kompas/vysledek',
    '/odpovedi-stran',
    '/o-kalkulacce',
];
const isBetaRoute = computed(() => betaPaths.includes(route.path));

void PartyModel.fetchLatest();
</script>

<style>
body {
    overflow-y: scroll;
}

.party-name > span {
    max-width: 6rem;
}
.party-name {
    border: 2px solid;
    text-align: center;
    font-weight: 600;
    font-size: 0.55rem;
    width: auto;
    padding: 0.1rem;
    width: 3.9rem;
    top: 110%;
    left: 50%;
    transform: translateX(-50%);
}
</style>
