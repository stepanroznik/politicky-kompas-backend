<template>
    <div class="grid grid-main gap-12">
        <div
            class="order-2 md:order-1"
        >
            <compass :parties="parties" />
        </div>
        <div class="text-left pl-4 flex flex-col gap-7 order-1 md:order-2">
            <p class="text-xl ">
                Politický kompas od Politica.cz je jedna z nejkratších a nejjednodušších politických kalkulaček sněmovních voleb 2021.
            </p>
            <p class="text-lg ">
                Po vyplnění krátkého testu vám aplikace spočítá procentuální shodu s názory jednotlivých stran a taky vaše umístění na politickém kompase.
            </p>
            <div class="flex flex-col items-start pt-0.5">
                <button
                    class="block border-solid w-3/4 xs:w-1/2 sm:w-1/2 active:outline-none bg-gray-800 hover:bg-black text-white font-semibold uppercase text-ms px-6 py-3 rounded mb-1 ease-linear transition-all duration-150"
                    type="button"
                    @click="$router.push('/test')"
                >
                    Spustit test
                </button>
                <span
                    v-if="quizCompleted"
                    class="text-sm text-gray-600"
                >
                    Test jste již dříve vyplnili.
                    <a
                        href="#"
                        class="border-b border-gray-800"
                        @click.prevent="$router.push('/result')"
                    >
                        Zobrazit výsledek</a>?
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Compass from '../components/Compass.vue';
import useQuizStore from '@/store';

const store = useQuizStore();

const parties = computed(() => store.parties);

const quizCompleted = computed(() => store.quizCompleted);
</script>

<style scoped>
.grid-main {
        grid-template-columns: none
    }
@media (min-width: 768px) {
    .grid-main {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
