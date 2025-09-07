<template>
    <div class="grid md:grid-cols-2 gap-8 md:gap-4">
        <div class="flex flex-col md:grid grid-rows-2 gap-12">
            <div class="">
                <h3 class="text-lg leading-6 font-medium text-gray-900 pb-10">
                    Podle umístění na kompase:
                </h3>
                <compass :parties="parties" />
            </div>
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900 pb-4">
                    Podle směřování na západ/východ (experimentální):
                </h3>
                <geo-orientation :parties="parties" />
            </div>
        </div>
        <div class="pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
                Podle procentuální shody:
            </h3>
            <comparison :parties="parties" />
            <router-link
                to="/answers"
                class="underline my-2"
            >
                Zobrazit odpovědi politických stran
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import Compass from "@/components/Compass.vue";
import GeoOrientation from "@/components/GeoOrientation.vue";
import Comparison from "@/components/ResultsComparison.vue";
import useQuizStore from "@/store";
import { computed } from "vue";
import { useRouter } from "vue-router";

const store = useQuizStore();
const router = useRouter();

const parties = computed(() => store.parties);

if (!store.quizCompleted) {
    router.push({ name: 'Test' });
}
</script>
