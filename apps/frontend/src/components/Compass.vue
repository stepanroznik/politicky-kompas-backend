<template>
    <div class="relative border-4 border-gray-400 rounded">
        <axis-label class="absolute -top-6 left-1/2 z-20 transform -translate-x-1/2">
            Autoritářství
            <span class="hidden lg:inline">
                &nbsp;/ přísná pravidla
            </span>
        </axis-label>
        <axis-label class="absolute -bottom-6 left-1/2 z-20 transform -translate-x-1/2">
            Libertariánství
            <span class="hidden lg:inline">
                &nbsp;/ osobní svoboda
            </span>
        </axis-label>
        <axis-label class="absolute left-0 top-1/2 z-20 -mt-4 transform lg:-translate-x-1/2">
            Levice
        </axis-label>
        <axis-label class="absolute right-0 top-1/2 z-20 -mt-4 transform lg:translate-x-1/2">
            Pravice
        </axis-label>
        <div class="grid grid-rows-10 grid-cols-10 w-full h-full border border-white">
            <template
                v-for="x in 10"
                :key="x"
            >
                <template
                    v-for="y in 10"
                    :key="y"
                >
                    <span
                        class="border border-white relative w-full h-full equal-height not-hover:scale-110 transform hover:z-10 not-hover:border-2 not-hover:-my-px transition-all"
                        :class="{
                            'square-red': x <= 5 && y <= 5,
                            'square-blue': x <= 5 && y > 5,
                            'square-green': x > 5 && y <= 5,
                            'square-yellow': x > 5 && y > 5,
                            'not-z-30': userCompassOrentation && y === userCompassOrentation.leftRight + 6 && x === userCompassOrentation.topBottom + 6,
                        }"
                    >
                        <template
                            v-for="party in parties"
                            :key="party.id"
                        >
                            <PartyIcon
                                v-if="y === party.leftRight + 6 && x === party.topBottom + 6"
                                class="group h-full w-full absolute block bg-contain border-2 rounded-md bg-white transform transition-all duration-150 hover:duration-300 scale-90 z-10 hover:z-30 hover:scale-150 opacity-70 hover:opacity-100"
                                :party-id="party.id"
                            >
                                <span
                                    class="party-name transition-all opacity-0 group-hover:opacity-90 hidden group-hover:inline-block overflow-visible absolute bg-white rounded"
                                >
                                    <span>{{ party.name }}</span>
                                </span>
                            </PartyIcon>
                        </template>
                        <span
                            v-if="userCompassOrentation && y === userCompassOrentation.leftRight + 6 && x === userCompassOrentation.topBottom + 6"
                            class="h-full w-full absolute block bg-contain transform pointer-events-none -translate-y-1 transition-all duration-150 hover:duration-300 z-20 scale-90 hover:scale-150 hover:-translate-y-4"
                            :style="{ backgroundImage: `url(${locationMarker})` }"
                        />
                    </span>
                </template>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ICompassOrientation } from "@/interfaces/compass-orientation.interface";
import { getPartyOrientation } from "@/utils/calculations";
import { PropType, ref } from "vue";
import locationMarker from "../assets/locationMarker.svg";
import AxisLabel from "./AxisLabel.vue";
import { IPartyWithOrientation } from "@/api";
import useQuizStore from "@/store";
import PartyIcon from "./PartyIcon.vue";

defineProps({
    parties: {
        type: Array as PropType<IPartyWithOrientation[]>,
        required: true,
    },
});

const store = useQuizStore();

const userCompassOrentation = ref(null as null | ICompassOrientation);

if (store.quizCompleted) {
    const userAnswers = store.answers;
    userCompassOrentation.value = getPartyOrientation(userAnswers);
    console.log("User orientation:", userCompassOrentation.value);
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
}
</style>
