<template>
    <navigation />
    <div class="text-center max-w-5xl m-auto mt-6 sm:mt-12 px-2">
        <router-view v-if="parties.length" />
        <loading v-else />
    </div>
    <img
        class="sr-only"
        alt="main page politicky-kompas politicky kompas"
        :src="compass"
    >
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PartyModel } from './api';
import compass from './assets/compass.png';
import Loading from './components/Loading.vue';
import Navigation from './components/Navigation.vue';
import { useQuizStore } from './store';

const store = useQuizStore();

const parties = computed(() => store.parties);

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
