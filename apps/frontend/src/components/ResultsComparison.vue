<template>
    <dl class="mt-5 md:p-5 grid grid-cols-1 gap-3 text-left">
        <div
            v-for="result, index in results"
            :key="result.party.id"
            class="py-2.5 px-4 border-4 bg-gray-200 rounded overflow-hidden relative flex flex-row items-center"
        >
            <PartyIcon
                :party-id="result.party.id"
                class="flex flex-shrink-0 w-12 h-12 bg-contain border-2 border-white bg-white rounded-md mr-2.5"
            />
            <span class="flex flex-col">
                <dt class="text-md font-medium text-gray-500 truncate">
                    <span class="hidden sm:block md:hidden lg:block">{{ result.party.name }}</span>
                    <span class="block sm:hidden md:block lg:hidden">{{ result.party.abbreviation }}</span>
                </dt>
                <dd class="mt-0.5 text-2xl font-semibold text-gray-700 grid grid-percentage z-10">
                    <span>
                        {{ result.percentage }} %
                    </span>
                    <span class="flex text-sm text-gray-400 group">
                        <span class="shadow-md text-sm font-medium text-gray-600 z-10 select-none absolute left-1/2 top-1/2 -translate-y-1/2 bg-white rounded py-1 px-2 mr-0.5 transition-all transform -translate-x-1/2 scale-x-0 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                            {{
                                (bigParties.some(party => party === result.party.abbreviation)) ? 'Zaručeně projde do sněmovny' :
                                (smallParties.some(party => party === result.party.abbreviation)) ? 'Malá šance na postup do sněmovny' :
                                'Téměř nulová šance na postup do sněmovny'
                            }}
                        </span>
                        <span class="flex items-end p-1 border bg-gray-100 rounded-sm select-none">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                            {{
                                (bigParties.some(party => party === result.party.abbreviation)) ? '> 99' :
                                (smallParties.some(party => party === result.party.abbreviation)) ? '&lt; 50' :
                                '&lt; 1'
                            }}
                        </span>
                    </span>
                </dd>
            </span>
            <span
                v-if="!index"
                class="h-10 w-10 block absolute right-4 top-1/2 transform -translate-y-1/2"
                :style="{backgroundImage: `url(${locationMarker})`}"
            />
        </div>
    </dl>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import locationMarker from '../assets/locationMarker.svg';
import { useRouter } from "vue-router";
import useQuizStore from "@/store";
import { IPartyWithOrientation, bigParties, smallParties } from "@/api";
import PartyIcon from "./PartyIcon.vue";

const router = useRouter();
const store = useQuizStore();

const props = defineProps({
    parties: {
        type: Array as PropType<IPartyWithOrientation[]>,
        required: true,
    }
});
const results = ref([] as { party: IPartyWithOrientation, percentage: number }[]);
(() => {
    if (!store.quizCompleted) {
        router.push({ name: 'Test' });
    }
    props.parties.forEach((party) => {
        const percentage = getPartyAgreePercentage(party.Answers, store.answers);
        results.value.push({party, percentage});
    });
    results.value.sort((a, b) => b.percentage - a.percentage);
}
)();
</script>

<style scoped>
.grid-percentage {
    grid-template-columns: 7rem auto;
}
</style>
