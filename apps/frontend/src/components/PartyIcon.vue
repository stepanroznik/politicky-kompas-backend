<template> 
    <span :style="{ backgroundImage: `url(${iconUrl})` }">
        <slot />
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    partyId: {
        type: String,
        required: true,
    }
});

const iconUrl = computed(() => {
    const iconPath = `/src/assets/parties/${props.partyId}.png`;
    const modules = import.meta.glob("/src/assets/**", { eager: true });
    const mod = modules[iconPath] as { default: string };
    return mod.default;
});
</script>