<template>
    <div
        v-if="questions.length"
        class="max-w-5xl"
    >
        <QuizContent :questions="questions" />
    </div>
    <loading v-else />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import QuizContent from '../components/QuizContent.vue';
import { apiGet } from "@/api";
import Loading from '@/components/Loading.vue';

const questions = ref([]);

(async () => {
    questions.value = await apiGet({ url: "questions" });
})();
</script>
