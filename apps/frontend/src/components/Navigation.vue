<template>
  <nav class="relative flex flex-wrap items-center justify-between px-2 py-1">
    <div
      class="container mx-auto flex flex-wrap items-center justify-between max-w-7xl border-b border-gray-400"
    >
      <div
        class="w-full relative flex justify-between md:w-auto md:static md:block md:justify-start px-4"
      >
        <router-link
          :to="homeLink"
          class="text-lg font-semibold leading-relaxed mr-4 py-2 whitespace-nowrap text-black flex items-center"
        >
          <img
            :src="icon"
            class="h-7 w-7 mr-1 inline"
          >
          Politický kompas
        </router-link>
        <button
          class="text-lg font-semibold text-black leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block md:hidden outline-none focus:outline-none"
          type="button"
          @click="toggleNavbar()"
        >
          <Bars3Icon class="h-5 w-5" />
        </button>
      </div>
      <div
        :class="{ hidden: !showMenu, flex: showMenu }"
        class="md:flex md:flex-grow items-center"
      >
        <router-links />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Bars3Icon } from '@heroicons/vue/24/outline';
import RouterLinks from './RouterLinks.vue';
import icon from '../assets/icon.png';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const showMenu = ref(false);
const route = useRoute();
const legacyAliases = ['/test', '/result', '/answers', '/about'];

const homeLink = computed(() =>
    route.path.startsWith('/2021') || legacyAliases.includes(route.path) ? '/2021' : '/'
);

const toggleNavbar = () => {
    showMenu.value = !showMenu.value;
};
</script>
