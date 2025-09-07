<template>
    <div
        v-if="questions.length && parties.length"
        class="grid gap-6 py-4"
    >
        <div
            v-for="question in questions"
            :key="question.id"
        >
            <span class="pb-2 flex flex-row items-center">
                <span class="h-4 w-4 mr-2 text-gray-500 font-semibold leading-3 select-none">
                    <svg
                        v-if="['top','bottom','left','right'].includes(question.position)"
                        xmlns="http://www.w3.org/2000/svg"
                        class="transform"
                        :class="{'rotate-90': question.position === 'left', '-rotate-90': question.position === 'right', 'rotate-180': question.position === 'top'}"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <template v-else>
                        {{ question.position === 'center' ? '●' : question.position[0] }}
                    </template>
                </span>
                <h3 class="text-left font-medium sm:w-2/3">
                    {{ question.title }}
                </h3>
            </span>
            <div class="grid grid-cols-6 gap-1">
                <div
                    v-for="(i, index) in [5,4,3,2,1,undefined]"
                    :key="i"
                    class="border-2 rounded-md py-2"
                    :class="
                        index === 0 ? 'border-green-300' : 
                        index === 1 ? 'border-green-300' :  
                        index === 2 ? 'border-yellow-300' :  
                        index === 3 ? 'border-red-300' :  
                        index === 4 ? 'border-red-300' :  
                        'border-gray-300' "
                >
                    <svg
                        class="inline-block sm:hidden h-5 w-5 mb-2"
                        :class="
                            index === 0 ? 'text-green-500 transform rotate-0' : 
                            index === 1 ? 'text-green-500 transform rotate-45' :  
                            index === 2 ? 'text-yellow-500 transform rotate-90' :
                            index === 3 ? 'text-red-500 transform rotate-135' :  
                            index === 4 ? 'text-red-500 transform rotate-180' :  
                            'hidden' "
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    ><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span
                        v-if="index === 5"
                        class="sm:hidden inline-block mb-1 font-bold text-gray-500 text-md transform -translate-y-1"
                    >
                        ?
                    </span>
                        
                    <span class="text-xs md:text-sm hidden sm:inline-block">
                        {{
                            index === 0 ? 'Souhlasí' : 
                            index === 1 ? 'Spíše souhlasí' :  
                            index === 2 ? 'Neutrální' :  
                            index === 3 ? 'Spíše nesouhlasí' :  
                            index === 4 ? 'Nesouhlasí' :  
                            'Neví/neodpověděli' 
                        }}
                    </span>
                    <div class="flex flex-shrink-0 flex-wrap justify-center">
                        <template
                            v-for="party in parties"
                            :key="party.id"
                        >
                            <template v-if="(i == party.Answers.find((a) => a.Question.id === question.id)?.agreeLevel) || (!i && party.Answers.find((a) => a.Question.id === question.id)?.agreeLevel == 0)">
                                <span
                                    v-if="'isUser' in party"
                                    class="h-10 w-10 block transform scale-90 opacity-70 group"
                                    :style="{ backgroundImage: `url(${locationMarker})` }"
                                />
                                <PartyIcon
                                    v-else
                                    :party-id="party.id"
                                    class="h-10 w-10 block transform scale-90 opacity-70 group border-2 rounded-md bg-white bg-contain transition-all duration-150 hover:z-10 hover:duration-300 hover:scale-150 hover:opacity-100"
                                >
                                    <span
                                        v-if="!('isUser' in party)"
                                        class="party-name transition-all opacity-0 group-hover:opacity-90 hidden group-hover:inline-block overflow-visible absolute bg-white rounded"
                                    >
                                        <span class="">{{ party.name }}</span>
                                    </span>
                                </PartyIcon>
                            </template>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <loading v-else />
</template>

<script setup lang="ts">
import Loading from '@/components/Loading.vue';
import { IUserResult } from '@/interfaces/user-result.interface';
import useQuizStore from '@/store';
import { ref } from 'vue';
import { IPartyWithAnswers, apiGet } from '../api/index';
import locationMarker from '../assets/locationMarker.svg';
import PartyIcon from '@/components/PartyIcon.vue';

const store = useQuizStore();

const parties = ref([] as (IPartyWithAnswers | IUserResult)[]);
const questions = ref([]);

(async () => {
    questions.value = await apiGet({ url: 'questions' });
    parties.value = [ ...store.parties, { Answers: store.answers, isUser: true } ];
    console.log('parties with user', parties.value);
})();
</script>
