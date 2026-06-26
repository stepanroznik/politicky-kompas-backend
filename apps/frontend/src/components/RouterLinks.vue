<template>
  <ul class="flex flex-col md:flex-row list-none ml-auto">
    <li
      v-for="link in links"
      :key="link.name"
      class="nav-item"
    >
      <router-link
        :to="link.url"
        class="px-3 py-1 flex items-center text-base font-normal text-black border border-transparent rounded hover:border-gray-400 transition-all"
        @click="checkIfCanEnterAnswers(link.url)"
      >
        <span :class="isActive(link.url) ? 'border-b border-gray-400' : ''">
          {{ link.name }} 
          <template v-if="link.url.endsWith('/answers')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 inline mb-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="store.quizCompleted"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </template>
        </span>
      </router-link>
    </li>
  </ul>
  <modal
    :show="showCompleteQuizMessage"
    message="Nenechte se ovlivnit názory druhých"
    text="Před zobrazením odpovědí jednotlivých politických stran si prosím vyplňte test podle svých skutečných názorů."
    @close="showCompleteQuizMessage = false"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import Modal from './Modal.vue';
import useQuizStore from '@frontend/store';

const store = useQuizStore();
const route = useRoute();

const showCompleteQuizMessage = ref(false);

const mainLinks = [
    { name: 'Domů', url: '/' },
    { name: 'Kompas 2026', url: '/kompas' },
] as const;

const legacyLinks = [
    { name: 'Úvod 2021', url: '/2021' },
    { name: 'Test 2021', url: '/2021/test' },
    { name: 'Odpovědi stran', url: '/2021/answers' },
    { name: 'O kalkulačce', url: '/2021/about' },
    { name: 'Nový kompas 2026', url: '/' },
] as const;

const legacyAliases = ['/test', '/result', '/answers', '/about'];

const isLegacyRoute = computed(() =>
    route.path.startsWith('/2021') || legacyAliases.includes(route.path)
);
const links = computed(() => (isLegacyRoute.value ? legacyLinks : mainLinks));

const isActive = (url: string) =>
    route.path === url || (url === '/2021' && legacyAliases.includes(route.path));

const checkIfCanEnterAnswers = (url: string) => {
    if (url.endsWith('/answers') === false) return;
    if (store.quizCompleted === false) {
        showCompleteQuizMessage.value = true;
    }
};
</script>
