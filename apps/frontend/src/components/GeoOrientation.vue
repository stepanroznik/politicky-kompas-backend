<template>
    <div class="relative border-4 border-gray-400 rounded">
        <axis-label class="absolute left-0 top-14 z-20 -mt-4 transform lg:-translate-x-1/2">
            Západ
        </axis-label>
        <axis-label class="absolute right-0 top-14 z-20 -mt-4 transform lg:translate-x-1/2">
            Východ
        </axis-label>
        <div class="grid grid-cols-10 w-full h-full border border-white">
            <template
                v-for="x in 10"
                :key="x"
            >
                <span
                    class="border border-white relative w-full h-full equal-height not-hover:scale-110 transform hover:z-10 not-hover:border-2 not-hover:-my-px transition-all"
                    :class="{
                        'square-blue': x <= 5,
                        'square-red': x >= 5,
                    }"
                >
                    <template
                        v-for="(party, index) in partiesSorted"
                        :key="party.id"
                    >
                        <template v-if="x === index + 1">
                            <PartyIcon
                                v-if="!('isUser' in party)"
                                :party-id="party.id"
                                class="group h-full w-full absolute block bg-white bg-contain border-2 rounded-md transform transition-all duration-150 hover:duration-300 scale-90 hover:scale-150 opacity-70 hover:opacity-100"
                            >
                                <span
                                    class="party-name transition-all opacity-0 group-hover:opacity-90 hidden group-hover:inline-block overflow-visible absolute bg-white rounded"
                                >
                                    {{ party.name }}
                                </span>
                            </PartyIcon>
                            <span
                                v-else
                                class="h-full w-full absolute block bg-contain transform -translate-y-1 transition-all duration-150 hover:duration-300 z-30 scale-90 hover:scale-150 hover:-translate-y-4"
                                :style="{ backgroundImage: `url(${locationMarker})` }"
                            />
                        </template>
                    </template>
                </span>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IPartyWithOrientation } from "@/api";
import { ICompassOrientation, IUserCompassOrientation } from "@/interfaces/compass-orientation.inteface";
import { getPartyOrientation } from "@/utils/calculations";
import { PropType, computed, ref } from "vue";
import locationMarker from "../assets/locationMarker.svg";
import AxisLabel from "./AxisLabel.vue";
import useQuizStore from "@/store";
import PartyIcon from "./PartyIcon.vue";

const props = defineProps({
    parties: {
        type: Array as PropType<IPartyWithOrientation[]>,
        required: true,
    },
});

const store = useQuizStore();

const userCompassOrientation = ref(null as null | ICompassOrientation);
const partiesSorted = ref([] as (IPartyWithOrientation | IUserCompassOrientation)[]);

const quizCompleted = computed(() => store.quizCompleted);

if (quizCompleted.value) {
    const answers = store.answers;
    userCompassOrientation.value = getPartyOrientation(answers);
    const userCompass: IUserCompassOrientation = {
        ...userCompassOrientation.value!,
        isUser: true
    };
    partiesSorted.value = [
        ...props.parties, 
        userCompass
    ].sort((a, b) => b.eastWest - a.eastWest);
}
</script>

<style scoped>
.equal-height {
    padding-bottom: calc(100% - 2px);
}

.square-red {
    @apply bg-red-200;
}

.square-red span {
    @apply border-red-200;
}

.square-blue {
    @apply bg-blue-200;
}

.square-blue span {
    @apply border-blue-200;
}

.square-green {
    @apply bg-green-200;
}

.square-green span {
    @apply border-green-200;
}

.square-yellow {
    @apply bg-yellow-200;
}

.square-yellow span {
    @apply border-yellow-200;
}</style>
